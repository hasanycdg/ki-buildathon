/**
 * Rolle: Housekeeping / Zimmerreinigung
 * Referenz-Curriculum — Aufbau siehe ../types.js
 */
export const housekeeping = {
  id: "housekeeping",
  name: "Housekeeping",
  tagline: "Zimmer reinigen nach Hausstandard",
  icon: "BedDouble",
  accent: "#2468f2",
  blurb: "Du machst die Zimmer. Du lernst den Hausstandard, die Reihenfolge und die wichtigsten Wörter — auch ohne Deutsch.",
  units: [
    {
      id: "hk-u1",
      title: "Einheit 1 — Das Zimmer",
      subtitle: "Du kennst die Dinge im Zimmer und kannst sie benennen.",
      lessons: [
        {
          id: "hk-u1-l1",
          title: "Wörter fürs Zimmer",
          kind: "lesson",
          exercises: [
            { id: "hk-1", type: "vocab", term: "die Bettwäsche", options: ["bed linen", "the towel", "the window", "the door"], answer: 0,
              tr: { en: "bed linen", tr: "yatak takımı", sk: "posteľná bielizeň" },
              explain: "Bettwäsche = Leintuch, Bezug und Polsterbezug. Sie wird bei Abreise immer gewechselt." },
            { id: "hk-2", type: "vocab", term: "das Handtuch", options: ["the pillow", "the towel", "the blanket", "the carpet"], answer: 1,
              tr: { en: "towel", tr: "havlu", sk: "uterák" },
              explain: "Handtuch ist für die Hände, das größere Stück heißt Badetuch." },
            { id: "hk-3", type: "vocab", term: "der Polster", options: ["the mattress", "the curtain", "the pillow", "the lamp"], answer: 2,
              tr: { en: "pillow", tr: "yastık", sk: "vankúš" },
              explain: "In Österreich sagt man Polster, in Deutschland Kissen. Beides ist richtig." },
            { id: "hk-4", type: "match", prompt: "Was gehört wohin?", pairs: [["Badetuch", "Bad"], ["Polster", "Bett"], ["Minibar", "Zimmer"], ["Föhn", "Bad"]],
              explain: "Wenn du weißt, wo etwas hingehört, findest du beim Kontrollblick sofort, was fehlt." },
            { id: "hk-5", type: "choice", prompt: "Der Gast reist ab. Was passiert mit der Bettwäsche?", options: ["Bleibt liegen", "Wird immer gewechselt", "Nur wenn sie schmutzig aussieht", "Nur am Wochenende"], answer: 1,
              explain: "Bei Abreise wird die Bettwäsche immer gewechselt — unabhängig davon, wie sie aussieht." },
            { id: "hk-6", type: "build", prompt: "Sage deiner Kollegin, dass du fertig bist.", answer: ["Das", "Zimmer", "ist", "fertig"], distractors: ["morgen", "Gast", "nicht"],
              explain: "Ein kurzer Satz reicht. Damit weiß die Rezeption, dass das Zimmer vergeben werden kann." }
          ]
        },
        {
          id: "hk-u1-l2",
          title: "Zimmerstatus verstehen",
          kind: "lesson",
          exercises: [
            { id: "hk-7", type: "vocab", term: "die Abreise", options: ["arrival", "departure", "cleaning", "booking"], answer: 1,
              tr: { en: "departure", tr: "çıkış", sk: "odchod" },
              explain: "Abreise heißt: Der Gast geht heute. Das Zimmer wird komplett gemacht." },
            { id: "hk-8", type: "vocab", term: "die Bleibe", options: ["stayover", "checkout", "night shift", "laundry"], answer: 0,
              tr: { en: "stayover", tr: "konaklamaya devam", sk: "zostáva" },
              explain: "Bleibe heißt: Der Gast bleibt noch. Du machst nur die Auffrischung, keine komplette Reinigung." },
            { id: "hk-9", type: "truefalse", statement: "Bei einer Bleibe räumst du die Sachen des Gastes in den Schrank.", answer: false,
              explain: "Persönliche Sachen des Gastes werden nicht eingeräumt oder verschoben. Du legst sie höchstens ordentlich zusammen." },
            { id: "hk-10", type: "choice", prompt: "Auf deinem Zettel steht bei Zimmer 214 'AB'. Was bedeutet das?", options: ["Abreise", "Abends", "Abgesagt", "Arbeitsbereich"], answer: 0,
              explain: "AB = Abreise. Diese Zimmer haben Vorrang, weil neue Gäste warten." },
            { id: "hk-11", type: "order", prompt: "In welcher Reihenfolge machst du deine Zimmer?", steps: ["Abreisen mit früher Neuankunft", "Übrige Abreisen", "Bleiben", "Leerstehende Zimmer kontrollieren"],
              explain: "Zuerst die Zimmer, auf die jemand wartet. So steht nie ein Gast an der Rezeption ohne Zimmer." },
            { id: "hk-12", type: "build", prompt: "Frage nach, ob der Gast schon weg ist.", answer: ["Ist", "der", "Gast", "schon", "abgereist"], distractors: ["Zimmer", "heute"],
              explain: "Nie ein Zimmer betreten, ohne sicher zu sein, dass der Gast weg ist." }
          ]
        },
        {
          id: "hk-u1-l3",
          title: "Prüfung — Das Zimmer",
          kind: "checkpoint",
          exercises: [
            { id: "hk-13", type: "vocab", term: "das Badetuch", options: ["hand towel", "bath towel", "bed sheet", "curtain"], answer: 1,
              tr: { en: "bath towel", tr: "banyo havlusu", sk: "osuška" },
              explain: "Das Badetuch ist das große Tuch zum Abtrocknen nach der Dusche." },
            { id: "hk-14", type: "choice", prompt: "Zimmer 118 ist eine Bleibe. Was machst du NICHT?", options: ["Bad reinigen", "Handtücher tauschen", "Bettwäsche komplett wechseln", "Müll leeren"], answer: 2,
              explain: "Bei einer Bleibe wird die Bettwäsche nur auf Wunsch gewechselt — das spart Wäsche, Zeit und Wasser." },
            { id: "hk-15", type: "truefalse", statement: "Du klopfst an und sagst 'Housekeeping', bevor du ein Zimmer betrittst.", answer: true,
              explain: "Immer anklopfen und sich melden — auch wenn das Zimmer als Abreise markiert ist. Gäste sind manchmal noch drin." },
            { id: "hk-16", type: "match", prompt: "Kürzel und Bedeutung", pairs: [["AB", "Abreise"], ["BL", "Bleibe"], ["LE", "Leer"], ["NA", "Neuankunft"]],
              explain: "Diese vier Kürzel stehen auf jedem Zimmerplan. Wer sie kennt, braucht keine Erklärung mehr." },
            { id: "hk-17", type: "order", prompt: "Du betrittst ein Abreisezimmer. Was zuerst?", steps: ["Anklopfen und melden", "Fenster öffnen", "Müll und Wäsche raus", "Betten abziehen"],
              explain: "Erst lüften und ausräumen, dann reinigen. Sonst putzt du zweimal." },
            { id: "hk-18", type: "build", prompt: "Melde einen Schaden.", answer: ["Die", "Lampe", "ist", "kaputt"], distractors: ["schön", "Gast", "heute"],
              explain: "Schäden sofort melden, nicht am Schichtende. Dann kann die Technik es noch vor der Anreise richten." }
          ]
        }
      ]
    },
    {
      id: "hk-u2",
      title: "Einheit 2 — Der Hausstandard",
      subtitle: "Du reinigst ein Zimmer in der richtigen Reihenfolge.",
      lessons: [
        {
          id: "hk-u2-l1",
          title: "Die Reihenfolge",
          kind: "lesson",
          exercises: [
            { id: "hk-19", type: "order", prompt: "Reihenfolge der Zimmerreinigung", steps: ["Lüften und ausräumen", "Betten machen", "Staub wischen von oben nach unten", "Bad reinigen", "Boden saugen und wischen", "Kontrollblick"],
              explain: "Von oben nach unten und von hinten nach vorne. So fällt kein Schmutz auf schon Gereinigtes." },
            { id: "hk-20", type: "truefalse", statement: "Du saugst den Boden, bevor du Staub wischst.", answer: false,
              explain: "Staub fällt beim Wischen nach unten. Erst Staub, dann Boden — sonst machst du die Arbeit doppelt." },
            { id: "hk-21", type: "choice", prompt: "Womit fängst du im Bad an?", options: ["WC", "Waschbecken und Spiegel", "Boden", "Dusche"], answer: 1,
              explain: "Vom saubersten zum schmutzigsten Bereich. Das WC kommt zuletzt, damit keine Keime verschleppt werden." },
            { id: "hk-22", type: "vocab", term: "der Kontrollblick", options: ["final check", "first step", "deep clean", "handover"], answer: 0,
              tr: { en: "final check", tr: "son kontrol", sk: "záverečná kontrola" },
              explain: "Der letzte Blick von der Tür aus. Du siehst das Zimmer so, wie der Gast es sieht." },
            { id: "hk-23", type: "match", prompt: "Reihenfolge im Bad", pairs: [["1.", "Spiegel"], ["2.", "Waschbecken"], ["3.", "Dusche"], ["4.", "WC"]],
              explain: "Immer in dieser Richtung. Das Tuch fürs WC berührt nichts anderes mehr." },
            { id: "hk-24", type: "build", prompt: "Sage, dass du noch ein Zimmer brauchst.", answer: ["Ich", "brauche", "noch", "Handtücher"], distractors: ["fertig", "Gast", "nicht"],
              explain: "Fehlende Wäsche früh melden, nicht erst wenn der Wagen leer ist." }
          ]
        },
        {
          id: "hk-u2-l2",
          title: "Bett und Bad",
          kind: "lesson",
          exercises: [
            { id: "hk-25", type: "order", prompt: "Bett beziehen", steps: ["Alte Wäsche abziehen", "Matratze prüfen", "Leintuch spannen", "Bezug aufziehen", "Polster aufschütteln"],
              explain: "Die Matratze prüfen ist Pflicht: Flecken oder Schäden müssen gemeldet werden, bevor frische Wäsche drauf kommt." },
            { id: "hk-26", type: "vocab", term: "das Leintuch", options: ["duvet cover", "fitted sheet", "pillow case", "blanket"], answer: 1,
              tr: { en: "fitted sheet", tr: "çarşaf", sk: "plachta" },
              explain: "Das Leintuch liegt direkt auf der Matratze und wird an den Ecken gespannt." },
            { id: "hk-27", type: "truefalse", statement: "Ein Haar im Waschbecken ist kein Problem, wenn sonst alles sauber ist.", answer: false,
              explain: "Ein einziges Haar lässt den Gast das ganze Zimmer für schmutzig halten. Bad und Spiegel entscheiden über den Eindruck." },
            { id: "hk-28", type: "choice", prompt: "Wie viele Handtücher gehören bei einem Doppelzimmer ins Bad?", options: ["2", "4", "6", "Kommt auf das Haus an"], answer: 3,
              explain: "Das ist Hausstandard und unterscheidet sich je nach Hotel. Frag einmal nach und merke es dir — danach nie wieder." },
            { id: "hk-29", type: "match", prompt: "Tuchfarbe und Einsatzort", pairs: [["Rot", "WC"], ["Blau", "Waschbecken"], ["Grün", "Zimmer"], ["Gelb", "Dusche"]],
              explain: "Farbtrennung verhindert Keimverschleppung. Ein rotes Tuch berührt nie das Waschbecken." },
            { id: "hk-30", type: "build", prompt: "Sage, dass die Dusche verstopft ist.", answer: ["Die", "Dusche", "ist", "verstopft"], distractors: ["sauber", "Bett", "heute"],
              explain: "Verstopfungen sofort melden. Wenn das Wasser beim nächsten Gast übergeht, wird es teuer." }
          ]
        },
        {
          id: "hk-u2-l3",
          title: "Prüfung — Hausstandard",
          kind: "checkpoint",
          exercises: [
            { id: "hk-31", type: "order", prompt: "Komplette Zimmerreinigung von vorne", steps: ["Anklopfen und melden", "Lüften", "Müll und Wäsche raus", "Betten machen", "Staub von oben nach unten", "Bad", "Boden", "Kontrollblick"],
              explain: "Das ist der ganze Hausstandard. Wer diese Reihenfolge kann, braucht keine Einschulung mehr daneben." },
            { id: "hk-32", type: "truefalse", statement: "Das WC-Tuch darf danach für den Spiegel verwendet werden.", answer: false,
              explain: "Niemals. Keime vom WC gehören nicht auf den Spiegel, an dem sich der Gast die Zähne putzt." },
            { id: "hk-33", type: "choice", prompt: "Du findest Geld auf dem Nachttisch eines Abreisezimmers. Was tust du?", options: ["Liegen lassen", "An die Rezeption bringen und melden", "Als Trinkgeld nehmen", "In die Lade legen"], answer: 1,
              explain: "Fundsachen immer melden und abgeben. Trinkgeld liegt sichtbar mit einem Zettel oder wird direkt übergeben." },
            { id: "hk-34", type: "vocab", term: "die Fundsache", options: ["lost property", "cleaning cart", "room key", "checklist"], answer: 0,
              tr: { en: "lost property", tr: "kayıp eşya", sk: "stratená vec" },
              explain: "Alles, was der Gast vergisst, ist eine Fundsache und wird dokumentiert." },
            { id: "hk-35", type: "match", prompt: "Was gehört zum Kontrollblick?", pairs: [["Tür", "Steht alles gerade?"], ["Bad", "Spiegel streifenfrei?"], ["Bett", "Falten glatt?"], ["Boden", "Nichts übersehen?"]],
              explain: "Vier Sekunden von der Tür aus sparen später eine ganze Reklamation." },
            { id: "hk-36", type: "build", prompt: "Melde, dass ein Zimmer noch belegt ist.", answer: ["Der", "Gast", "ist", "noch", "im", "Zimmer"], distractors: ["fertig", "sauber"],
              explain: "Nicht warten und nicht nochmal klopfen — melden und das nächste Zimmer machen." }
          ]
        }
      ]
    },
    {
      id: "hk-u3",
      title: "Einheit 3 — Chemie & Sicherheit",
      subtitle: "Du arbeitest sicher mit Reinigungsmitteln und kennst die Regeln.",
      lessons: [
        {
          id: "hk-u3-l1",
          title: "Reinigungsmittel",
          kind: "lesson",
          exercises: [
            { id: "hk-37", type: "match", prompt: "Mittel und Einsatzort", pairs: [["Sanitärreiniger", "Bad"], ["Glasreiniger", "Spiegel"], ["Allzweckreiniger", "Möbel"], ["Desinfektion", "WC-Griff"]],
              explain: "Jedes Mittel hat eine Aufgabe. Das falsche Mittel putzt nicht besser, sondern zerstört Oberflächen." },
            { id: "hk-38", type: "truefalse", statement: "Zwei Reinigungsmittel zusammen wirken stärker.", answer: false,
              explain: "Niemals mischen. Aus Chlor und Säure entsteht giftiges Gas. Das ist lebensgefährlich." },
            { id: "hk-39", type: "vocab", term: "die Einwirkzeit", options: ["contact time", "working hours", "drying time", "break"], answer: 0,
              tr: { en: "contact time", tr: "bekleme süresi", sk: "doba pôsobenia" },
              explain: "Das Mittel braucht Zeit, um zu wirken. Sofort wegwischen heißt: nicht desinfiziert." },
            { id: "hk-40", type: "choice", prompt: "Du sprühst Sanitärreiniger ins WC. Was dann?", options: ["Sofort bürsten", "Einwirken lassen, dann bürsten", "Mit Wasser nachspülen", "Trocken wischen"], answer: 1,
              explain: "Einwirken lassen — steht auf der Flasche, meist 3 bis 5 Minuten. In der Zeit machst du das Waschbecken." },
            { id: "hk-41", type: "truefalse", statement: "Reinigungsmittel dürfen in eine leere Wasserflasche umgefüllt werden.", answer: false,
              explain: "Nie in Lebensmittelbehälter umfüllen. Es besteht Verwechslungsgefahr — schon Menschen haben daraus getrunken." },
            { id: "hk-42", type: "build", prompt: "Sage, dass ein Mittel leer ist.", answer: ["Der", "Glasreiniger", "ist", "leer"], distractors: ["voll", "Zimmer", "sauber"],
              explain: "Nachschub früh melden. Ohne Material steht der ganze Wagen." }
          ]
        },
        {
          id: "hk-u3-l2",
          title: "Sicherheit & Gäste",
          kind: "lesson",
          exercises: [
            { id: "hk-43", type: "choice", prompt: "Ein Gast spricht dich an und du verstehst nichts. Was tust du?", options: ["Weggehen", "Freundlich lächeln und zur Rezeption verweisen", "Nicken und weitermachen", "Laut wiederholen"], answer: 1,
              explain: "Freundlich bleiben und weiterleiten ist immer richtig. Du musst nicht alles verstehen, du musst nur helfen." },
            { id: "hk-44", type: "vocab", term: "der Notausgang", options: ["emergency exit", "main entrance", "staff room", "storage"], answer: 0,
              tr: { en: "emergency exit", tr: "acil çıkış", sk: "núdzový východ" },
              explain: "Du musst wissen, wo auf deinem Stockwerk der nächste Notausgang ist — ohne nachzudenken." },
            { id: "hk-45", type: "truefalse", statement: "Der Reinigungswagen darf kurz im Fluchtweg stehen.", answer: false,
              explain: "Fluchtwege bleiben immer frei. Im Brandfall entscheidet das über Leben." },
            { id: "hk-46", type: "order", prompt: "Du entdeckst Feuer im Zimmer. Was zuerst?", steps: ["Zimmer verlassen und Tür schließen", "Alarm auslösen", "Rezeption informieren", "Gäste am Gang warnen"],
              explain: "Erst dich in Sicherheit bringen, dann alarmieren. Niemals selbst löschen wollen." },
            { id: "hk-47", type: "truefalse", statement: "Du darfst die Zimmerkarte kurz einer Kollegin geben.", answer: false,
              explain: "Der Generalschlüssel ist persönlich. Er wird nie weitergegeben und nie liegen gelassen." },
            { id: "hk-48", type: "build", prompt: "Sage einem Gast freundlich, dass du gleich fertig bist.", answer: ["Ich", "bin", "gleich", "fertig"], distractors: ["nicht", "morgen", "kaputt"],
              explain: "Vier Wörter, die jede Situation entspannen. Der Gast weiß, woran er ist." }
          ]
        },
        {
          id: "hk-u3-l3",
          title: "Prüfung — Sicher arbeiten",
          kind: "checkpoint",
          exercises: [
            { id: "hk-49", type: "truefalse", statement: "Chlor und Essigreiniger darf man zusammen verwenden.", answer: false,
              explain: "Das erzeugt giftiges Chlorgas. Diese Regel gilt lebenslang und überall." },
            { id: "hk-50", type: "order", prompt: "Sicherer Umgang mit einem neuen Mittel", steps: ["Etikett lesen", "Handschuhe anziehen", "Dosieren wie angegeben", "Einwirken lassen", "Wagen verschlossen halten"],
              explain: "Etikett zuerst. Dosierung ist keine Schätzung — zu viel reinigt nicht besser, sondern schadet." },
            { id: "hk-51", type: "match", prompt: "Situation und richtige Reaktion", pairs: [["Feuer", "Raus und Alarm"], ["Fundsache", "Rezeption"], ["Schaden", "Sofort melden"], ["Gast im Zimmer", "Später wiederkommen"]],
              explain: "Vier Standardsituationen. Wer sie kennt, muss nie improvisieren." },
            { id: "hk-52", type: "vocab", term: "das Sicherheitsdatenblatt", options: ["safety data sheet", "work schedule", "room list", "invoice"], answer: 0,
              tr: { en: "safety data sheet", tr: "güvenlik bilgi formu", sk: "karta bezpečnostných údajov" },
              explain: "Dort steht, was zu tun ist, wenn etwas in die Augen kommt. Es hängt im Lager aus." },
            { id: "hk-53", type: "choice", prompt: "Dir ist Reinigungsmittel ins Auge gekommen. Was zuerst?", options: ["Reiben", "Mit viel Wasser spülen", "Warten", "Augentropfen"], answer: 1,
              explain: "Sofort mindestens 10 Minuten mit Wasser spülen, dann melden. Nicht reiben." },
            { id: "hk-54", type: "build", prompt: "Melde einen Unfall.", answer: ["Ich", "brauche", "Hilfe"], distractors: ["fertig", "sauber", "morgen"],
              explain: "Drei Wörter. Sie funktionieren in jedem Haus und in jeder Schicht." }
          ]
        }
      ]
    }
  ]
};
