// Full-screen fluid ink cursor effect (WebGL). Follows mouse/touch in Devora brand colors.
// Flow: React mounts canvas → WebGL builds fluid shaders → each frame simulates ink → mouse/touch injects splats.
// Loaded lazily via SplashCursorClient.tsx so it doesn't block first paint.
// vocab: WebGL = browser API that talks to the GPU for real-time graphics

/* eslint-disable prefer-const, react-hooks/exhaustive-deps */
'use client';

import { useEffect, useRef } from 'react';

// --- COLORS: Devora brand stops for the fluid ink splashes ---
// Matches DEVORA title / devora-gradient-text color stops.
// Manipulate here: add/remove hex stops to change which colors the ink can splash.
const DEVORA_PALETTE = [
  '#ffd76f',
  '#ff9a3d',
  '#ff9a2e',
  '#ff5ca8',
  '#ff006e',
  '#ff2bd6',
  '#a855f7',
  '#6b21a8',
];

// Main fluid-cursor component — props tune sim quality, ink fade, and splat force.
// Manipulate here (defaults below):
//   SIM_RESOLUTION ↑ = finer flow math, heavier GPU; ↓ = cheaper, mushier
//   DYE_RESOLUTION ↑ = sharper visible ink; ↓ = blurrier but faster
//   DENSITY_DISSIPATION ↑ = ink fades faster; ↓ = trails linger longer
//   VELOCITY_DISSIPATION ↑ = motion dies quicker; ↓ = swirls keep spinning
//   CURL ↑ = more energetic swirls; SPLAT_FORCE ↑ = stronger mouse shove
//   SPLAT_RADIUS ↑ = bigger blobs; COLOR_UPDATE_SPEED ↑ = palette cycles faster
//   RAINBOW_MODE true = HSV random instead of DEVORA_PALETTE; SHADING false = flat ink
function SplashCursor({
  // vocab: SIM_RESOLUTION = how fine the velocity grid is (physics)
  SIM_RESOLUTION = 128,
  // vocab: DYE_RESOLUTION = how fine the visible ink texture is (look)
  DYE_RESOLUTION = 1440,
  CAPTURE_RESOLUTION = 512,
  // vocab: dissipation = how fast a field fades toward empty each frame
  DENSITY_DISSIPATION = 2.1,
  VELOCITY_DISSIPATION = 1.35,
  PRESSURE = 0.1,
  // More iterations = smoother incompressible flow, more GPU work per frame
  PRESSURE_ITERATIONS = 20,
  CURL = 3.5,
  SPLAT_RADIUS = 0.38,
  SPLAT_FORCE = 9500,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
  RAINBOW_MODE = false,
  // Fallback hex when a palette pick fails (also used if you empty DEVORA_PALETTE)
  COLOR = '#ff5ca8'
}) {
  // Hold the canvas DOM node + the running animation frame id.
  // vocab: useRef = React box that keeps a value across renders without re-drawing the UI
  const canvasRef = useRef(null);
  // vocab: requestAnimationFrame id — saved so cleanup can cancel the loop
  const animationFrameId = useRef(null);

  // One-time setup: WebGL, shaders, input listeners, then start the render loop.
  // vocab: useEffect = run side effects after React paints (here: boot WebGL once on mount)
  // vocab/symbol: [] at the end = empty dependency list → run once, not every render
  useEffect(() => {
    const canvas = canvasRef.current;
    // Guard — canvas not mounted yet
    if (!canvas) return;

    // Flip to false in cleanup so the animation loop stops
    let isActive = true;

    // Template for one pointer (mouse or finger) tracking position + ink color.
    // vocab: prototype = constructor-style object factory (older JS pattern for “new X()”)
    function pointerPrototype() {
      this.id = -1;
      this.texcoordX = 0;
      this.texcoordY = 0;
      this.prevTexcoordX = 0;
      this.prevTexcoordY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.down = false;
      this.moved = false;
      this.color = [0, 0, 0];
    }

    // Mutable sim settings — copied from props so we can lower quality on weak GPUs.
    // vocab: SIM_RESOLUTION = how fine the velocity grid is; DYE_RESOLUTION = how fine the visible ink is
    let config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
      RAINBOW_MODE,
      COLOR
    };

    let pointers = [new pointerPrototype()];

    // --- CONFIG / WebGL setup — create context, check float textures, pick formats ---
    const { gl, ext } = getWebGLContext(canvas);
    // Weak GPUs: drop dye resolution and turn shading off.
    // vocab/symbol: ! means NOT — runs when the GPU cannot filter float textures smoothly
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    // Prefer WebGL2; fall back to WebGL1 + half-float extensions.
    // vocab: getContext = ask the canvas for a drawing API (WebGL2 or WebGL1)
    function getWebGLContext(canvas) {
      // vocab: alpha = allow transparent pixels so the page shows through the ink
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false
      };
      let gl = canvas.getContext('webgl2', params);
      const isWebGL2 = !!gl;
      // vocab/symbol: !! turns a value into true/false (“truthy → true, falsy → false”)
      // vocab/symbol: || means OR — try the next context if the previous failed
      if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

      let halfFloat;
      let supportLinearFiltering;
      // WebGL2 vs WebGL1 need different float-texture extensions.
      // vocab: extension = optional GPU feature the browser may or may not support
      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      }
      // vocab: clearColor = default RGBA used when we wipe the canvas/framebuffer
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
      let formatRGBA;
      let formatRG;
      let formatR;

      // Pick the best float formats this GPU can actually render to.
      // vocab: RGBA16F = 16-bit float red/green/blue/alpha — needed for fluid math, not just 0–255 colors
      if (isWebGL2) {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
      } else {
        // WebGL1 often only supports RGBA float — reuse it for RG/R too
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering
        }
      };
    }

    // If this format can't render, try a wider channel layout (R → RG → RGBA).
    // vocab: internalFormat = how GPU stores the texture; format = how we read/write channels
    function getSupportedFormat(gl, internalFormat, format, type) {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        // Fall back to more channels until something works
        switch (internalFormat) {
          case gl.R16F:
            return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
          case gl.RG16F:
            return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }

    // Tiny test: can we attach this texture format to a framebuffer?
    // vocab: framebuffer (FBO) = off-screen render target — draw into a texture instead of the visible canvas
    function supportRenderTextureFormat(gl, internalFormat, format, type) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // vocab: NEAREST = nearest-pixel sampling (no blur); CLAMP_TO_EDGE = don’t wrap past 0..1
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      // vocab: FRAMEBUFFER_COMPLETE = GPU says this FBO setup is valid to render into
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    // Shader program that can swap #define keywords (e.g. SHADING on/off).
    // vocab: Material = cache of compiled shader variants keyed by feature flags
    class Material {
      constructor(vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
      }
      // Compile (or reuse) a variant for the given keyword list
      setKeywords(keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
        let program = this.programs[hash];
        // First time we see this keyword set — compile a new program
        if (program == null) {
          let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
          program = createProgram(this.vertexShader, fragmentShader);
          this.programs[hash] = program;
        }
        // Already bound — nothing to do
        if (program === this.activeProgram) return;
        // vocab: uniforms = named inputs JS feeds the GPU each draw (textures, floats, vec2s)
        this.uniforms = getUniforms(program);
        this.activeProgram = program;
      }
      // Make this program the one the GPU will use next
      bind() {
        gl.useProgram(this.activeProgram);
      }
    }

    // Fixed vertex+fragment pair (no keyword variants).
    // vocab: Program = one linked GPU pipeline (vertex shader + fragment shader)
    class Program {
      constructor(vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
      }
      bind() {
        gl.useProgram(this.program);
      }
    }

    // Link vertex + fragment into one GPU program.
    // vocab: link = combine compiled shaders into a runnable program object
    function createProgram(vertexShader, fragmentShader) {
      let program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.trace(gl.getProgramInfoLog(program));
      return program;
    }

    // Collect every uniform location by name for easy gl.uniform* calls later.
    // vocab: getUniformLocation = GPU “address” of a uniform so we can set it from JS
    function getUniforms(program) {
      let uniforms = [];
      let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
      return uniforms;
    }

    // Compile GLSL; optional keywords become #define lines at the top.
    // vocab: GLSL = OpenGL Shading Language — the text language shaders are written in
    function compileShader(type, source, keywords) {
      source = addKeywords(source, keywords);
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.trace(gl.getShaderInfoLog(shader));
      return shader;
    }

    // Prepend #define KEYWORD lines when a shader needs feature flags.
    // vocab: #define = compile-time flag (like turning SHADING code on/off)
    function addKeywords(source, keywords) {
      if (!keywords) return source;
      let keywordsString = '';
      keywords.forEach(keyword => {
        keywordsString += '#define ' + keyword + '\n';
      });
      return keywordsString + source;
    }

    // --- GLSL shaders (GPU programs for each fluid step) ---
    // vocab: shader = tiny GPU program. Vertex = places corners; fragment = colors each pixel.

    // Shared vertex shader — full-screen quad + neighbor UVs (left/right/top/bottom)
    const baseVertexShader = compileShader(
      gl.VERTEX_SHADER,
      `
        // --- CONFIG: vertex pass for full-screen fluid steps ---
        // vocab: precision highp float = use high-accuracy decimals on the GPU
        precision highp float;
        // vocab: attribute = per-vertex input from JS (here: corner of the full-screen quad)
        // vocab: vec2 = two floats packed together (x, y)
        attribute vec2 aPosition;
        // vocab: varying = value passed from vertex → fragment (interpolated across the quad)
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        // vocab: uniform = same input for every vertex/pixel this draw (here: 1/width, 1/height)
        // vocab: texelSize = size of one texture pixel in 0..1 UV space
        uniform vec2 texelSize;

        void main () {
            // Map clip-space (−1..1) position to 0..1 UV
            // vocab: UV = texture coordinates; (0,0) = bottom-left, (1,1) = top-right
            vUv = aPosition * 0.5 + 0.5;
            // Neighbor samples one texel away (used by curl/pressure/display)
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            // vocab: gl_Position = where this corner lands on screen (−1..1 on both axes = full canvas)
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `
    );

    // Copy one texture straight into another (used when resizing FBOs)
    const copyShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- RENDER: passthrough copy ---
        // vocab: precision mediump = “medium accuracy floats” — faster on phones/laptops
        precision mediump float;
        // vocab: sampler2D = a 2D texture you can look up with texture2D(...)
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            // vocab: texture2D = read the color at this UV from the texture
            // vocab: gl_FragColor = the final RGBA this pixel outputs
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `
    );

    // Multiply texture by a scalar (pressure fade each frame)
    const clearShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- RENDER: scale texture by value ---
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        // vocab: float = one decimal number (here: how much pressure to keep)
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `
    );

    // Final on-screen look — optional SHADING lighting + alpha from brightness
    const displayShaderSource = `
      // --- RENDER: draw dye to screen (optional 3D-ish shading) ---
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      // Optional gamma helper (kept from original; display path mainly uses raw RGB)
      // vocab: vec3 = three floats (usually red, green, blue)
      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          // vocab: pow = raise each channel to a power (gamma curve)
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          // vocab: .rgb = just the color channels (ignore alpha for lighting)
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              // Fake lighting from neighbor brightness differences
              // vocab: #ifdef = include this block only if SHADING was #define'd
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              // vocab: length = distance from zero (brightness of the RGB vector)
              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              // vocab: normalize = shrink a vector to length 1 (direction only)
              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              // vocab: dot = how aligned two directions are; clamp = force into a min..max range
              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          // Alpha from brightest channel so bright ink is more opaque
          float a = max(c.r, max(c.g, c.b));
          // vocab: vec4 = four floats (r, g, b, a)
          gl_FragColor = vec4(c, a);
      }
    `;

    // Add a soft circular blob of velocity or dye at the pointer
    const splatShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- INPUT: circular splat of color/force at point ---
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        // vocab: point = splat center in UV space (0..1 across the canvas)
        uniform vec2 point;
        uniform float radius;

        void main () {
            // Offset from splat center; fix X so circles stay round on wide screens
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            // vocab: exp = e^x — here a soft falloff (bright at center, fades out)
            // vocab: dot(p,p) = length² of the offset (cheaper than sqrt)
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            // Add splat on top of whatever was already in the target texture
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `
    );

    // Move ink/velocity along the flow field; dissipation fades it over time.
    // vocab: advection = “carry this field along with the flow” (ink rides the velocity)
    const advectionShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- MOTION: advect (carry) a field along velocity ---
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        // vocab: dt = delta time (seconds since last frame) — keeps motion frame-rate stable
        uniform float dt;
        uniform float dissipation;

        // Manual bilinear sample when GPU lacks linear float filtering
        // vocab: bilerp = bilinear interpolation — blend 4 neighboring texels
        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            // vocab: floor = whole-number cell; fract = leftover 0..1 inside that cell
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            // vocab: mix(a,b,t) = blend from a→b by t (0=a, 1=b)
            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                // Trace backward along velocity to find where this pixel’s ink came from
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            // Divide by >1 to fade the field each frame
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,
      // vocab/symbol: ? : = ternary — if linear filtering works use null, else enable MANUAL_FILTERING
      ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
    );

    // How much fluid is "piling up" (used by pressure solve).
    // vocab: divergence = measure of whether flow is spreading out (+) or sucking in (−)
    const divergenceShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- MOTION: velocity divergence ---
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            // Sample neighbor velocity components
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            // Bounce at edges — flip the component so flow reflects
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `
    );

    // Spin of the velocity field (feeds vorticity confinement).
    // vocab: curl / vorticity = how much the flow is swirling at this pixel
    const curlShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- MOTION: curl / vorticity of velocity ---
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `
    );

    // Push velocity along swirl so the fluid keeps looking energetic.
    // vocab: vorticity confinement = nudge the flow to preserve swirls (stops looking mushy)
    const vorticityShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- MOTION: vorticity confinement force ---
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        // vocab: curl uniform = strength slider for how much swirl energy to reinject
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            // Direction toward stronger curl; scale by local vorticity
            // vocab: abs = absolute value (drop the minus sign)
            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            // Clamp so extreme forces can't explode the sim
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
    );

    // One Jacobi iteration of the pressure Poisson solve.
    // vocab: Jacobi iteration = repeatedly average neighbors to solve a grid equation
    const pressureShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- MOTION: pressure solve step ---
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            // Average neighbor pressure, corrected by local divergence
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `
    );

    // Subtract pressure gradient so the flow becomes incompressible.
    // vocab: incompressible = fluid doesn't create/destroy volume (no expanding air bubbles)
    // vocab: gradient = how pressure changes left↔right and bottom↔top
    const gradientSubtractShader = compileShader(
      gl.FRAGMENT_SHADER,
      `
        // --- MOTION: subtract pressure gradient from velocity ---
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            // Push flow away from high pressure toward low pressure
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `
    );

    // Draw a full-screen quad into a framebuffer (or the real canvas if target is null).
    // vocab: blit = copy/draw a full-screen pass in one shot
    // vocab: IIFE (()=>{...})() = run this setup once and keep the returned draw function
    const blit = (() => {
      // Two triangles making a rectangle that covers the whole clip space (−1..1)
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      // vocab: indices 0,1,2 and 0,2,3 = two triangles sharing a diagonal
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      return (target, clear = false) => {
        // null target = draw to the visible canvas
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        // vocab: drawElements = draw using the index buffer (6 indices = 2 triangles)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

    // Simulation textures (created in initFramebuffers).
    // vocab: dye = visible ink colors; velocity = flow arrows; pressure/curl/divergence = physics helpers
    let dye, velocity, divergence, curl, pressure;

    // Wire each GLSL string into a runnable Program / Material
    const copyProgram = new Program(baseVertexShader, copyShader);
    const clearProgram = new Program(baseVertexShader, clearShader);
    const splatProgram = new Program(baseVertexShader, splatShader);
    const advectionProgram = new Program(baseVertexShader, advectionShader);
    const divergenceProgram = new Program(baseVertexShader, divergenceShader);
    const curlProgram = new Program(baseVertexShader, curlShader);
    const vorticityProgram = new Program(baseVertexShader, vorticityShader);
    const pressureProgram = new Program(baseVertexShader, pressureShader);
    const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);
    const displayMaterial = new Material(baseVertexShader, displayShaderSource);

    // Create or resize the ping-pong textures the sim writes into each frame.
    // vocab: ping-pong = two buffers — read from A, write to B, then swap roles next pass
    function initFramebuffers() {
      let simRes = getResolution(config.SIM_RESOLUTION);
      let dyeRes = getResolution(config.DYE_RESOLUTION);
      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
      gl.disable(gl.BLEND);

      // Dye = visible ink (higher res). Create once, resize if canvas changed.
      if (!dye)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
      else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

      // Velocity field (lower sim resolution for speed)
      if (!velocity)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
      else
        velocity = resizeDoubleFBO(
          velocity,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );

      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    }

    // One render target: texture + framebuffer + size helpers.
    // vocab: FBO = Frame Buffer Object — off-screen canvas the GPU can draw into
    function createFBO(w, h, internalFormat, format, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      // Allocate empty w×h storage (null = no initial pixel data)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      let fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);

      let texelSizeX = 1.0 / w;
      let texelSizeY = 1.0 / h;
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        // Bind this texture to a texture unit so a shader can sample it
        // vocab: texture unit = numbered slot (0, 1, 2…) a sampler2D reads from
        attach(id) {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        }
      };
    }

    // Ping-pong pair — read from one, write to the other, then swap.
    // vocab: get/set = property accessors so `.read` / `.write` look like fields but run code
    function createDoubleFBO(w, h, internalFormat, format, type, param) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read() {
          return fbo1;
        },
        set read(value) {
          fbo1 = value;
        },
        get write() {
          return fbo2;
        },
        set write(value) {
          fbo2 = value;
        },
        // After writing, flip so the new result becomes the next read source
        swap() {
          let temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        }
      };
    }

    // Grow/shrink one FBO and copy old pixels into the new one
    function resizeFBO(target, w, h, internalFormat, format, type, param) {
      let newFBO = createFBO(w, h, internalFormat, format, type, param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
      blit(newFBO);
      return newFBO;
    }

    // Resize a ping-pong pair; no-op if size already matches
    function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1.0 / w;
      target.texelSizeY = 1.0 / h;
      return target;
    }

    // Turn SHADING keyword on/off for the display material
    function updateKeywords() {
      let displayKeywords = [];
      if (config.SHADING) displayKeywords.push('SHADING');
      displayMaterial.setKeywords(displayKeywords);
    }

    updateKeywords();
    initFramebuffers();
    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;

    // --- RENDER loop — simulate fluid, apply pointer input, draw each frame ---
    function updateFrame() {
      // Stop after cleanup
      if (!isActive) return;
      const dt = calcDeltaTime();
      // Window resized → rebuild textures at the new size
      if (resizeCanvas()) initFramebuffers();
      updateColors(dt);
      applyInputs();
      step(dt);
      render(null);
      // vocab: requestAnimationFrame = ask the browser to call us again before the next paint
      animationFrameId.current = requestAnimationFrame(updateFrame);
    }

    // Seconds since last frame, capped so big pauses don't explode the sim
    function calcDeltaTime() {
      let now = Date.now();
      let dt = (now - lastUpdateTime) / 1000;
      dt = Math.min(dt, 0.016666);
      lastUpdateTime = now;
      return dt;
    }

    // Match canvas backing store to CSS size × devicePixelRatio; return true if changed.
    // vocab: devicePixelRatio = Retina scale (2 on many Macs) — more pixels for sharpness
    function resizeCanvas() {
      let width = scaleByPixelRatio(canvas.clientWidth);
      let height = scaleByPixelRatio(canvas.clientHeight);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
      }
      return false;
    }

    // Periodically pick a new ink color for each pointer (COLORS)
    function updateColors(dt) {
      colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
        pointers.forEach(p => {
          p.color = generateColor();
        });
      }
    }

    // If the pointer moved this frame, inject a splat of force + dye
    function applyInputs() {
      pointers.forEach(p => {
        if (p.moved) {
          p.moved = false;
          splatPointer(p);
        }
      });
    }

    // One fluid simulation tick: curl → vorticity → divergence → pressure → advect.
    // Order matters — each pass feeds the next (classic GPU fluid pipeline).
    function step(dt) {
      // vocab: BLEND off — physics passes replace pixels, they don't alpha-blend
      gl.disable(gl.BLEND);
      // Curl of velocity
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);

      // Vorticity confinement — keeps swirls looking lively
      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      // Divergence of the velocity field
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      // Soften previous pressure, then iterate the pressure solve.
      // vocab: uniform1f / uniform2f / uniform1i = send 1 float / 2 floats / 1 int into a shader uniform
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write);
      pressure.swap();

      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      // More iterations = smoother, more expensive pressure field
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      // Make velocity divergence-free
      gradienSubtractProgram.bind();
      gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      // Advect velocity through itself, then advect dye through velocity
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      let velocityId = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
      gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    // Composite dye onto the screen with alpha blending.
    // vocab: blendFunc = how new pixels mix with what's already on screen
    function render(target) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      drawDisplay(target);
    }

    // Bind display shader and blit dye (optionally with shading texel size)
    function drawDisplay(target) {
      let width = target == null ? gl.drawingBufferWidth : target.width;
      let height = target == null ? gl.drawingBufferHeight : target.height;
      displayMaterial.bind();
      if (config.SHADING) gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
      gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
      blit(target);
    }

    // Drag splat — force scales with pointer movement
    function splatPointer(pointer) {
      let dx = pointer.deltaX * config.SPLAT_FORCE;
      let dy = pointer.deltaY * config.SPLAT_FORCE;
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
    }

    // Click/tap burst — brighter color + random kick
    function clickSplat(pointer) {
      const color = generateColor();
      color.r *= 10.0;
      color.g *= 10.0;
      color.b *= 10.0;
      let dx = 10 * (Math.random() - 0.5);
      let dy = 30 * (Math.random() - 0.5);
      splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
    }

    // Write force into velocity, then color into dye, at (x, y)
    function splat(x, y, dx, dy, color) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
      blit(velocity.write);
      velocity.swap();

      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write);
      dye.swap();
    }

    // Keep splat circles round on wide screens
    function correctRadius(radius) {
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) radius *= aspectRatio;
      return radius;
    }

    // Mouse/touch down — store UV coords (Y flipped) and pick a color.
    // vocab: texcoord = texture coordinate 0..1; Y is flipped because canvas Y grows down, UV grows up
    function updatePointerDownData(pointer, id, posX, posY) {
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
      pointer.color = generateColor();
    }

    // Mouse/touch move — compute delta since last sample
    function updatePointerMoveData(pointer, posX, posY, color) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      pointer.color = color;
    }

    // Mouse/touch up
    function updatePointerUpData(pointer) {
      pointer.down = false;
    }

    // Aspect-correct horizontal motion
    function correctDeltaX(delta) {
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio < 1) delta *= aspectRatio;
      return delta;
    }

    // Aspect-correct vertical motion
    function correctDeltaY(delta) {
      let aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) delta /= aspectRatio;
      return delta;
    }

    // --- COLORS: hex → dim RGB used as ink ---
    function hexToRGB(hex) {
      let val = hex.replace('#', '');
      // Expand #abc → #aabbcc
      if (val.length === 3) val = val[0] + val[0] + val[1] + val[1] + val[2] + val[2];
      const r = parseInt(val.slice(0, 2), 16) / 255;
      const g = parseInt(val.slice(2, 4), 16) / 255;
      const b = parseInt(val.slice(4, 6), 16) / 255;
      // Dim so stacked splats don't blow out to white
      return { r: r * 0.15, g: g * 0.15, b: b * 0.15 };
    }

    // Pick ink color — rainbow HSV or random Devora palette stop
    function generateColor() {
      if (config.RAINBOW_MODE) {
        let c = HSVtoRGB(Math.random(), 1.0, 1.0);
        c.r *= 0.15;
        c.g *= 0.15;
        c.b *= 0.15;
        return c;
      }
      // vocab/symbol: ?? means if palette pick is missing, use config.COLOR
      const hex =
        DEVORA_PALETTE[Math.floor(Math.random() * DEVORA_PALETTE.length)] ?? config.COLOR;
      return hexToRGB(hex);
    }

    // Convert HSV → RGB (used by rainbow mode)
    function HSVtoRGB(h, s, v) {
      let r, g, b, i, f, p, q, t;
      i = Math.floor(h * 6);
      f = h * 6 - i;
      p = v * (1 - s);
      q = v * (1 - f * s);
      t = v * (1 - (1 - f) * s);
      // Six hue sectors around the color wheel
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
        default:
          break;
      }
      return { r, g, b };
    }

    // Keep a value looping inside [min, max)
    function wrap(value, min, max) {
      const range = max - min;
      if (range === 0) return min;
      return ((value - min) % range) + min;
    }

    // Map a base resolution to width/height that match the canvas aspect ratio
    function getResolution(resolution) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);
      if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
      else return { width: min, height: max };
    }

    // CSS pixels → device pixels (Retina etc.)
    function scaleByPixelRatio(input) {
      // vocab/symbol: || 1 = if devicePixelRatio is missing, treat it as 1
      const pixelRatio = window.devicePixelRatio || 1;
      return Math.floor(input * pixelRatio);
    }

    // Simple string hash — keys Material shader variants by keyword list
    function hashCode(s) {
      if (s.length === 0) return 0;
      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        // vocab/symbol: << = bit-shift left (fast *32-ish mix); |= 0 forces a 32-bit int
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0;
      }
      return hash;
    }

    // --- INPUT — mouse and touch move the fluid splashes ---
    // Click injects a bright burst; move injects continuous drag splats
    function handleMouseDown(e) {
      let pointer = pointers[0];
      // vocab: clientX/Y = pointer position in CSS pixels relative to the viewport
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      updatePointerDownData(pointer, -1, posX, posY);
      clickSplat(pointer);
    }

    // First move seeds a color; later moves reuse the pointer's current color
    let firstMouseMoveHandled = false;
    function handleMouseMove(e) {
      let pointer = pointers[0];
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      if (!firstMouseMoveHandled) {
        let color = generateColor();
        updatePointerMoveData(pointer, posX, posY, color);
        firstMouseMoveHandled = true;
      } else {
        updatePointerMoveData(pointer, posX, posY, pointer.color);
      }
    }

    // Finger down — same as mouse down but may have multiple touches
    function handleTouchStart(e) {
      // vocab: targetTouches = fingers currently on this element
      const touches = e.targetTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerDownData(pointer, touches[i].identifier, posX, posY);
      }
    }

    function handleTouchMove(e) {
      const touches = e.targetTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(pointer, posX, posY, pointer.color);
      }
    }

    function handleTouchEnd(e) {
      // vocab: changedTouches = fingers that just lifted
      const touches = e.changedTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        updatePointerUpData(pointer);
      }
    }

    // Listen on window so ink follows the cursor even over other UI
    // vocab: addEventListener = register a function to run when that browser event happens
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, false);
    window.addEventListener('touchend', handleTouchEnd);

    // Kick off the animation loop
    updateFrame();

    // --- CLEANUP — stop animation and remove listeners when component unmounts ---
    // vocab: cleanup return = React runs this when the component leaves the page
    return () => {
      isActive = false;

      if (animationFrameId.current) {
        // vocab: cancelAnimationFrame = stop the loop we scheduled with requestAnimationFrame
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Full-screen transparent canvas overlay — pointer-events none so clicks pass through.
  // vocab: pointer-events: none = this layer never steals clicks; UI underneath still works
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 5,
        pointerEvents: 'none',
        width: '100%',
        height: '100%'
      }}
    >
      {/* vocab: canvas = HTML drawing surface; WebGL paints into this every frame */}
      <canvas
        ref={canvasRef}
        id="fluid"
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          background: 'transparent',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default SplashCursor;
