// Interactive Celestial Sun & Moon Neo-Brutalist Theme Switcher.
// Features a cosmic day/night track, rotating solar corona rays,
// detailed lunar craters, sparkling stars, drifting clouds, and tactile 3D bounce physics.

"use client";

import { useTheme } from "./DarkLightMode";

export default function DarkLightButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode (day)" : "Switch to dark mode (night)";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      role="switch"
      aria-checked={!isDark}
      className="celestial-toggle"
    >
      {/* Sky Canvas Track */}
      <span className={`sky-track ${isDark ? "is-night" : "is-day"}`} aria-hidden="true">
        {/* Night Sky: 4 Twinkling Stars */}
        <span className="stars-layer">
          <svg className="star star-1" viewBox="0 0 10 10" width="8" height="8">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#ffd76f" />
          </svg>
          <svg className="star star-2" viewBox="0 0 10 10" width="6" height="6">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#ffffff" />
          </svg>
          <svg className="star star-3" viewBox="0 0 10 10" width="5" height="5">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#ff9a3d" />
          </svg>
          <svg className="star star-4" viewBox="0 0 6 6" width="4" height="4">
            <circle cx="3" cy="3" r="2" fill="#ffffff" />
          </svg>
        </span>

        {/* Day Sky: Stylized Fluffy Clouds */}
        <span className="clouds-layer">
          <svg className="cloud cloud-1" viewBox="0 0 32 18" width="26" height="15">
            <path
              d="M6 14 C3 14 1 12 1 9 C1 6.5 3 4.5 5.5 4.5 C6.5 2 9 0.5 12 0.5 C15.5 0.5 18.5 2.5 19.5 5.5 C20.5 5 21.5 4.5 23 4.5 C26 4.5 28.5 6.8 28.5 9.5 C28.5 10 28.3 10.5 28 11 C29.5 11.5 30.5 13 30.5 14.5 C30.5 16.5 28.8 17.5 26.5 17.5 L6 17.5 Z"
              fill="#ffffff"
              stroke="#0a0a0a"
              strokeWidth="1.2"
            />
          </svg>
          <svg className="cloud cloud-2" viewBox="0 0 20 12" width="16" height="10">
            <path
              d="M4 10 C2 10 0.5 8.5 0.5 6.5 C0.5 4.8 1.8 3.5 3.5 3.5 C4.2 1.5 6 0.5 8 0.5 C10.5 0.5 12.5 2 13 4 C14 3.8 15 4.2 15.5 5 C16.5 5.5 17.5 6.5 17.5 8 C17.5 9.5 16 10.5 14.5 10.5 L4 10.5 Z"
              fill="#ffffff"
              opacity="0.85"
            />
          </svg>
        </span>

        {/* Sliding Celestial Orb (Sun / Moon) */}
        <span className={`celestial-orb ${isDark ? "is-moon" : "is-sun"}`}>
          {/* Sun Representation */}
          <span className="sun-element">
            {/* Rotating Solar Corona Rays */}
            <svg className="sun-rays" viewBox="0 0 40 40" width="38" height="38">
              <g stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round">
                <line x1="20" y1="2" x2="20" y2="7" />
                <line x1="20" y1="33" x2="20" y2="38" />
                <line x1="2" y1="20" x2="7" y2="20" />
                <line x1="33" y1="20" x2="38" y2="20" />
                <line x1="7.3" y1="7.3" x2="10.8" y2="10.8" />
                <line x1="29.2" y1="29.2" x2="32.7" y2="32.7" />
                <line x1="7.3" y1="32.7" x2="10.8" y2="29.2" />
                <line x1="29.2" y1="10.8" x2="32.7" y2="7.3" />
              </g>
            </svg>
            <span className="sun-core" />
          </span>

          {/* Moon Representation */}
          <span className="moon-element">
            <span className="moon-core">
              {/* Moon Craters */}
              <span className="crater crater-1" />
              <span className="crater crater-2" />
              <span className="crater crater-3" />
            </span>
          </span>
        </span>
      </span>

      <style jsx>{`
        .celestial-toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          user-select: none;
          touch-action: manipulation;
          border-radius: 999px;
          outline: none;
          transition: transform 0.16s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .celestial-toggle:hover {
          transform: translate(-1px, -1px);
        }

        .celestial-toggle:active {
          transform: translate(2px, 2px);
        }

        .sky-track {
          position: relative;
          width: 72px;
          height: 36px;
          border-radius: 999px;
          overflow: hidden;
          display: flex;
          align-items: center;
          transition: background 0.4s cubic-bezier(0.25, 1, 0.5, 1),
                      border-color 0.25s ease,
                      box-shadow 0.25s ease;
        }

        /* Light mode track: Crisp sky cyan to warm golden amber */
        .sky-track.is-day {
          background: linear-gradient(135deg, #38bdf8 0%, #7dd3fc 42%, #ffd76f 100%);
          border: 2.5px solid #0a0a0a;
          box-shadow: 3.5px 3.5px 0px #0a0a0a;
        }

        .celestial-toggle:hover .sky-track.is-day {
          box-shadow: 4.5px 4.5px 0px #0a0a0a;
        }

        .celestial-toggle:active .sky-track.is-day {
          box-shadow: 1.5px 1.5px 0px #0a0a0a;
        }

        /* Dark mode track: Deep midnight violet to obsidian cosmos */
        .sky-track.is-night {
          background: linear-gradient(135deg, #090314 0%, #160b2b 48%, #2d134d 100%);
          border: 2.5px solid rgba(255, 255, 255, 0.45);
          box-shadow: 3.5px 3.5px 0px #000000;
        }

        .celestial-toggle:hover .sky-track.is-night {
          border-color: rgba(255, 255, 255, 0.75);
          box-shadow: 4.5px 4.5px 0px #000000;
        }

        .celestial-toggle:active .sky-track.is-night {
          box-shadow: 1.5px 1.5px 0px #000000;
        }

        /* Stars Layer (active in dark mode) */
        .stars-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .sky-track.is-night .stars-layer {
          opacity: 1;
        }

        .star {
          position: absolute;
          animation: starTwinkle 2.5s infinite ease-in-out;
        }

        .star-1 {
          top: 7px;
          left: 12px;
          animation-delay: 0s;
        }

        .star-2 {
          bottom: 7px;
          left: 24px;
          animation-delay: 0.8s;
        }

        .star-3 {
          top: 8px;
          left: 28px;
          animation-delay: 1.5s;
        }

        .star-4 {
          bottom: 10px;
          left: 10px;
          animation-delay: 0.4s;
          opacity: 0.75;
        }

        @keyframes starTwinkle {
          0%, 100% {
            transform: scale(0.7) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.15) rotate(45deg);
            opacity: 1;
          }
        }

        /* Clouds Layer (active in light mode) */
        .clouds-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.35s ease, transform 0.45s ease;
          transform: translateY(4px);
        }

        .sky-track.is-day .clouds-layer {
          opacity: 1;
          transform: translateY(0);
        }

        .cloud-1 {
          position: absolute;
          bottom: -2px;
          right: 3px;
          filter: drop-shadow(1px 1px 0px #0a0a0a);
          animation: cloudFloat 4s infinite ease-in-out;
        }

        .cloud-2 {
          position: absolute;
          top: 3px;
          right: 18px;
          animation: cloudFloat 5s infinite ease-in-out reverse;
        }

        @keyframes cloudFloat {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(2.5px);
          }
        }

        /* Sliding Celestial Orb */
        .celestial-orb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 2;
        }

        .celestial-orb.is-sun {
          transform: translateX(0px);
        }

        .celestial-orb.is-moon {
          transform: translateX(36px);
        }

        /* Sun Element */
        .sun-element {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transform: scale(1) rotate(0deg);
          transition: opacity 0.28s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .celestial-orb.is-moon .sun-element {
          opacity: 0;
          transform: scale(0.4) rotate(-90deg);
          pointer-events: none;
        }

        .sun-rays {
          position: absolute;
          animation: sunSpin 14s linear infinite;
        }

        .celestial-toggle:hover .sun-rays {
          animation-duration: 4s;
        }

        @keyframes sunSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .sun-core {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fff275 0%, #ffb300 55%, #f57c00 100%);
          border: 2px solid #0a0a0a;
          box-shadow: 1.5px 1.5px 0px #0a0a0a;
          z-index: 1;
        }

        /* Moon Element */
        .moon-element {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transform: scale(1) rotate(0deg);
          transition: opacity 0.28s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .celestial-orb.is-sun .moon-element {
          opacity: 0;
          transform: scale(0.4) rotate(90deg);
          pointer-events: none;
        }

        .moon-core {
          position: relative;
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 45%, #94a3b8 100%);
          border: 2px solid #0a0a0a;
          box-shadow: 1.5px 1.5px 0px #000000;
          overflow: hidden;
        }

        :global(html[data-theme="dark"]) .moon-core {
          border-color: #ffffff;
        }

        /* Moon Craters */
        .crater {
          position: absolute;
          border-radius: 50%;
          background: #64748b;
          border: 1px solid rgba(10, 10, 10, 0.4);
          opacity: 0.85;
        }

        .crater-1 {
          width: 6px;
          height: 6px;
          top: 4px;
          left: 5px;
        }

        .crater-2 {
          width: 4px;
          height: 4px;
          bottom: 4px;
          left: 7px;
        }

        .crater-3 {
          width: 4.5px;
          height: 4.5px;
          top: 9px;
          right: 3.5px;
        }
      `}</style>
    </button>
  );
}
