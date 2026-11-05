// Matrix Rain with runes animated background for the Settings Page.
// Recolored to Devora's signature Orange -> Pink -> Magenta gradient palette (strictly no gold/yellow).

"use client";

// ===== IMPORTS =====

import ShaderBackgroundCanvas from "./ShaderBackgroundCanvas";

// ===== NAMED CONSTANTS =====

const MATRIX_RAIN_FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uTheme;

#define iResolution vec3(uResolution.x, uResolution.y, 1.0)
#define iTime uTime
#define iMouse vec4(0.0)
#define PI 3.14159265359

const float SPEED = 1.0;
const float GLOW  = 1.25;

const int ITERATIONS = 36;
const float STRIP_CHARS_MIN = 7.0;
const float STRIP_CHARS_MAX = 40.0;
const float STRIP_CHAR_HEIGHT = 0.15;
const float STRIP_CHAR_WIDTH = 0.10;
const float ZCELL_SIZE = 1.0 * (STRIP_CHAR_HEIGHT * STRIP_CHARS_MAX);
const float XYCELL_SIZE = 12.0 * STRIP_CHAR_WIDTH;

const int BLOCK_SIZE = 10;
const int BLOCK_GAP = 2;

const float WALK_SPEED = 1.0 * XYCELL_SIZE;
const float BLOCKS_BEFORE_TURN = 3.0;

// ---- random ----

float rainHash1(float v) {
  return fract(sin(v) * 43758.5453123);
}

float rainHash2(vec2 v) {
  return rainHash1(dot(v, vec2(5.3983, 5.4427)));
}

vec2 rainHash22(vec2 v) {
  vec2 res = vec2(dot(v, vec2(127.1, 311.7)), dot(v, vec2(269.5, 183.3)));
  return fract(sin(res) * 43758.5453123);
}

vec4 rainHash42(vec2 v) {
  vec4 p = vec4(
    dot(v, vec2(127.1, 311.7)),
    dot(v, vec2(269.5, 183.3)),
    dot(v, vec2(113.5, 271.9)),
    dot(v, vec2(246.1, 124.6))
  );
  return fract(sin(p) * 43758.5453123);
}

vec4 rainHash43(vec3 v) {
  vec4 p = vec4(
    dot(v, vec3(127.1, 311.7, 74.7)),
    dot(v, vec3(269.5, 183.3, 246.1)),
    dot(v, vec3(113.5, 271.9, 124.6)),
    dot(v, vec3(271.9, 269.5, 311.7))
  );
  return fract(sin(p) * 43758.5453123);
}

// ---- Devora brand colors: Orange -> Pink -> Magenta (strictly NO yellow/gold) ----

vec3 rainPalette(float t) {
  t = fract(t) * 4.0;
  float f = smoothstep(0.0, 1.0, fract(t));
  vec3 a = vec3(1.000, 0.604, 0.239); // Devora Orange (#ff9a3d)
  vec3 b = vec3(1.000, 0.361, 0.659); // Devora Pink (#ff5ca8)
  vec3 c = vec3(1.000, 0.169, 0.839); // Devora Magenta (#ff2bd6)
  vec3 d = vec3(0.850, 0.100, 0.650); // Deep rich magenta (#dc1aae)
  if (t < 1.0) return mix(a, b, f);
  if (t < 2.0) return mix(b, c, f);
  if (t < 3.0) return mix(c, d, f);
  return mix(d, a, f);
}

// ---- symbols (runes) ----

float runeLine(vec2 p, vec2 a, vec2 b) {
  p -= a;
  b -= a;
  float h = clamp(dot(p, b) / dot(b, b), 0.0, 1.0);
  return length(p - b * h);
}

float rune(vec2 U, vec2 seed, float highlight) {
  float d = 1e5;
  for (int i = 0; i < 4; i++) {
    vec4 pos = rainHash42(seed);
    seed += 1.0;

    if (i == 0) pos.y = 0.0;
    if (i == 1) pos.x = 0.999;
    if (i == 2) pos.x = 0.0;
    if (i == 3) pos.y = 0.999;

    vec4 snaps = vec4(2.0, 3.0, 2.0, 3.0);
    pos = (floor(pos * snaps) + 0.5) / snaps;

    if (any(notEqual(pos.xy, pos.zw))) {
      d = min(d, runeLine(U, pos.xy, pos.zw + 0.001));
    }
  }
  return smoothstep(0.1, 0.0, d) + highlight * smoothstep(0.4, 0.0, d);
}

float randomChar(vec2 outer, vec2 inner, float highlight) {
  vec2 seed = vec2(dot(outer, vec2(269.5, 183.3)), dot(outer, vec2(113.5, 271.9)));
  return rune(inner, seed, highlight);
}

// ---- digital rain ----

vec3 rain(vec3 ro3, vec3 rd3, float time) {
  vec4 result = vec4(0.0);

  vec2 ro2 = vec2(ro3.xy);
  vec2 rd2 = normalize(vec2(rd3.xy));

  bool prefer_dx = abs(rd2.x) > abs(rd2.y);
  float t3_to_t2 = prefer_dx ? rd3.x / rd2.x : rd3.y / rd2.y;

  ivec3 cell_side = ivec3(step(0.0, rd3.x), step(0.0, rd3.y), step(0.0, rd3.z));
  ivec3 cell_shift = ivec3(rd3.x >= 0.0 ? 1 : -1, rd3.y >= 0.0 ? 1 : -1, rd3.z >= 0.0 ? 1 : -1);

  float t2 = 0.0;
  ivec2 next_cell = ivec2(floor(ro2 / XYCELL_SIZE));
  for (int i = 0; i < ITERATIONS; i++) {
    ivec2 cell = next_cell;
    float t2s = t2;

    vec2 side = (vec2(next_cell) + vec2(cell_side.xy)) * XYCELL_SIZE;
    vec2 t2_side = (side - ro2) / rd2;
    if (t2_side.x < t2_side.y) {
      t2 = t2_side.x;
      next_cell.x += cell_shift.x;
    } else {
      t2 = t2_side.y;
      next_cell.y += cell_shift.y;
    }

    vec2 cell_in_block = fract(vec2(cell) / float(BLOCK_SIZE));
    float gap = float(BLOCK_GAP) / float(BLOCK_SIZE);
    if (cell_in_block.x < gap || cell_in_block.y < gap || (cell_in_block.x < (gap + 0.1) && cell_in_block.y < (gap + 0.1))) {
      continue;
    }

    float t3s = t2s / t3_to_t2;

    float pos_z = ro3.z + rd3.z * t3s;
    float xycell_hash = rainHash2(vec2(cell));
    float z_shift = xycell_hash * 11.0 - time * (0.5 + xycell_hash * 1.0 + xycell_hash * xycell_hash * 1.0 + pow(xycell_hash, 16.0) * 3.0);
    float char_z_shift = floor(z_shift / STRIP_CHAR_HEIGHT);
    z_shift = char_z_shift * STRIP_CHAR_HEIGHT;
    int zcell = int(floor((pos_z - z_shift) / ZCELL_SIZE));
    for (int j = 0; j < 2; j++) {
      vec4 cell_hash = rainHash43(vec3(float(cell.x), float(cell.y), float(zcell)));
      vec4 cell_hash2 = fract(cell_hash * vec4(127.1, 311.7, 271.9, 124.6));

      float chars_count = cell_hash.w * (STRIP_CHARS_MAX - STRIP_CHARS_MIN) + STRIP_CHARS_MIN;
      float target_length = chars_count * STRIP_CHAR_HEIGHT;
      float target_rad = STRIP_CHAR_WIDTH / 2.0;
      float target_z = (float(zcell) * ZCELL_SIZE + z_shift) + cell_hash.z * (ZCELL_SIZE - target_length);
      vec2 target = vec2(cell) * XYCELL_SIZE + target_rad + cell_hash.xy * (XYCELL_SIZE - target_rad * 2.0);

      vec2 s = target - ro2;
      float tmin = dot(s, rd2);
      if (tmin >= t2s && tmin <= t2) {
        float u = s.x * rd2.y - s.y * rd2.x;
        if (abs(u) < target_rad) {
          u = (u / target_rad + 1.0) / 2.0;
          float z = ro3.z + rd3.z * tmin / t3_to_t2;
          float v = (z - target_z) / target_length;
          if (v >= 0.0 && v < 1.0) {
            float c = floor(v * chars_count);
            float q = fract(v * chars_count);
            vec2 char_hash = rainHash22(vec2(c + char_z_shift, cell_hash2.x));
            if (char_hash.x >= 0.1 || c == 0.0) {
              float time_factor = floor(c == 0.0 ? time * 5.0 :
                time * (1.0 * cell_hash2.z + cell_hash2.w * cell_hash2.w * 4.0 * pow(char_hash.y, 4.0)));
              float a = randomChar(vec2(char_hash.x, time_factor), vec2(u, q), max(1.0, 3.0 - c / 2.0) * 0.2);
              a *= clamp((chars_count - 0.5 - c) / 2.0, 0.0, 1.0);
              if (a > 0.0) {
                float attenuation = 1.0 + pow(0.06 * tmin / t3_to_t2, 2.0);
                vec3 col = (c == 0.0 ? vec3(1.0, 0.94, 0.98) : rainPalette(cell_hash2.x + c / chars_count * 0.35)) / attenuation;
                float a1 = result.a;
                result.a = a1 + (1.0 - a1) * a;
                result.xyz = (result.xyz * a1 + col * (1.0 - a1) * a) / result.a;
                if (result.a > 0.98) return result.xyz;
              }
            }
          }
        }
      }
      zcell += cell_shift.z;
    }
  }

  return result.xyz * result.a;
}

// ---- camera helpers ----

vec2 rainRotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * v;
}

vec3 rainRotateX(vec3 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * v;
}

vec3 rainRotateY(vec3 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c) * v;
}

vec3 rainRotateZ(vec3 v, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * v;
}

float rainSmooth1(float x) {
  return smoothstep(0.0, 1.0, x);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = (fragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;

  float time = iTime * SPEED;

  vec2 look = iMouse.z > 0.0 ? (iMouse.xy / iResolution.xy - 0.5) : vec2(0.0);

  float turn_rad = 0.25 / BLOCKS_BEFORE_TURN;
  float turn_abs_time = (PI / 2.0 * turn_rad) * 1.5;
  float turn_time = turn_abs_time / (1.0 - 2.0 * turn_rad + turn_abs_time);

  float level1_size = float(BLOCK_SIZE) * BLOCKS_BEFORE_TURN * XYCELL_SIZE;
  float level2_size = 4.0 * level1_size;
  float gap_size = float(BLOCK_GAP) * XYCELL_SIZE;

  vec3 ro = vec3(gap_size / 2.0, gap_size / 2.0, 0.0);
  vec3 rd = vec3(uv.x, 2.0, uv.y);

  float tq = fract(time / (level2_size * 4.0) * WALK_SPEED);
  float t8 = fract(tq * 4.0);
  float t1 = fract(t8 * 8.0);

  vec2 prev;
  vec2 dir;
  if (tq < 0.25) {
    prev = vec2(0.0, 0.0);
    dir = vec2(0.0, 1.0);
  } else if (tq < 0.5) {
    prev = vec2(0.0, 1.0);
    dir = vec2(1.0, 0.0);
  } else if (tq < 0.75) {
    prev = vec2(1.0, 1.0);
    dir = vec2(0.0, -1.0);
  } else {
    prev = vec2(1.0, 0.0);
    dir = vec2(-1.0, 0.0);
  }
  float angle = floor(tq * 4.0);

  prev *= 4.0;

  const float first_turn_look_angle = 0.4;
  const float second_turn_drift_angle = 0.5;
  const float fifth_turn_drift_angle = 0.25;

  vec2 turn;
  float turn_sign = 0.0;
  vec2 dirL = rainRotate(dir, -PI / 2.0);
  vec2 dirR = -dirL;
  float up_down = 0.0;
  float rotate_on_turns = 1.0;
  float roll_on_turns = 1.0;
  float add_angel = 0.0;
  if (t8 < 0.125) {
    turn = dirL;
    turn_sign = -1.0;
    angle -= first_turn_look_angle * (max(0.0, t1 - (1.0 - turn_time * 2.0)) / turn_time - max(0.0, t1 - (1.0 - turn_time)) / turn_time * 2.5);
    roll_on_turns = 0.0;
  } else if (t8 < 0.250) {
    prev += dir;
    turn = dir;
    dir = dirL;
    angle -= 1.0;
    turn_sign = 1.0;
    add_angel += first_turn_look_angle * 0.5 + (-first_turn_look_angle * 0.5 + 1.0 + second_turn_drift_angle) * t1;
    rotate_on_turns = 0.0;
    roll_on_turns = 0.0;
  } else if (t8 < 0.375) {
    prev += dir + dirL;
    turn = dirR;
    turn_sign = 1.0;
    add_angel += second_turn_drift_angle * sqrt(1.0 - t1);
  } else if (t8 < 0.5) {
    prev += dir + dir + dirL;
    turn = dirR;
    dir = dirR;
    angle += 1.0;
    turn_sign = 0.0;
    up_down = sin(t1 * PI) * 0.37;
  } else if (t8 < 0.625) {
    prev += dir + dir;
    turn = dir;
    dir = dirR;
    angle += 1.0;
    turn_sign = -1.0;
    up_down = sin(-min(1.0, t1 / (1.0 - turn_time)) * PI) * 0.37;
  } else if (t8 < 0.750) {
    prev += dir + dir + dirR;
    turn = dirL;
    turn_sign = -1.0;
    add_angel -= (fifth_turn_drift_angle + 1.0) * rainSmooth1(t1);
    rotate_on_turns = 0.0;
    roll_on_turns = 0.0;
  } else if (t8 < 0.875) {
    prev += dir + dir + dir + dirR;
    turn = dir;
    dir = dirL;
    angle -= 1.0;
    turn_sign = 1.0;
    add_angel -= fifth_turn_drift_angle - rainSmooth1(t1) * (fifth_turn_drift_angle * 2.0 + 1.0);
    rotate_on_turns = 0.0;
    roll_on_turns = 0.0;
  } else {
    prev += dir + dir + dir;
    turn = dirR;
    turn_sign = 1.0;
    angle += fifth_turn_drift_angle * (1.5 * min(1.0, (1.0 - t1) / turn_time) - 0.5 * rainSmooth1(1.0 - min(1.0, t1 / (1.0 - turn_time))));
  }

  up_down += -0.7 * look.y;
  angle += add_angel + look.x;

  rd = rainRotateX(rd, up_down);

  vec2 p;
  if (turn_sign == 0.0) {
    p = prev + dir * (turn_rad + 1.0 * t1);
  } else if (t1 > (1.0 - turn_time)) {
    float tr = (t1 - (1.0 - turn_time)) / turn_time;
    vec2 c = prev + dir * (1.0 - turn_rad) + turn * turn_rad;
    p = c + turn_rad * rainRotate(dir, (tr - 1.0) * turn_sign * PI / 2.0);
    angle += tr * turn_sign * rotate_on_turns;
    rd = rainRotateY(rd, sin(tr * turn_sign * PI) * 0.2 * roll_on_turns);
  } else {
    t1 /= (1.0 - turn_time);
    p = prev + dir * (turn_rad + (1.0 - turn_rad * 2.0) * t1);
  }

  rd = rainRotateZ(rd, angle * PI / 2.0);

  ro.xy += level1_size * p;

  ro += rd * 0.2;
  rd = normalize(rd);

  vec3 col = rain(ro, rd, time) * GLOW;

  // Adapt background ground for theme
  if (uTheme > 0.5) {
    col = mix(vec3(0.97, 0.95, 0.98), col, 0.85);
  } else {
    col += vec3(0.04, 0.03, 0.045);
  }

  col = clamp(col, 0.0, 1.0);
  col *= 1.0 - 0.15 * dot(uv * 0.5, uv * 0.5);

  fragColor = vec4(col, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

// ===== TYPES =====

export type IsoShaderBackgroundProps = {
  className?: string;
  fixed?: boolean;
};

// ===== MAIN COMPONENT =====

export default function IsoShaderBackground({
  className,
  fixed,
}: IsoShaderBackgroundProps) {
  return (
    <ShaderBackgroundCanvas
      className={className}
      fixed={fixed}
      fragmentShaderSource={MATRIX_RAIN_FRAGMENT_SHADER_SOURCE}
      resolutionScale={0.75}
    />
  );
}
