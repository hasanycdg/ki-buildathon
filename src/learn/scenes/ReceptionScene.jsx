import React from "react";

/** Rezeptionstresen mit Arbeitsplatz. Fuer Check-in und Uebergabe. */
export default function ReceptionScene({ frame = -1, dim = false }) {
  const on = (n) => (frame >= n ? 1 : 0);
  return (
    <svg viewBox="0 0 480 300" className={"scene" + (dim ? " dim" : "")} role="img" aria-label="Rezeption">
      <rect x="0" y="0" width="480" height="240" fill="#f4f7fc" />
      <rect x="0" y="240" width="480" height="60" fill="#e2e9f4" />

      {/* Rueckwand mit Schluesselfaechern */}
      <rect x="28" y="36" width="150" height="106" rx="4" fill="#eaf0fa" stroke="#bccbe2" strokeWidth="2.5" />
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => (
        <rect key={`${r}-${c}`} x={38 + c * 34} y={46 + r * 32} width="26" height="24" rx="3"
          fill="#ffffff" stroke="#cbd8ea" strokeWidth="1.5" />
      )))}

      {/* Tresen */}
      <rect x="40" y="168" width="400" height="20" rx="5" fill="#c3d0e4" />
      <rect x="56" y="188" width="368" height="56" rx="4" fill="#dde6f4" stroke="#bccbe2" strokeWidth="2" />

      {/* Bildschirm */}
      <rect x="238" y="92" width="112" height="72" rx="5" fill="#0f1f45" />
      <rect x="246" y="100" width="96" height="56" rx="3" fill="#1d3f86" />
      <rect x="252" y="108" width="52" height="5" rx="2.5" fill="#6f9bee" opacity={on(1)} style={{ transition: "opacity .4s" }} />
      <rect x="252" y="120" width="72" height="5" rx="2.5" fill="#4f7fd6" opacity={on(2)} style={{ transition: "opacity .4s" }} />
      <rect x="252" y="132" width="40" height="5" rx="2.5" fill="#4f7fd6" opacity={on(3)} style={{ transition: "opacity .4s" }} />
      <rect x="278" y="164" width="32" height="6" rx="2" fill="#9fb0c8" />

      {/* Zimmerkarte, erscheint spaet */}
      <g opacity={on(4)} style={{ transition: "opacity .45s, transform .45s", transform: `translateY(${frame >= 4 ? 0 : -8}px)` }}>
        <rect x="372" y="150" width="52" height="34" rx="4" fill="#ffffff" stroke="#a9c3e8" strokeWidth="2.5" />
        <rect x="380" y="158" width="26" height="5" rx="2.5" fill="#cbd8ea" />
        <rect x="380" y="168" width="34" height="5" rx="2.5" fill="#e2e9f4" />
      </g>

      {/* Uebergabebuch — der Kern des Case */}
      <rect x="96" y="150" width="62" height="18" rx="3" fill="#f5c869" stroke="#d9a63f" strokeWidth="2" />
      <rect x="100" y="146" width="54" height="6" rx="2" fill="#ffffff" opacity="0.7" />

      {/* Glocke */}
      <path d="M196 166 a14 14 0 0 1 28 0 z" fill="#d6c07a" stroke="#b8a054" strokeWidth="2" />
      <circle cx="210" cy="148" r="4" fill="#b8a054" />

      {/* Gast, angedeutet */}
      <circle cx="410" cy="96" r="20" fill="#cbd8ea" opacity={on(0)} style={{ transition: "opacity .4s" }} />
      <path d="M382 148 a28 30 0 0 1 56 0 z" fill="#cbd8ea" opacity={on(0)} style={{ transition: "opacity .4s" }} />

      <g opacity={frame >= 5 ? 1 : 0} style={{ transition: "opacity .4s" }}>
        <circle cx="200" cy="264" r="19" fill="#42b766" />
        <path d="M191 264 l6 7 l13 -14" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
