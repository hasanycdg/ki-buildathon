import React from "react";

/**
 * Badezimmer. Zwei Verwendungen:
 *  - Vorfuehrung der Reinigungsreihenfolge (frame 0..4): vom Saubersten
 *    zum Schmutzigsten, damit keine Keime verschleppt werden.
 *  - Buehne fuer Kontrollaufgaben (Zonen kommen aus dem Inhalt).
 */
export default function BathScene({ frame = -1, dim = false }) {
  // frame -1 = neutrale Darstellung (fuer Hotspots)
  const active = (n) => (frame === n ? 1 : 0);
  const done = (n) => (frame > n ? 1 : 0);

  return (
    <svg viewBox="0 0 480 300" className={"scene" + (dim ? " dim" : "")} role="img" aria-label="Badezimmer">
      <rect x="0" y="0" width="480" height="236" fill="#f2f7fc" />
      <rect x="0" y="236" width="480" height="64" fill="#dfe8f3" />
      {/* Fliesenraster */}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" y1={52 + i * 46} x2="480" y2={52 + i * 46} stroke="#e3ebf6" strokeWidth="2" />
      ))}

      {/* --- Spiegel (Schritt 1) --- */}
      <rect x="54" y="42" width="104" height="74" rx="4" fill="#e8f2fe" stroke="#a9c3e8" strokeWidth="3" />
      <path d="M62 108 L150 50" stroke="#ffffff" strokeWidth="9" opacity="0.7" />
      <circle cx="106" cy="79" r="30" fill="none" stroke="#2468f2" strokeWidth="3"
        opacity={active(0)} style={{ transition: "opacity .35s" }} />
      <circle cx="146" cy="52" r="11" fill="#42b766" opacity={done(0)} style={{ transition: "opacity .35s" }} />

      {/* --- Waschbecken (Schritt 2) --- */}
      <rect x="62" y="128" width="88" height="14" rx="4" fill="#cfdcee" />
      <path d="M72 142 Q106 176 140 142 Z" fill="#ffffff" stroke="#bccbe2" strokeWidth="2.5" />
      <rect x="102" y="112" width="8" height="18" rx="3" fill="#9fb0c8" />
      <circle cx="106" cy="150" r="30" fill="none" stroke="#2468f2" strokeWidth="3"
        opacity={active(1)} style={{ transition: "opacity .35s" }} />
      <circle cx="146" cy="132" r="11" fill="#42b766" opacity={done(1)} style={{ transition: "opacity .35s" }} />

      {/* --- Dusche (Schritt 3) --- */}
      <rect x="216" y="40" width="130" height="196" rx="5" fill="#eaf3fd" stroke="#a9c3e8" strokeWidth="3" />
      <rect x="216" y="220" width="130" height="16" rx="3" fill="#d2e0f2" />
      <circle cx="252" cy="62" r="9" fill="#9fb0c8" />
      <path d="M252 72 L246 96 M252 72 L252 100 M252 72 L258 96" stroke="#bccbe2" strokeWidth="2.5" />
      {/* Abfluss - wird oft vergessen */}
      <circle cx="281" cy="228" r="7" fill="#b3c2d8" stroke="#8fa0bd" strokeWidth="2" />
      <rect x="248" y="150" width="70" height="4" rx="2" fill="#cfe0f4" opacity="0.9" />
      <rect x="230" y="60" width="102" height="170" rx="4" fill="none" stroke="#2468f2" strokeWidth="3"
        opacity={active(2)} style={{ transition: "opacity .35s" }} />
      <circle cx="334" cy="54" r="11" fill="#42b766" opacity={done(2)} style={{ transition: "opacity .35s" }} />

      {/* --- WC (Schritt 4, immer zuletzt) --- */}
      <rect x="386" y="150" width="56" height="86" rx="7" fill="#ffffff" stroke="#bccbe2" strokeWidth="2.5" />
      <rect x="380" y="96" width="68" height="54" rx="6" fill="#f4f8fd" stroke="#bccbe2" strokeWidth="2.5" />
      <ellipse cx="414" cy="162" rx="22" ry="10" fill="#e8f0fa" stroke="#bccbe2" strokeWidth="2" />
      <rect x="392" y="90" width="12" height="8" rx="3" fill="#9fb0c8" />
      <rect x="372" y="86" width="86" height="160" rx="6" fill="none" stroke="#e0405d" strokeWidth="3"
        opacity={active(3)} style={{ transition: "opacity .35s" }} />
      <circle cx="446" cy="92" r="11" fill="#42b766" opacity={done(3)} style={{ transition: "opacity .35s" }} />

      {/* Handtuchhalter */}
      <rect x="166" y="150" width="8" height="58" rx="3" fill="#cfdcee" />
      <rect x="160" y="150" width="20" height="30" rx="4" fill="#ffffff" stroke="#c7d3e6" strokeWidth="2" />

      {/* Fertig */}
      <g opacity={frame >= 4 ? 1 : 0} style={{ transition: "opacity .4s" }}>
        <circle cx="190" cy="266" r="19" fill="#42b766" />
        <path d="M181 266 l6 7 l13 -14" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
