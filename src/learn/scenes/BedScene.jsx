import React from "react";

/**
 * Bett beziehen — animierte Schnittdarstellung.
 * Die Schichten bauen sich mit dem Frame-Index auf, so wie in echt:
 * Matratze -> Leintuch -> Ecken -> Decke -> Polster.
 *
 * Bewusst schematisch statt fotorealistisch: Man sieht die REIHENFOLGE
 * und die Ecken, worauf es beim Hausstandard ankommt.
 */
export default function BedScene({ frame = 0 }) {
  const on = (n) => (frame >= n ? 1 : 0);
  const slide = (n, from) => (frame >= n ? 0 : from);

  return (
    <svg viewBox="0 0 420 240" className="scene" role="img" aria-label="Bett beziehen">
      <defs>
        <linearGradient id="sheet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#e8eef9" />
        </linearGradient>
        <linearGradient id="duvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbe6fb" /><stop offset="100%" stopColor="#bcd0f2" />
        </linearGradient>
      </defs>

      {/* Bettgestell */}
      <rect x="40" y="150" width="340" height="16" rx="4" fill="#9aa7c0" />
      <rect x="52" y="166" width="14" height="40" rx="3" fill="#7d8ba6" />
      <rect x="354" y="166" width="14" height="40" rx="3" fill="#7d8ba6" />
      <rect x="30" y="96" width="14" height="70" rx="4" fill="#7d8ba6" />

      {/* Matratze — immer sichtbar */}
      <rect x="44" y="118" width="332" height="34" rx="8" fill="#f3f6fb" stroke="#c7d3e6" strokeWidth="2" />
      {/* Fleck, den man beim Pruefen findet (Frame 0) */}
      <ellipse cx="250" cy="135" rx="17" ry="9" fill="#d8c08a"
        opacity={frame === 0 ? 0.85 : 0} style={{ transition: "opacity .4s" }} />
      <text x="250" y="108" textAnchor="middle" fontSize="11" fill="#a6791f" fontWeight="700"
        opacity={frame === 0 ? 1 : 0} style={{ transition: "opacity .4s" }}>
        Fleck? Melden!
      </text>

      {/* Leintuch — schiebt sich von rechts ein */}
      <g opacity={on(1)} style={{ transition: "opacity .45s, transform .6s", transform: `translateX(${slide(1, 120)}px)` }}>
        <rect x="40" y="112" width="340" height="30" rx="7" fill="url(#sheet)" stroke="#c7d3e6" strokeWidth="1.5" />
      </g>

      {/* Ecken gespannt — die Laschen klappen unter die Matratze */}
      <g opacity={on(2)} style={{ transition: "opacity .45s" }}>
        <path d="M40 112 L40 150 L62 150 Z" fill="#dce5f4" stroke="#b9c8e0" strokeWidth="1.5" />
        <path d="M380 112 L380 150 L358 150 Z" fill="#dce5f4" stroke="#b9c8e0" strokeWidth="1.5" />
        <circle cx="52" cy="140" r="13" fill="none" stroke="#42b766" strokeWidth="2.5"
          strokeDasharray="82" strokeDashoffset={frame >= 2 ? 0 : 82}
          style={{ transition: "stroke-dashoffset .6s .2s" }} />
        <circle cx="368" cy="140" r="13" fill="none" stroke="#42b766" strokeWidth="2.5"
          strokeDasharray="82" strokeDashoffset={frame >= 2 ? 0 : 82}
          style={{ transition: "stroke-dashoffset .6s .35s" }} />
      </g>

      {/* Decke — faellt von oben */}
      <g opacity={on(3)} style={{ transition: "opacity .45s, transform .6s", transform: `translateY(${slide(3, -60)}px)` }}>
        <rect x="120" y="100" width="258" height="44" rx="9" fill="url(#duvet)" stroke="#a8c0e8" strokeWidth="1.5" />
        <path d="M120 122 Q 150 114 180 122 T 240 122 T 300 122 T 378 122"
          fill="none" stroke="#a8c0e8" strokeWidth="1.2" opacity="0.8" />
      </g>

      {/* Polster — aufgeschuettelt */}
      <g opacity={on(4)} style={{ transition: "opacity .45s" }}>
        <rect x="52" y="92" width="74" height="36" rx="12" fill="#ffffff" stroke="#c7d3e6" strokeWidth="1.8"
          style={{ transformOrigin: "89px 110px", transform: frame >= 4 ? "scale(1)" : "scale(.7)", transition: "transform .45s" }} />
      </g>

      {/* Fertig-Haken */}
      <g opacity={frame >= 5 ? 1 : 0} style={{ transition: "opacity .4s" }}>
        <circle cx="352" cy="62" r="20" fill="#42b766" />
        <path d="M343 62 l6 7 l13 -14" fill="none" stroke="#fff" strokeWidth="3.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
