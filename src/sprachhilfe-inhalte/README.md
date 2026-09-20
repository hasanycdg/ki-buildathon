# Kurs-Inhalte — die erklärende Hälfte der Sprachhilfe

216 Aufgaben für vier Bereiche (Housekeeping, Rezeption, Frühstück & Buffet,
Öffentliche Bereiche). Anders als der reine Wortschatz erklären sie das
**Warum**: Abläufe, Hygiene, Sicherheit, Hausstandard — jede Aufgabe mit einer
Begründung in einfachem Deutsch.

Aufbau: `Rolle → Units → Lessons → Exercises`. Datenmodell steht in `types.js`.
Aufgabentypen: `choice`, `vocab`, `build`, `order`, `match`, `truefalse`.

Gelesen wird das hier von `src/sprachhilfe/` — im Reiter ist es der dritte
Bereich, **Kurs**. Die Bereiche **Lernen** und **Trainieren** kommen dagegen aus
`src/data/hotelVokabeln.json` (397 Begriffe, siebensprachig).

„Lernen" (`src/learn/`) nutzt diesen Ordner **nicht**: dort geht es um
Handgriffe, hier um Sprache.

## Sprachen

Jedes Navigations-Label (Rolle, Einheit, Lektion) liegt in allen Sprachen der
Oberfläche vor: `de, en, pl, hr, sr, sl` — plus `tr` und `sk`, die noch aus der
ersten Fassung stammen.

Die `vocab`-Aufgaben haben zusätzlich ein Feld `tr` mit Übersetzungen nach
`en / tr / sk`. Das ist historisch und deckt sich nicht mit den Sprachen des
Wortschatzes. Wer eine Sprache ergänzt, ergänzt sie dort.

## Neue Aufgabe aufnehmen

    { id: "hk-99", type: "truefalse",
      statement: "Bei einer Bleibe wechselst du die Bettwäsche immer.",
      answer: false,
      explain: "..." }

Pflicht: eindeutige `id` mit Rollen-Präfix und `explain` in einfachem Deutsch.

## Prüfen

    node src/sprachhilfe/validate.mjs

Spielt jede Kurs- und jede Wortaufgabe in jeder Sprache mit der richtigen
Antwort durch und prüft, dass genau eine Option stimmt.
