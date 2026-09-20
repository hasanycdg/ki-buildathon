import React from "react";

/**
 * Hotelzimmer, schematisch von vorne. Dient als Bühne für Kontroll-Aufgaben
 * ("Wo musst du überall schauen?").
 *
 * Die Zonen sind bewusst NICHT hier definiert — sie kommen aus dem
 * Aufgabeninhalt, damit dieselbe Szene für mehrere Aufgaben taugt.
 * Koordinaten sind Prozent, passend zur viewBox 0 0 480 300.
 */
export default function RoomScene({ dim = false }) {
  return (
    <svg viewBox="0 0 480 300" className={"scene" + (dim ? " dim" : "")} role="img" aria-label="Hotelzimmer">
      {/* Wand und Boden */}
      <rect x="0" y="0" width="480" height="232" fill="#f4f7fc" />
      <rect x="0" y="232" width="480" height="68" fill="#e2e9f4" />
      <line x1="0" y1="232" x2="480" y2="232" stroke="#cbd6e8" strokeWidth="2" />

      {/* Fenster mit Vorhang */}
      <rect x="296" y="46" width="118" height="86" rx="4" fill="#dbeafe" stroke="#a9c3e8" strokeWidth="2.5" />
      <line x1="355" y1="46" x2="355" y2="132" stroke="#a9c3e8" strokeWidth="2" />
      <line x1="296" y1="89" x2="414" y2="89" stroke="#a9c3e8" strokeWidth="2" />
      <rect x="276" y="40" width="20" height="104" rx="5" fill="#cbd8ee" />
      <rect x="414" y="40" width="20" height="104" rx="5" fill="#cbd8ee" />

      {/* Tür links, halb offen */}
      <rect x="16" y="52" width="60" height="180" rx="3" fill="#e7edf7" stroke="#b9c8e0" strokeWidth="2.5" />
      <circle cx="66" cy="146" r="4" fill="#8fa0bd" />

      {/* Schrank */}
      <rect x="92" y="62" width="74" height="170" rx="4" fill="#e9eef8" stroke="#b9c8e0" strokeWidth="2.5" />
      <line x1="129" y1="62" x2="129" y2="232" stroke="#b9c8e0" strokeWidth="2" />
      <circle cx="123" cy="150" r="3.5" fill="#8fa0bd" />
      <circle cx="135" cy="150" r="3.5" fill="#8fa0bd" />

      {/* Bett */}
      <rect x="190" y="160" width="180" height="50" rx="7" fill="#ffffff" stroke="#c2cfe4" strokeWidth="2.5" />
      <rect x="198" y="146" width="56" height="26" rx="9" fill="#f2f6fc" stroke="#c2cfe4" strokeWidth="2" />
      <rect x="182" y="132" width="12" height="82" rx="3" fill="#a8b5cc" />
      <rect x="196" y="210" width="10" height="22" rx="2" fill="#8fa0bd" />
      <rect x="354" y="210" width="10" height="22" rx="2" fill="#8fa0bd" />
      {/* Spalt unter dem Bett — dort wird vergessen */}
      <rect x="196" y="206" width="168" height="8" fill="#c3cede" opacity="0.55" />

      {/* Nachttisch mit Lade */}
      <rect x="386" y="176" width="58" height="56" rx="4" fill="#e9eef8" stroke="#b9c8e0" strokeWidth="2.5" />
      <rect x="394" y="188" width="42" height="13" rx="2.5" fill="#d4ddee" stroke="#b9c8e0" strokeWidth="1.5" />
      <circle cx="415" cy="194" r="2.5" fill="#8fa0bd" />

      {/* Schreibtisch mit Minibar darunter */}
      <rect x="92" y="244" width="0" height="0" />
      <rect x="196" y="120" width="0" height="0" />

      {/* Papierkorb */}
      <path d="M150 246 L156 288 L184 288 L190 246 Z" fill="#dde5f2" stroke="#b9c8e0" strokeWidth="2.2" />
      <rect x="146" y="240" width="48" height="8" rx="3" fill="#c8d4e8" />

      {/* Minibar / Kuehlschrank */}
      <rect x="404" y="244" width="58" height="50" rx="4" fill="#e4ebf7" stroke="#b9c8e0" strokeWidth="2.2" />
      <line x1="404" y1="262" x2="462" y2="262" stroke="#b9c8e0" strokeWidth="1.8" />
      <circle cx="456" cy="253" r="2.5" fill="#8fa0bd" />

      {/* Spiegel */}
      <rect x="216" y="44" width="70" height="52" rx="4" fill="#e6f0fd" stroke="#a9c3e8" strokeWidth="2.5" />
    </svg>
  );
}
