import React from "react";

/**
 * Lobby / Gang mit Publikumsverkehr. Zeigt Warnschild, nasse Flaeche,
 * Glastuer und Aufzug — die Themen der oeffentlichen Bereiche.
 */
export default function LobbyScene({ frame = -1, dim = false }) {
  const on = (n) => (frame >= n ? 1 : 0);
  return (
    <svg viewBox="0 0 480 300" className={"scene" + (dim ? " dim" : "")} role="img" aria-label="Lobby">
      <rect x="0" y="0" width="480" height="206" fill="#f4f7fc" />
      <rect x="0" y="206" width="480" height="94" fill="#e4ebf5" />
      <line x1="0" y1="206" x2="480" y2="206" stroke="#cbd6e8" strokeWidth="2" />
      {/* Bodenfugen */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={i * 80} y1="206" x2={i * 96 - 60} y2="300" stroke="#d6dfec" strokeWidth="1.5" />
      ))}

      {/* Glas-Eingangstuer */}
      <rect x="26" y="40" width="116" height="166" rx="4" fill="#e3f0fd" stroke="#a9c3e8" strokeWidth="3" />
      <line x1="84" y1="40" x2="84" y2="206" stroke="#a9c3e8" strokeWidth="2.5" />
      <path d="M36 190 L130 52" stroke="#ffffff" strokeWidth="10" opacity="0.65" />
      <rect x="74" y="112" width="6" height="30" rx="3" fill="#8fa0bd" />
      <rect x="88" y="112" width="6" height="30" rx="3" fill="#8fa0bd" />

      {/* Aufzug */}
      <rect x="330" y="46" width="118" height="160" rx="4" fill="#e9eef8" stroke="#b9c8e0" strokeWidth="3" />
      <line x1="389" y1="46" x2="389" y2="206" stroke="#b9c8e0" strokeWidth="2.5" />
      <rect x="452" y="96" width="18" height="34" rx="4" fill="#dbe4f2" stroke="#b9c8e0" strokeWidth="2" />
      <circle cx="461" cy="106" r="3.5" fill="#8fa0bd" />
      <circle cx="461" cy="120" r="3.5" fill="#8fa0bd" />

      {/* Sitzgruppe */}
      <rect x="168" y="120" width="68" height="40" rx="7" fill="#dbe4f2" stroke="#b9c8e0" strokeWidth="2.5" />
      <rect x="176" y="104" width="52" height="20" rx="6" fill="#e7edf7" stroke="#b9c8e0" strokeWidth="2" />

      {/* Nasse Flaeche */}
      <ellipse cx="246" cy="252" rx="86" ry="30" fill="#bcd7f3" opacity={on(1) ? 0.75 : 0}
        style={{ transition: "opacity .5s" }} />
      <path d="M186 246 q28 -10 58 -2 M212 262 q30 -8 56 0" stroke="#8fc0ec" strokeWidth="2.5" fill="none"
        strokeLinecap="round" opacity={on(1)} style={{ transition: "opacity .5s" }} />

      {/* Warnschild — der entscheidende Handgriff */}
      <g opacity={on(2)} style={{ transition: "opacity .45s, transform .45s", transform: `translateY(${frame >= 2 ? 0 : 14}px)` }}>
        <path d="M300 268 L318 206 L334 206 L352 268 Z" fill="#f5c132" stroke="#d3a017" strokeWidth="2.5" />
        <path d="M326 220 v24" stroke="#5a4405" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="326" cy="252" r="2.6" fill="#5a4405" />
      </g>

      {/* Wischmopp + Wagen */}
      <g opacity={on(0)} style={{ transition: "opacity .4s" }}>
        <rect x="104" y="214" width="60" height="42" rx="5" fill="#dde5f2" stroke="#b9c8e0" strokeWidth="2.5" />
        <circle cx="118" cy="262" r="7" fill="#9aa7c0" />
        <circle cx="150" cy="262" r="7" fill="#9aa7c0" />
        <rect x="160" y="160" width="6" height="96" rx="3" fill="#a8b5cc" transform="rotate(14 163 208)" />
        <path d="M176 250 l26 10 l-6 14 l-26 -10 z" fill="#cbd8ea" stroke="#a8b5cc" strokeWidth="2" />
      </g>

      <g opacity={frame >= 3 ? 1 : 0} style={{ transition: "opacity .4s" }}>
        <circle cx="420" cy="252" r="19" fill="#42b766" />
        <path d="M411 252 l6 7 l13 -14" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
