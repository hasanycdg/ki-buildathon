/**
 * Housekeeping — Handgriffe, nicht Vokabeln.
 *
 * Eine Aufgabe (task) ist eine echte Taetigkeit aus der Schicht.
 * Ihre Schritte fuehren durch: erst zeigen, dann selbst machen, dann pruefen.
 *
 * Schritt-Typen
 *   demo      - animierte Vorfuehrung, Frame fuer Frame, mit Erklaertext
 *   hotspot   - "Wo musst du ueberall schauen?" - alle Stellen antippen
 *   sequence  - Arbeitsschritte in die richtige Reihenfolge bringen
 *   checklist - alle zutreffenden Punkte auswaehlen (Mehrfachauswahl)
 *   decide    - Situation aus dem Alltag, eine richtige Reaktion
 */

export const housekeepingTasks = {
  id: "housekeeping",
  name: "Housekeeping",
  tagline: "Zimmer machen nach Hausstandard",
  accent: "#2468f2",
  icon: "BedDouble",
  blurb: "Die Handgriffe, die du wirklich brauchst — vorgemacht, dann selbst gemacht.",
  tasks: [
    {
      id: "hk-bett",
      title: "Bett beziehen",
      goal: "Du beziehst ein Bett mit gespannten Ecken — ohne Falten.",
      minutes: 4,
      steps: [
        {
          type: "demo",
          scene: "bed",
          title: "Schau dir den Ablauf an",
          intro: "Fünf Handgriffe. Achte besonders auf die Ecken — daran sieht man ein gut gemachtes Bett.",
          frames: [
            { caption: "Matratze prüfen",
              detail: "Bevor frische Wäsche draufkommt: Flecken, Risse oder Haare? Dann melden und nicht einfach überdecken." },
            { caption: "Leintuch auflegen",
              detail: "Mittig auflegen und zu beiden Seiten gleich weit überstehen lassen. So reicht der Stoff für alle vier Ecken." },
            { caption: "Ecken spannen",
              detail: "Stoff unter die Matratze ziehen und straff einschlagen. Gespannte Ecken halten die ganze Nacht — lose Ecken rutschen." },
            { caption: "Decke aufziehen",
              detail: "Bezug über die Decke ziehen und ausschütteln, bis die Füllung in allen vier Ecken sitzt." },
            { caption: "Polster aufschütteln",
              detail: "Kräftig aufschütteln und aufrecht ans Kopfteil stellen. Ein platter Polster lässt das ganze Bett ungemacht wirken." },
            { caption: "Fertig",
              detail: "Zum Schluss von der Tür aus draufschauen: Liegt die Decke gerade? Sind die Kanten parallel?" }
          ]
        },
        {
          type: "sequence",
          prompt: "Jetzt du — in welcher Reihenfolge?",
          steps: ["Matratze prüfen", "Leintuch auflegen", "Ecken spannen", "Decke aufziehen", "Polster aufschütteln"],
          explain: "Die Reihenfolge ist kein Ritual: Wer die Ecken erst nach der Decke spannt, muss alles wieder abnehmen."
        },
        {
          type: "decide",
          prompt: "Du ziehst die alte Wäsche ab und siehst einen Fleck auf der Matratze. Was tust du?",
          options: [
            "Leintuch drüber, sieht ja niemand",
            "Matratze wenden und weitermachen",
            "Melden und eintragen, bevor du weiterarbeitest",
            "Zimmer überspringen"
          ],
          answer: 2,
          explain: "Gemeldet ist der Fleck ein Vorfall, den die Hausdame löst. Überdeckt wird er später zu deiner Reklamation."
        },
        {
          type: "checklist",
          prompt: "Was gehört zu einem fertigen Bett? Wähle alles Richtige.",
          items: [
            { label: "Gespannte Ecken ohne Falten", correct: true },
            { label: "Polster aufgeschüttelt", correct: true },
            { label: "Decke mittig und gerade", correct: true },
            { label: "Tagesdecke über dem zerknitterten Leintuch", correct: false },
            { label: "Persönliche Sachen des Gastes aufs Bett gelegt", correct: false }
          ],
          explain: "Eine Tagesdecke kaschiert nichts — und Gästesachen werden nie umgeräumt."
        }
      ]
    },
    {
      id: "hk-kontrolle",
      title: "Abreisezimmer kontrollieren",
      goal: "Du findest alles, was ein Gast vergisst — und alles, was übersehen wird.",
      minutes: 5,
      steps: [
        {
          type: "hotspot",
          scene: "room",
          prompt: "Wo musst du überall schauen, bevor du das Zimmer freigibst?",
          hint: "Sieben Stellen. Vergessene Sachen tauchen fast immer an denselben Orten auf.",
          spots: [
            { id: "bett", x: 58, y: 70, r: 34, label: "Unter dem Bett",
              why: "Der häufigste Fundort überhaupt: Ladekabel, Socken, Schuhe rutschen darunter." },
            { id: "tuer", x: 9,  y: 47, r: 30, label: "Hinter der Tür",
              why: "Dort hängen Jacken und Bademäntel, die beim Rausgehen niemand sieht." },
            { id: "schrank", x: 27, y: 48, r: 32, label: "Im Schrank",
              why: "Immer aufmachen — auch das Fach oben. Safe nicht vergessen." },
            { id: "lade", x: 87, y: 64, r: 28, label: "Nachttisch-Lade",
              why: "Aufladegeräte, Schmuck und Dokumente landen in der Lade und bleiben dort." },
            { id: "korb", x: 35, y: 88, r: 28, label: "Papierkorb",
              why: "Leeren und hineinschauen: Manchmal liegt der Zimmerschlüssel im Müll." },
            { id: "minibar", x: 90, y: 90, r: 28, label: "Minibar",
              why: "Verbrauch prüfen und melden, sonst kann die Rezeption nicht abrechnen." },
            { id: "fenster", x: 74, y: 30, r: 30, label: "Fensterbank und Fenster",
              why: "Fenster schließen — und auf der Bank liegen oft Gläser oder Aschenbecher." }
          ],
          explain: "Diese sieben Stellen kosten dich eine Minute. Eine vergessene Fundsache kostet die Rezeption eine Stunde."
        },
        {
          type: "decide",
          prompt: "Du findest eine Geldbörse in der Nachttisch-Lade. Was tust du?",
          options: [
            "Liegen lassen, der Gast kommt zurück",
            "In den Safe legen und nichts sagen",
            "Sofort ungeöffnet an die Rezeption geben und eintragen lassen",
            "Inhalt prüfen, um den Besitzer zu finden"
          ],
          answer: 2,
          explain: "Ungeöffnet abgeben schützt dich selbst: Über den Inhalt entsteht sonst schnell ein Verdacht."
        },
        {
          type: "sequence",
          prompt: "In welcher Reihenfolge gehst du ein Abreisezimmer an?",
          steps: ["Anklopfen und melden", "Fenster öffnen", "Müll und Wäsche raus", "Die sieben Stellen kontrollieren", "Reinigen", "Kontrollblick von der Tür"],
          explain: "Kontrollieren kommt vor dem Reinigen: Was du vorher findest, saugst du nachher nicht ein."
        }
      ]
    }
  ]
};
