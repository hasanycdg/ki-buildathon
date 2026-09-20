import React from "react";

/**
 * Fruehstuecksbuffet im Schnitt. Zeigt Niesschutz, Warmhaltebehaelter,
 * Kuehlung und Thermometer — die Dinge, an denen HACCP haengt.
 */
export default function BuffetScene({ frame = -1, dim = false }) {
  const on = (n) => (frame >= n ? 1 : 0);
  const warm = frame >= 2;
  const cold = frame >= 3;

  return (
    <svg viewBox="0 0 480 300" className={"scene" + (dim ? " dim" : "")} role="img" aria-label="Frühstücksbuffet">
      <rect x="0" y="0" width="480" height="242" fill="#fdf7f1" />
      <rect x="0" y="242" width="480" height="58" fill="#f0e6db" />

      {/* Niesschutz */}
      <rect x="54" y="52" width="372" height="8" rx="4" fill="#cfdcee" opacity={on(0)} style={{ transition: "opacity .4s" }} />
      <rect x="54" y="60" width="372" height="58" rx="3" fill="#dceaf8" opacity={on(0) * 0.55}
        stroke="#b6cde6" strokeWidth="2" style={{ transition: "opacity .4s" }} />
      <rect x="62" y="36" width="8" height="24" rx="3" fill="#b3c2d8" opacity={on(0)} />
      <rect x="410" y="36" width="8" height="24" rx="3" fill="#b3c2d8" opacity={on(0)} />

      {/* Tresen */}
      <rect x="40" y="150" width="400" height="18" rx="5" fill="#d8c3a6" />
      <rect x="54" y="168" width="372" height="76" rx="4" fill="#e9dcc9" stroke="#cdb695" strokeWidth="2" />

      {/* Warmhaltebehaelter links */}
      <rect x="74" y="114" width="104" height="36" rx="5" fill="#e6e9ee" stroke="#aeb8c7" strokeWidth="2.5" />
      <rect x="82" y="104" width="88" height="12" rx="4" fill="#cdd5e0" />
      {/* Dampf, wenn heiss */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${100 + i * 26} 100 q6 -12 0 -22`} stroke="#c9b28f" strokeWidth="2.5" fill="none"
          strokeLinecap="round" opacity={warm ? 0.9 : 0} style={{ transition: "opacity .5s" }} />
      ))}
      <rect x="92" y="126" width="68" height="6" rx="3" fill={warm ? "#e2a24a" : "#c8ccd4"} style={{ transition: "fill .5s" }} />
      <text x="126" y="146" textAnchor="middle" fontSize="11" fontWeight="700"
        fill={warm ? "#b06a17" : "#9aa7b8"} style={{ transition: "fill .5s" }}>
        {warm ? "65 °C +" : "kalt"}
      </text>

      {/* Kuehlung rechts */}
      <rect x="302" y="114" width="104" height="36" rx="5" fill="#e8f1fb" stroke="#aec6e0" strokeWidth="2.5" />
      <rect x="318" y="124" width="72" height="8" rx="4" fill={cold ? "#7fb6e8" : "#d5dbe4"} style={{ transition: "fill .5s" }} />
      <text x="354" y="146" textAnchor="middle" fontSize="11" fontWeight="700"
        fill={cold ? "#2d6fa8" : "#9aa7b8"} style={{ transition: "fill .5s" }}>
        {cold ? "max 7 °C" : "zu warm"}
      </text>
      {/* Eiskristall */}
      <g opacity={cold ? 1 : 0} style={{ transition: "opacity .5s" }}>
        <path d="M398 96 v16 M390 100 l16 8 M406 100 l-16 8" stroke="#5fa3dd" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* Brotkorb Mitte */}
      <path d="M208 150 L216 118 L266 118 L274 150 Z" fill="#e0c79b" stroke="#c2a273" strokeWidth="2.5" />
      <ellipse cx="228" cy="120" rx="13" ry="8" fill="#d8a96a" />
      <ellipse cx="252" cy="120" rx="13" ry="8" fill="#cf9d5c" />

      {/* Thermometer mit Liste */}
      <g opacity={on(1)} style={{ transition: "opacity .4s" }}>
        <rect x="196" y="186" width="42" height="52" rx="4" fill="#ffffff" stroke="#c2a273" strokeWidth="2" />
        <line x1="204" y1="198" x2="230" y2="198" stroke="#cbd8ea" strokeWidth="2.5" />
        <line x1="204" y1="210" x2="230" y2="210" stroke="#cbd8ea" strokeWidth="2.5" />
        <line x1="204" y1="222" x2="222" y2="222" stroke="#cbd8ea" strokeWidth="2.5" />
        <rect x="250" y="190" width="7" height="44" rx="3.5" fill="#e6ecf5" stroke="#aeb8c7" strokeWidth="1.5" />
        <circle cx="253.5" cy="234" r="7" fill="#e0405d" />
      </g>

      <g opacity={frame >= 4 ? 1 : 0} style={{ transition: "opacity .4s" }}>
        <circle cx="428" cy="266" r="19" fill="#42b766" />
        <path d="M419 266 l6 7 l13 -14" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
