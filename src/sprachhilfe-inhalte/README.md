# Vokabel-Inhalte — gehören in den Reiter „Sprachhilfe", nicht in „Lernen"

216 Sprachaufgaben für vier Rollen (Housekeeping, Rezeption, Frühstück & Buffet,
Öffentliche Bereiche): deutsche Fachbegriffe mit Übersetzung nach **en / tr / sk**,
je mit Begründung.

Ursprünglich für „Lernen" gebaut. Dort geht es aber um Handgriffe, nicht um
Begriffe — deshalb liegen die Dateien jetzt hier. Die Sidebar hat für Begriffe
einen eigenen Reiter: **Sprachhilfe**.

Wer den Reiter baut, kann das direkt übernehmen. Datenmodell steht in `types.js`.
Aufgabentypen: `choice`, `vocab`, `build`, `order`, `match`, `truefalse`.

Validierung:

    node -e "import('./src/sprachhilfe-inhalte/index.js').then(m=>console.log(m.ROLES.map(r=>r.name)))"

Wenn niemand den Reiter baut, kann der Ordner ersatzlos weg — „Lernen" nutzt ihn nicht.
