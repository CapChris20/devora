import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-mono)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
        display: ["var(--font-display)", "sans-serif"],
        // Body copy: paragraphs, answers, descriptions (never raw monospace)
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        pixel: ["var(--font-pixel)", "monospace"],
        // Design Law (neo-brutalist) fonts — loaded in src/ui/shared/design-law/nb-fonts.ts
        "nb-display": ["var(--font-nb-display)", "Arial Black", "sans-serif"],
        "nb-body": ["var(--font-nb-body)", "system-ui", "sans-serif"],
        "nb-mono": ["var(--font-nb-mono)", "ui-monospace", "monospace"],
      },
      // ===== DESIGN LAW TOKENS (same as Coach Connect's light theme) =====
      // Black/white/gray neo-brutalist chrome; gradients are SECONDARY accents only
      // (pills, avatars, active tab, small strips) — never card or page fills.
      // vocab: nb = neo-brutalist. Namespaced under "nb" so Tailwind's own color scales keep working.
      // Manipulate here: change a hex once and every Design Law page follows.
      colors: {
        nb: {
          ink: "var(--nb-ink, #0A0A0A)",
          paper: "var(--nb-paper, #F2F2F0)",
          white: "var(--nb-white, #FFFFFF)",
          soft: "var(--nb-soft, #E3E3DF)",
          muted: "var(--nb-muted, #575757)",
          // Solid accents for tiny details (dots, underlines)
          pink: "var(--nb-pink, #FF6B9D)",
          orange: "var(--nb-orange, #FB923C)",
        },
      },
      borderColor: {
        nb: {
          ink: "var(--nb-border, #0A0A0A)",
          paper: "var(--nb-paper, #F2F2F0)",
          white: "var(--nb-white, #FFFFFF)",
          soft: "var(--nb-soft, #E3E3DF)",
          pink: "var(--nb-pink, #FF6B9D)",
          orange: "var(--nb-orange, #FB923C)",
        },
      },
      // 3px ink outline on cards/buttons/tabs (Coach Connect nb.borderWidth); border-2 for chips.
      borderWidth: {
        nb: "3px",
      },
      borderRadius: {
        nb: "10px",
      },
      // Hard offset shadows — ink, zero blur, ever. Pressed state = shadow-nb-sm + translate 2px.
      // Manipulate here: bigger first two numbers = chunkier "lifted" look.
      boxShadow: {
        "nb-sm": "2px 2px 0 0 var(--nb-shadow, #0A0A0A)",
        nb: "4px 4px 0 0 var(--nb-shadow, #0A0A0A)",
        "nb-card": "5px 5px 0 0 var(--nb-shadow, #0A0A0A)",
        "nb-lg": "6px 6px 0 0 var(--nb-shadow, #0A0A0A)",
        "nb-modal": "9px 9px 0 0 var(--nb-shadow, #0A0A0A)",
        "nb-toast": "5px 5px 0 0 #FB923C",
      },
      // Secondary accent gradients. Text on any of these is always ink.
      // nb-brand / orchid / sky / blush = Coach Connect accentGradients pairs; nb-accent = brand ramp.
      backgroundImage: {
        "nb-accent":
          "linear-gradient(90deg, #6206F1 0%, #9911E1 20%, #BF25B9 40%, #EB2D85 60%, #FA3467 80%, #FF6A1F 100%)",
        "nb-brand": "linear-gradient(135deg, #FF6B9D 0%, #FB923C 100%)",
        "nb-orchid": "linear-gradient(135deg, #A78BFA 0%, #E879F9 100%)",
        "nb-sky": "linear-gradient(135deg, #7DD3FC 0%, #A78BFA 100%)",
        "nb-blush": "linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)",
      },
      backgroundSize: {
        "nb-pan": "200% 100%",
      },
      // ===== MOTION =====
      // vocab: keyframes = named animation steps; animation = how long / which easing / repeat.
      // Always used behind motion-safe: so "reduce motion" users get a still page.
      keyframes: {
        "nb-rise": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "nb-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        // Manipulate here: slower duration = softer entrance
        "nb-rise": "nb-rise 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "nb-pan": "nb-pan 6s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
