/**
 * Rolle: Frühstück & Buffet
 * Aufbau 1:1 wie housekeeping.js — Datenmodell siehe ../types.js
 */
export const breakfast = {
  id: "breakfast",
  name: "Frühstück & Buffet",
  tagline: "Buffet aufbauen, nachfüllen, sauber halten",
  icon: "UtensilsCrossed",
  accent: "#e8833a",
  blurb: "Du stehst am Buffet. Du lernst den Ablauf am Morgen, die Hygiene-Regeln und die 14 Allergene — auch ohne Deutsch.",
  units: [
    {
      id: "bf-u1",
      title: "Einheit 1 — Das Buffet",
      subtitle: "Du kennst das Buffet, die Wörter dafür und die Reihenfolge am Morgen.",
      lessons: [
        {
          id: "bf-u1-l1",
          title: "Wörter am Buffet",
          kind: "lesson",
          exercises: [
            { id: "bf-1", type: "vocab", term: "das Buffet", options: ["the buffet", "the kitchen", "the bill", "the key"], answer: 0,
              tr: { en: "buffet", tr: "açık büfe", sk: "bufet" },
              explain: "Am Buffet holt sich der Gast sein Essen selbst. Du baust es auf, füllst nach und hältst es sauber." },
            { id: "bf-2", type: "vocab", term: "die Zange", options: ["the tongs", "the plate", "the napkin", "the tray"], answer: 0,
              tr: { en: "tongs", tr: "maşa", sk: "kliešte" },
              explain: "Für jede Speise liegt eine eigene Zange. Der Gast greift nie mit der Hand ins Essen." },
            { id: "bf-3", type: "vocab", term: "nachfüllen", options: ["to refill", "to pay", "to clean", "to book"], answer: 0,
              tr: { en: "to refill", tr: "takviye etmek", sk: "doplniť" },
              explain: "Nachfüllen heißt: neue Ware bringen, bevor die Schüssel leer ist. Ein leeres Buffet sieht der Gast sofort." },
            { id: "bf-4", type: "match", prompt: "Was gehört wohin?", pairs: [["Butter", "Kühlung"], ["Rührei", "Warmhaltebehälter"], ["Semmel", "Brotkorb"], ["Orangensaft", "Kühlung"]],
              explain: "Kalt bleibt kalt, warm bleibt warm. Wer das Buffet richtig einteilt, macht schon die halbe Hygiene." },
            { id: "bf-5", type: "choice", prompt: "Die Joghurtschüssel ist fast leer. Was tust du?", options: ["Warten bis sie ganz leer ist", "Rechtzeitig eine volle, frische Schüssel bringen", "Neuen Joghurt in die alte Schüssel schütten", "Die Schüssel wegräumen"], answer: 1,
              explain: "Nie in die alte Schüssel nachschütten — alt und neu dürfen sich nicht mischen. Du bringst ein frisches Gefäß." },
            { id: "bf-6", type: "build", prompt: "Sage der Küche, dass etwas fehlt.", answer: ["Wir", "brauchen", "mehr", "Rührei"], distractors: ["fertig", "Gast", "kalt"],
              explain: "Kurz und klar. Die Küche kann nur nachliefern, was sie weiß." }
          ]
        },
        {
          id: "bf-u1-l2",
          title: "Der Morgen",
          kind: "lesson",
          exercises: [
            { id: "bf-7", type: "order", prompt: "Was machst du vor dem ersten Gast?", steps: ["Hände waschen und Schürze anziehen", "Temperaturen prüfen und eintragen", "Kalte Speisen aufbauen", "Warme Speisen einsetzen", "Geschirr, Besteck und Zangen bereitlegen", "Kontrollblick über das ganze Buffet"],
              explain: "Erst Hygiene, dann Aufbau. Der Kontrollblick am Schluss ersetzt zehn Korrekturen während des Service." },
            { id: "bf-8", type: "choice", prompt: "Wann stellst du das Rührei ins Buffet?", options: ["Am Abend davor", "So spät wie möglich, kurz vor Beginn", "Sobald du in der Früh da bist", "Erst nach dem ersten Gast"], answer: 1,
              explain: "Warme Speisen kommen erst kurz vor dem Start heraus. Je kürzer sie stehen, desto besser schmecken sie und desto sicherer sind sie." },
            { id: "bf-9", type: "truefalse", statement: "Du legst neue Wurst einfach auf die alte Platte drauf.", answer: false,
              explain: "Alt und neu nie mischen. Sonst liegt die unterste Scheibe den ganzen Morgen im Buffet und niemand weiß es." },
            { id: "bf-10", type: "vocab", term: "der Warmhaltebehälter", options: ["hot holding unit", "fridge", "dishwasher", "coffee machine"], answer: 0,
              tr: { en: "hot holding unit", tr: "sıcak tutma kabı", sk: "ohrievacia nádoba" },
              explain: "Darin bleiben Rührei, Speck und Würstchen heiß. Er wird vorgeheizt, bevor die Speisen hineinkommen." },
            { id: "bf-11", type: "match", prompt: "Reihenfolge beim Aufbau", pairs: [["1.", "Kaffee und Getränke"], ["2.", "Brot und Gebäck"], ["3.", "Käse und Wurst"], ["4.", "Warme Speisen"]],
              explain: "Was am längsten hält, kommt zuerst. Warmes kommt zuletzt, damit es nicht unnötig lange steht." },
            { id: "bf-12", type: "build", prompt: "Frage, ob du das Buffet öffnen kannst.", answer: ["Kann", "ich", "das", "Buffet", "öffnen"], distractors: ["heute", "kalt", "Gast"],
              explain: "Ein Satz, der jeden Morgen passt. Die Küche oder die Chefin gibt das Buffet frei." }
          ]
        },
        {
          id: "bf-u1-l3",
          title: "Prüfung — Das Buffet",
          kind: "checkpoint",
          exercises: [
            { id: "bf-13", type: "order", prompt: "Das Buffet läuft. Was machst du immer wieder?", steps: ["Rundgang machen und schauen", "Leere Schüsseln tauschen", "Verschüttetes sofort wegwischen", "Zangen richtig zurücklegen", "Benutztes Geschirr abservieren"],
              explain: "Der Rundgang ist deine Hauptarbeit. Ein Buffet, das ständig kontrolliert wird, sieht um 9 Uhr aus wie um 7 Uhr." },
            { id: "bf-14", type: "choice", prompt: "Eine Zange liegt im Essen. Was tust du?", options: ["Liegen lassen", "Herausnehmen und durch eine saubere ersetzen", "Kurz abwischen und zurücklegen", "Mit Wasser abspülen"], answer: 1,
              explain: "Eine Zange, die im Essen liegt, ist nicht mehr sauber. Du tauschst sie gegen eine frische aus der Küche." },
            { id: "bf-15", type: "truefalse", statement: "Ein Gast darf sich Brot mit der Hand nehmen, wenn keine Zange da ist.", answer: false,
              explain: "Ohne Zange geht nichts. Fehlt sie, legst du sofort eine hin — sonst fassen alle Gäste dasselbe Brot an." },
            { id: "bf-16", type: "match", prompt: "Wort und Bedeutung", pairs: [["Nachfüllen", "Neue Ware bringen"], ["Abservieren", "Benutztes Geschirr wegräumen"], ["Abbauen", "Buffet nach Ende wegräumen"], ["Eindecken", "Tische für den Gast vorbereiten"]],
              explain: "Vier Wörter, die im Frühstücksdienst jeden Tag fallen. Wer sie kennt, versteht jede Ansage." },
            { id: "bf-17", type: "vocab", term: "abservieren", options: ["to clear the table", "to serve drinks", "to cook", "to pay"], answer: 0,
              tr: { en: "to clear the table", tr: "masayı toplamak", sk: "upratať zo stola" },
              explain: "Abservieren heißt: benutztes Geschirr abräumen, sobald der Gast fertig ist. Ein freier Tisch wirkt sofort ruhiger." },
            { id: "bf-18", type: "build", prompt: "Frage den Gast höflich, ob du abräumen darfst.", answer: ["Darf", "ich", "abräumen"], distractors: ["nicht", "morgen", "kalt"],
              explain: "Immer fragen, nie einfach nehmen. Manche Gäste essen noch weiter." }
          ]
        }
      ]
    },
    {
      id: "bf-u2",
      title: "Einheit 2 — Hygiene & HACCP",
      subtitle: "Du hältst die Kühlkette ein, arbeitest sauber und weißt, wann etwas weg muss.",
      lessons: [
        {
          id: "bf-u2-l1",
          title: "Kalt und heiß",
          kind: "lesson",
          exercises: [
            { id: "bf-19", type: "vocab", term: "die Kühlkette", options: ["cold chain", "cooking time", "cash register", "night shift"], answer: 0,
              tr: { en: "cold chain", tr: "soğuk zincir", sk: "chladiaci reťazec" },
              explain: "Kalte Ware muss vom Lager bis zum Buffet durchgehend kalt bleiben. Jede Unterbrechung lässt Keime wachsen." },
            { id: "bf-20", type: "choice", prompt: "Wie kalt müssen leicht verderbliche Speisen am Buffet sein?", options: ["Höchstens 7 °C", "Höchstens 15 °C", "Zimmertemperatur", "Egal, Hauptsache frisch"], answer: 0,
              explain: "Höchstens 7 °C ist die allgemeine Regel für leicht verderbliche Ware. Darüber vermehren sich Keime schnell." },
            { id: "bf-21", type: "truefalse", statement: "Warme Speisen am Buffet müssen mindestens 65 °C heiß gehalten werden.", answer: true,
              explain: "Ab 65 °C können sich Keime nicht mehr vermehren. Der Warmhaltebehälter ist darum kein Wärmer, sondern ein Schutz." },
            { id: "bf-22", type: "match", prompt: "Speise und Platz", pairs: [["Räucherlachs", "Kühlvitrine"], ["Würstchen", "Warmhaltebehälter"], ["Müsli", "Trockenes Regal"], ["Butterportionen", "Kühlung"]],
              explain: "Alles, was schnell verdirbt, gehört in die Kühlung. Trockenes wie Müsli braucht nur einen sauberen, trockenen Platz." },
            { id: "bf-23", type: "order", prompt: "Du misst die Temperatur im Kühlschrank. Was tust du?", steps: ["Thermometer ablesen", "Wert in die Liste eintragen", "Bei zu hohem Wert sofort Küche oder Chef informieren", "Anweisung abwarten, bevor Ware weggeworfen wird"],
              explain: "Messen allein hilft nichts. Der eingetragene Wert ist der Nachweis, und bei einer Abweichung entscheidest nicht du allein." },
            { id: "bf-24", type: "build", prompt: "Melde, dass der Kühlschrank zu warm ist.", answer: ["Der", "Kühlschrank", "ist", "zu", "warm"], distractors: ["kalt", "sauber", "morgen"],
              explain: "Fünf Wörter, die eine ganze Lieferung retten können. Sofort sagen, nicht erst am Schichtende." }
          ]
        },
        {
          id: "bf-u2-l2",
          title: "Hände & Sauberkeit",
          kind: "lesson",
          exercises: [
            { id: "bf-25", type: "order", prompt: "Hände richtig waschen", steps: ["Hände nass machen", "Seife nehmen und gründlich einreiben", "Gut abspülen", "Mit Einmalhandtuch abtrocknen"],
              explain: "Richtig waschen dauert etwa eine halbe Minute. Nasse Hände geben Keime leichter weiter — darum gehört Abtrocknen dazu." },
            { id: "bf-26", type: "truefalse", statement: "Handschuhe ersetzen das Händewaschen.", answer: false,
              explain: "Auch unter Handschuhen bleiben Keime. Handschuhe kommen über saubere Hände und werden bei jedem Tätigkeitswechsel getauscht." },
            { id: "bf-27", type: "choice", prompt: "Du hast Durchfall oder Erbrechen. Was tust du?", options: ["Trotzdem arbeiten, aber mit Handschuhen", "Sofort dem Chef sagen und nicht mit Lebensmitteln arbeiten", "Nur Getränke servieren", "Erst am nächsten Tag melden"], answer: 1,
              explain: "Bei Durchfall oder Erbrechen darfst du nicht mit Lebensmitteln arbeiten. Das ist Pflicht und schützt die Gäste und dich." },
            { id: "bf-28", type: "vocab", term: "der Niesschutz", options: ["sneeze guard", "fire alarm", "menu card", "serving trolley"], answer: 0,
              tr: { en: "sneeze guard", tr: "hapşırık siperi", sk: "ochranný kryt proti kýchaniu" },
              explain: "Die Scheibe über dem Buffet. Sie hält Tröpfchen vom Essen fern und darf nicht hochgeklappt stehen bleiben." },
            { id: "bf-29", type: "match", prompt: "Situation und richtige Reaktion", pairs: [["Nach dem Nase putzen", "Hände waschen"], ["Nach dem Abservieren", "Hände waschen"], ["Geschirr fällt zu Boden", "Neues Geschirr holen"], ["Wunde am Finger", "Melden und wasserfest abdecken"]],
              explain: "Schmutziges Geschirr und frisches Essen dürfen nie mit denselben Händen angefasst werden." },
            { id: "bf-30", type: "build", prompt: "Sage, dass du dir kurz die Hände wäschst.", answer: ["Ich", "wasche", "kurz", "die", "Hände"], distractors: ["nicht", "Buffet", "heiß"],
              explain: "Niemand hält dich davon ab. Händewaschen ist Arbeitszeit, keine Pause." }
          ]
        },
        {
          id: "bf-u2-l3",
          title: "Prüfung — Hygiene",
          kind: "checkpoint",
          exercises: [
            { id: "bf-31", type: "truefalse", statement: "Speisen, die am Buffet standen, dürfen am nächsten Tag wieder hinausgestellt werden.", answer: false,
              explain: "Was am Buffet war, geht nicht zurück für den nächsten Morgen. Die Gäste haben es angefasst und die Temperatur war lange grenzwertig." },
            { id: "bf-32", type: "order", prompt: "Etwas ist auf den Boden gefallen", steps: ["Stelle sichern, damit niemand ausrutscht", "Aufwischen", "Boden trocken machen", "Hände waschen", "Weiterarbeiten"],
              explain: "Erst sichern, dann putzen. Und immer Hände waschen, bevor du wieder Essen angreifst." },
            { id: "bf-33", type: "choice", prompt: "Die Standzeit für das Rührei ist nach Hausvorgabe vorbei. Was tust du?", options: ["Nachfüllen und weiterlaufen lassen", "Austauschen — alte Ware raus, frische rein", "Kalt stellen und später wieder aufwärmen", "Nichts, es sieht noch gut aus"], answer: 1,
              explain: "Jedes Haus legt fest, wie lange eine warme Speise stehen darf. Ist die Zeit um, wird ausgetauscht — das Aussehen sagt nichts über Keime." },
            { id: "bf-34", type: "match", prompt: "Begriff und Bedeutung", pairs: [["Kühlkette", "Durchgehend kalt"], ["Heißhaltung", "Mindestens 65 °C"], ["Standzeit", "Wie lange etwas draußen sein darf"], ["Temperaturliste", "Der Nachweis für die Kontrolle"]],
              explain: "Diese vier Begriffe stehen in jedem Hygienekonzept. Wer sie versteht, versteht die ganze Frühstücksschicht." },
            { id: "bf-35", type: "vocab", term: "das Mindesthaltbarkeitsdatum", options: ["best-before date", "opening hours", "room number", "delivery note"], answer: 0,
              tr: { en: "best-before date", tr: "tavsiye edilen tüketim tarihi", sk: "dátum minimálnej trvanlivosti" },
              explain: "Steht auf jeder Packung. Abgelaufene Ware kommt nicht ans Buffet — du legst sie beiseite und meldest es." },
            { id: "bf-36", type: "build", prompt: "Melde, dass die Milch abgelaufen ist.", answer: ["Die", "Milch", "ist", "abgelaufen"], distractors: ["frisch", "kalt", "morgen"],
              explain: "Lieber einmal zu viel melden. Eine abgelaufene Packung am Buffet kostet mehr als eine neue." }
          ]
        }
      ]
    },
    {
      id: "bf-u3",
      title: "Einheit 3 — Allergene & Gast",
      subtitle: "Du kennst die 14 Allergene, gibst sichere Auskunft und betreust den Gast.",
      lessons: [
        {
          id: "bf-u3-l1",
          title: "Die 14 Allergene",
          kind: "lesson",
          exercises: [
            { id: "bf-37", type: "choice", prompt: "Wie viele Allergene müssen in der EU gekennzeichnet werden?", options: ["7", "10", "14", "20"], answer: 2,
              explain: "Es sind 14 kennzeichnungspflichtige Allergene. Sie stehen auf der Allergenkarte, die im Frühstücksraum bereitliegt." },
            { id: "bf-38", type: "vocab", term: "das Allergen", options: ["allergen", "ingredient list", "side dish", "reservation"], answer: 0,
              tr: { en: "allergen", tr: "alerjen", sk: "alergén" },
              explain: "Ein Allergen ist ein Stoff, auf den manche Gäste reagieren. Bei einigen Menschen ist die Reaktion lebensgefährlich." },
            { id: "bf-39", type: "match", prompt: "Speise und Allergen", pairs: [["Semmel", "Gluten"], ["Butter", "Milch"], ["Rührei", "Ei"], ["Walnussmüsli", "Schalenfrüchte"]],
              explain: "Die vier häufigsten am Frühstücksbuffet. Wer sie im Kopf hat, erkennt die meisten Nachfragen sofort." },
            { id: "bf-40", type: "truefalse", statement: "Wenn du bei einem Allergen unsicher bist, rätst du nicht, sondern fragst die Küche.", answer: true,
              explain: "Eine falsche Auskunft kann einen Gast ins Krankenhaus bringen. Nachfragen ist immer die richtige Antwort." },
            { id: "bf-41", type: "build", prompt: "Sage dem Gast, dass du nachfragst.", answer: ["Ich", "frage", "in", "der", "Küche", "nach"], distractors: ["nicht", "kalt", "morgen"],
              explain: "Dieser Satz ist nie falsch. Er ist besser als jede geratene Auskunft." },
            { id: "bf-42", type: "order", prompt: "Ein Gast fragt wegen einer Allergie. Was tust du?", steps: ["Zuhören und nachfragen, welches Allergen", "Allergenkarte oder Kennzeichnung anschauen", "Bei Unsicherheit die Küche fragen", "Dem Gast klar antworten", "Der Küche sagen, wenn etwas extra zubereitet wird"],
              explain: "Nie aus dem Gedächtnis antworten. Erst nachsehen, dann antworten — und die Küche muss es wissen, wenn extra gekocht wird." }
          ]
        },
        {
          id: "bf-u3-l2",
          title: "Auskunft & Sonderwünsche",
          kind: "lesson",
          exercises: [
            { id: "bf-43", type: "choice", prompt: "Ein Gast sagt: 'Ich habe Zöliakie.' Was bedeutet das?", options: ["Er verträgt kein Gluten", "Er isst kein Fleisch", "Er verträgt keine Milch", "Er isst kein Ei"], answer: 0,
              explain: "Zöliakie heißt: kein Gluten. Also kein normales Brot, kein Gebäck, kein Weizenmüsli — schon Krümel sind ein Problem." },
            { id: "bf-44", type: "truefalse", statement: "Glutenfreies Brot darf im selben Toaster getoastet werden wie normales Brot.", answer: false,
              explain: "Im Toaster bleiben Krümel liegen. Für glutenfreies Brot braucht es einen eigenen Toaster oder einen Toastbeutel." },
            { id: "bf-45", type: "vocab", term: "laktosefrei", options: ["lactose-free", "sugar-free", "home-made", "warm"], answer: 0,
              tr: { en: "lactose-free", tr: "laktozsuz", sk: "bezlaktózový" },
              explain: "Der Gast verträgt keinen Milchzucker. Dafür gibt es eigene Milch — sie steht gekühlt und beschriftet bereit." },
            { id: "bf-46", type: "match", prompt: "Wunsch und Bedeutung", pairs: [["Vegan", "Kein Ei, keine Milch, kein Honig"], ["Vegetarisch", "Kein Fleisch, kein Fisch"], ["Glutenfrei", "Kein Weizen, Roggen, Gerste"], ["Laktosefrei", "Keine normale Milch"]],
              explain: "Diese vier Wünsche kommen am häufigsten. Wer sie unterscheidet, stellt dem Gast nichts Falsches hin." },
            { id: "bf-47", type: "build", prompt: "Frage den Gast nach seiner Allergie.", answer: ["Worauf", "sind", "Sie", "allergisch"], distractors: ["heute", "kalt", "nicht"],
              explain: "Höflich mit 'Sie'. So weißt du genau, worauf du achten musst, statt zu raten." },
            { id: "bf-48", type: "order", prompt: "Einen Teller ohne Allergen vorbereiten", steps: ["Hände waschen", "Eigenes Brett und eigenes Messer nehmen", "Ware aus der getrennten Lagerung holen", "Eigene Zange verwenden", "Teller direkt dem Gast bringen"],
              explain: "Jeder Schritt verhindert, dass ein Allergen über Hände, Besteck oder Krümel in die Speise kommt." }
          ]
        },
        {
          id: "bf-u3-l3",
          title: "Prüfung — Allergene & Gast",
          kind: "checkpoint",
          exercises: [
            { id: "bf-49", type: "order", prompt: "Der Frühstücksservice ist vorbei", steps: ["Warme Speisen entnehmen und der Küche geben", "Verderbliche Reste aussortieren", "Buffet abbauen und reinigen", "Tische abservieren und abwischen", "Temperaturliste abschließen"],
              explain: "Das Abbauen entscheidet über den nächsten Morgen. Was jetzt sauber und eingetragen ist, kostet morgen keine Zeit." },
            { id: "bf-50", type: "choice", prompt: "Ein Gast bekommt plötzlich Ausschlag und schwer Luft. Was tust du zuerst?", options: ["Wasser bringen", "Sofort Hilfe holen und den Notruf verlangen", "Die Allergenkarte suchen", "Den Gast aufs Zimmer bringen"], answer: 1,
              explain: "Atemnot ist ein Notfall. Erst Hilfe holen — die Frage, woran es lag, kommt später." },
            { id: "bf-51", type: "truefalse", statement: "Du darfst 'das ist sicher glutenfrei' sagen, wenn du es vermutest.", answer: false,
              explain: "Nur was du nachgelesen oder von der Küche gehört hast, darfst du sagen. Eine Vermutung ist keine Auskunft." },
            { id: "bf-52", type: "match", prompt: "Situation und richtige Reaktion", pairs: [["Allergiefrage", "Nachsehen oder Küche fragen"], ["Leere Schüssel", "Frisches Gefäß bringen"], ["Kühlung zu warm", "Sofort melden"], ["Gast isst noch", "Nicht abräumen"]],
              explain: "Vier Standardsituationen im Frühstücksdienst. Wer sie kennt, muss nie improvisieren." },
            { id: "bf-53", type: "vocab", term: "die Kreuzkontamination", options: ["cross-contamination", "double booking", "overtime", "cash payment"], answer: 0,
              tr: { en: "cross-contamination", tr: "çapraz bulaşma", sk: "krížová kontaminácia" },
              explain: "Ein Allergen oder Keim wandert von einer Speise auf eine andere — meist über Hände, Zange oder Schneidbrett." },
            { id: "bf-54", type: "build", prompt: "Wünsche dem Gast einen guten Appetit.", answer: ["Guten", "Appetit"], distractors: ["Zimmer", "kalt", "nicht"],
              explain: "Zwei Wörter, die jeder Gast versteht. Sie machen aus einem Buffet einen Service." }
          ]
        }
      ]
    }
  ]
};
