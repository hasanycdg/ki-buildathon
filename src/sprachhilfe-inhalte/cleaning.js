/**
 * Rolle: Reinigung öffentliche Bereiche
 * Alles außerhalb der Gästezimmer — Aufbau siehe ../types.js
 */
export const cleaning = {
  id: "cleaning",
  name: { de: "Öffentliche Bereiche", en: "Public areas", tr: "Ortak alanlar", sk: "Verejné priestory", pl: "Strefy publiczne", hr: "Javni prostori", sr: "Javni prostori", sl: "Javni prostori" },
  tagline: { de: "Lobby, Gänge, Wellness und WC sauber halten", en: "Keeping lobby, corridors, spa and toilets clean", tr: "Lobi, koridor, spa ve tuvaletleri temiz tutmak", sk: "Udržiavať lobby, chodby, wellness a WC čisté", pl: "Utrzymywać w czystości lobby, korytarze, wellness i WC", hr: "Održavati čistima predvorje, hodnike, wellness i WC", sr: "Održavati čistim lobi, hodnike, wellness i WC", sl: "Ohranjati čiste avlo, hodnike, wellness in WC" },
  icon: "SprayCan",
  accent: "#0f9b8e",
  blurb: { de: "Du machst alles außerhalb der Zimmer. Du arbeitest oft vor Gästen. Du lernst die Bereiche, die Regeln und die wichtigsten Wörter — auch ohne Deutsch.",
           en: "You do everything outside the rooms. You often work in front of guests. You learn the areas, the rules and the most important words — even without German.",
           tr: "Odaların dışındaki her şeyi sen yaparsın. Sık sık misafirlerin önünde çalışırsın. Alanları, kuralları ve en önemli kelimeleri öğrenirsin — Almanca bilmeden de.",
           sk: "Robíš všetko mimo izieb. Často pracuješ pred hosťami. Naučíš sa priestory, pravidlá a najdôležitejšie slová — aj bez nemčiny.",
           pl: "Robisz wszystko poza pokojami. Często pracujesz na oczach gości. Nauczysz się stref, zasad i najważniejszych słów — nawet bez niemieckiego.",
           hr: "Radiš sve izvan soba. Često radiš pred gostima. Naučit ćeš prostore, pravila i najvažnije riječi — i bez njemačkog.",
           sr: "Radiš sve izvan soba. Često radiš pred gostima. Naučićeš prostore, pravila i najvažnije reči — i bez nemačkog.",
           sl: "Delaš vse zunaj sob. Pogosto delaš pred gosti. Naučiš se prostore, pravila in najpomembnejše besede — tudi brez nemščine." },
  units: [
    {
      id: "cl-u1",
      title: { de: "Einheit 1 — Bereiche & Geräte", en: "Unit 1 — Areas & equipment", tr: "Ünite 1 — Alanlar ve ekipman", sk: "Jednotka 1 — Priestory a prístroje", pl: "Jednostka 1 — Strefy i sprzęt", hr: "Cjelina 1 — Prostori i uređaji", sr: "Celina 1 — Prostori i uređaji", sl: "Enota 1 — Prostori in naprave" },
      subtitle: { de: "Du kennst alle Bereiche im Haus und dein Werkzeug.",
                  en: "You know every area in the house and your equipment.",
                  tr: "Oteldeki tüm alanları ve ekipmanını bilirsin.",
                  sk: "Poznáš všetky priestory v dome a svoje náradie.",
                  pl: "Znasz wszystkie strefy w hotelu i swój sprzęt.",
                  hr: "Poznaješ sve prostore u kući i svoj alat.",
                  sr: "Poznaješ sve prostore u kući i svoj alat.",
                  sl: "Poznaš vse prostore v hiši in svoje orodje." },
      lessons: [
        {
          id: "cl-u1-l1",
          title: { de: "Wörter für die Bereiche", en: "Words for the areas", tr: "Alanlar için kelimeler", sk: "Slová pre priestory", pl: "Słowa do stref", hr: "Riječi za prostore", sr: "Reči za prostore", sl: "Besede za prostore" },
          kind: "lesson",
          exercises: [
            { id: "cl-1", type: "vocab", term: "die Lobby", options: ["entrance hall", "the kitchen", "the garage", "the bedroom"], answer: 0,
              tr: { en: "lobby, entrance hall", tr: "lobi", sk: "hala, vstupná hala" },
              explain: "Die Lobby ist der erste Raum, den der Gast sieht. Sie wird mehrmals am Tag kontrolliert, nicht nur einmal." },
            { id: "cl-2", type: "vocab", term: "das Stiegenhaus", options: ["the lift", "the stairwell", "the balcony", "the roof"], answer: 1,
              tr: { en: "stairwell", tr: "merdiven boşluğu", sk: "schodisko" },
              explain: "Stiegenhaus heißt Treppenhaus. In Österreich sagt man Stiege, in Deutschland Treppe. Beides ist richtig." },
            { id: "cl-3", type: "vocab", term: "der Aufzug", options: ["the corridor", "the door", "the lift", "the window"], answer: 2,
              tr: { en: "lift, elevator", tr: "asansör", sk: "výťah" },
              explain: "Man sagt auch Lift. Im Aufzug siehst du jeden Fingerabdruck — deshalb gehört er zur täglichen Runde." },
            { id: "cl-4", type: "match", prompt: "Bereich und typische Aufgabe", pairs: [["Lobby", "Glastür putzen"], ["Gang", "Boden saugen"], ["Aufzug", "Spiegel und Knöpfe"], ["Wellness", "Barfußboden desinfizieren"]],
              explain: "Jeder Bereich hat eine Hauptaufgabe. Wenn du sie kennst, brauchst du keine Liste mehr in der Hand." },
            { id: "cl-5", type: "choice", prompt: "Womit fängst du am Morgen an?", options: ["Personalraum", "Lobby und Eingang", "Lager", "Stiegenhaus"], answer: 1,
              explain: "Der Eingangsbereich zuerst: Dort kommen die ersten Gäste durch. Personalräume macht man, wenn keiner drin ist." },
            { id: "cl-6", type: "truefalse", statement: "Der Personalraum ist weniger wichtig als die Lobby, also reicht einmal pro Woche.", answer: false,
              explain: "Der Personalraum gehört auch zu dir und wird täglich gemacht. Ein schmutziger Pausenraum macht das ganze Team unzufrieden." }
          ]
        },
        {
          id: "cl-u1-l2",
          title: { de: "Geräte und Wagen", en: "Equipment and trolleys", tr: "Ekipman ve arabalar", sk: "Prístroje a vozíky", pl: "Sprzęt i wózki", hr: "Uređaji i kolica", sr: "Uređaji i kolica", sl: "Naprave in vozički" },
          kind: "lesson",
          exercises: [
            { id: "cl-7", type: "vocab", term: "der Wischmopp", options: ["the mop", "the broom", "the bucket", "the sponge"], answer: 0,
              tr: { en: "mop", tr: "paspas", sk: "mop" },
              explain: "Der Mopp kommt für jeden Bereich frisch. Ein grauer Mopp verteilt den Schmutz nur weiter." },
            { id: "cl-8", type: "vocab", term: "das Warnschild", options: ["the price list", "the warning sign", "the key card", "the notice board"], answer: 1,
              tr: { en: "warning sign", tr: "uyarı levhası", sk: "výstražná tabuľa" },
              explain: "Das gelbe Schild sagt dem Gast: Achtung, nass. Ohne Schild haftet das Haus, wenn jemand stürzt." },
            { id: "cl-9", type: "match", prompt: "Gerät und Einsatzort", pairs: [["Staubsauger", "Teppich im Gang"], ["Wischmopp", "Fliesen in der Lobby"], ["Abzieher", "Glastür"], ["Warnschild", "Nasser Boden"]],
              explain: "Das falsche Gerät kostet Zeit. Teppich wird gesaugt, nicht gewischt — sonst bleibt er stundenlang feucht." },
            { id: "cl-10", type: "order", prompt: "Wagen vorbereiten vor der Schicht", steps: ["Wagen kontrollieren", "Frische Tücher einräumen", "Mittel nachfüllen", "Warnschilder mitnehmen", "Müllsäcke auffüllen"],
              explain: "Alles vor der Schicht auffüllen. Wer mitten in der Lobby nachholen muss, lässt den Wagen unbeaufsichtigt stehen." },
            { id: "cl-11", type: "choice", prompt: "Dein Wagen steht in der Lobby und du gehst kurz ins Lager. Was tust du?", options: ["Stehen lassen", "Mittel wegsperren und Wagen mitnehmen oder sichern", "Gast fragen ob er aufpasst", "Wagen offen lassen"], answer: 1,
              explain: "Reinigungsmittel dürfen nie für Gäste oder Kinder erreichbar sein. Der Wagen bleibt nie offen in einem Gästebereich." },
            { id: "cl-12", type: "build", prompt: "Sage, dass ein Gerät kaputt ist.", answer: ["Der", "Staubsauger", "geht", "nicht"], distractors: ["sauber", "morgen", "Gast"],
              explain: "Defekte Geräte sofort melden, nicht weiterverwenden. Ein Kabelschaden am Sauger ist ein Stromrisiko." }
          ]
        },
        {
          id: "cl-u1-l3",
          title: { de: "Prüfung — Bereiche & Geräte", en: "Test — Areas & equipment", tr: "Sınav — Alanlar ve ekipman", sk: "Test — Priestory a prístroje", pl: "Test — Strefy i sprzęt", hr: "Provjera — Prostori i uređaji", sr: "Provera — Prostori i uređaji", sl: "Preverjanje — Prostori in naprave" },
          kind: "checkpoint",
          exercises: [
            { id: "cl-13", type: "vocab", term: "die Glastür", options: ["glass door", "back door", "fire door", "room door"], answer: 0,
              tr: { en: "glass door", tr: "cam kapı", sk: "sklenené dvere" },
              explain: "Glastüren zeigen jeden Handabdruck. Sie werden mehrmals täglich nachgeputzt, besonders beim Eingang." },
            { id: "cl-14", type: "choice", prompt: "Wie putzt du eine große Glasfläche streifenfrei?", options: ["Viel Mittel und trocken reiben", "Wenig Mittel und mit dem Abzieher von oben nach unten", "Nur mit Wasser", "Mit dem Bodentuch"], answer: 1,
              explain: "Wenig Mittel, Abzieher von oben nach unten, Kante nach jedem Zug abwischen. Zu viel Mittel macht die Streifen." },
            { id: "cl-15", type: "truefalse", statement: "Im Aufzug reicht es, den Boden zu machen.", answer: false,
              explain: "Im Aufzug zählen Spiegel, Knöpfe und Handlauf am meisten. Die Knöpfe fasst jeder Gast an." },
            { id: "cl-16", type: "match", prompt: "Bereich und wie oft", pairs: [["Lobby", "Mehrmals am Tag"], ["Gäste-WC", "Mehrmals am Tag"], ["Stiegenhaus", "Täglich"], ["Lager", "Einmal pro Woche"]],
              explain: "Je mehr Gäste durchgehen, desto öfter. Das Gäste-WC ist der Bereich, über den am meisten reklamiert wird." },
            { id: "cl-17", type: "order", prompt: "Stiegenhaus reinigen", steps: ["Warnschild aufstellen", "Von oben nach unten arbeiten", "Handlauf wischen", "Stufen wischen", "Schild erst nach dem Trocknen wegräumen"],
              explain: "Von oben nach unten, damit kein Schmutz auf Fertiges fällt. Das Schild bleibt, bis der Boden wirklich trocken ist." },
            { id: "cl-18", type: "build", prompt: "Sage, dass du in der Lobby arbeitest.", answer: ["Ich", "bin", "in", "der", "Lobby"], distractors: ["fertig", "kaputt"],
              explain: "Kollegen und Rezeption müssen wissen, wo du bist. Dann findet dich jemand, wenn schnell etwas gebraucht wird." }
          ]
        }
      ]
    },
    {
      id: "cl-u2",
      title: { de: "Einheit 2 — Arbeiten vor Gästen", en: "Unit 2 — Working in front of guests", tr: "Ünite 2 — Misafirlerin önünde çalışmak", sk: "Jednotka 2 — Práca pred hosťami", pl: "Jednostka 2 — Praca przy gościach", hr: "Cjelina 2 — Rad pred gostima", sr: "Celina 2 — Rad pred gostima", sl: "Enota 2 — Delo pred gosti" },
      subtitle: { de: "Du arbeitest sicher und leise, während Gäste da sind.",
                  en: "You work safely and quietly while guests are around.",
                  tr: "Misafirler varken güvenli ve sessiz çalışırsın.",
                  sk: "Pracuješ bezpečne a ticho, kým sú hostia nablízku.",
                  pl: "Pracujesz bezpiecznie i cicho, kiedy są goście.",
                  hr: "Radiš sigurno i tiho dok su gosti prisutni.",
                  sr: "Radiš bezbedno i tiho dok su gosti prisutni.",
                  sl: "Delaš varno in tiho, medtem ko so gostje prisotni." },
      lessons: [
        {
          id: "cl-u2-l1",
          title: { de: "Absperren und Rutschgefahr", en: "Cordoning off and slip hazards", tr: "Alanı kapatma ve kayma tehlikesi", sk: "Ohradenie a riziko pošmyknutia", pl: "Odgradzanie i ryzyko poślizgu", hr: "Ograđivanje i opasnost od klizanja", sr: "Ograđivanje i opasnost od klizanja", sl: "Ograditev in nevarnost zdrsa" },
          kind: "lesson",
          exercises: [
            { id: "cl-19", type: "vocab", term: "die Rutschgefahr", options: ["risk of slipping", "risk of fire", "risk of theft", "risk of noise"], answer: 0,
              tr: { en: "risk of slipping", tr: "kayma tehlikesi", sk: "nebezpečenstvo pošmyknutia" },
              explain: "Nasser Stein in der Lobby ist die häufigste Unfallursache im Hotel. Deshalb immer ein Schild aufstellen." },
            { id: "cl-20", type: "order", prompt: "Boden im Gang nass wischen", steps: ["Warnschild aufstellen", "Eine Hälfte wischen", "Trocknen lassen", "Andere Hälfte wischen", "Schild wegräumen"],
              explain: "Immer nur eine Hälfte. So kann der Gast trocken vorbeigehen und muss nicht warten." },
            { id: "cl-21", type: "truefalse", statement: "Wenn du nur kurz wischst, brauchst du kein Warnschild.", answer: false,
              explain: "Ein Sturz passiert in einer Sekunde. Das Schild steht, sobald der erste Tropfen auf dem Boden ist." },
            { id: "cl-22", type: "choice", prompt: "Ein Gast geht trotz Schild über den nassen Boden. Was tust du?", options: ["Nichts sagen", "Freundlich warnen und die trockene Seite zeigen", "Laut rufen", "Schild wegnehmen"], answer: 1,
              explain: "Freundlich hinweisen und den trockenen Weg zeigen. Ein Handzeichen reicht, wenn die Sprache fehlt." },
            { id: "cl-23", type: "match", prompt: "Situation und Maßnahme", pairs: [["Nasser Boden", "Warnschild"], ["Kabel im Gang", "Kabel an der Wand führen"], ["Leiter im Einsatz", "Bereich absperren"], ["Scherben", "Sofort absichern"]],
              explain: "Jede Gefahr wird sichtbar gemacht, bevor du weiterarbeitest. Absichern kommt immer vor Aufräumen." },
            { id: "cl-24", type: "build", prompt: "Warne einen Gast vor dem nassen Boden.", answer: ["Achtung", "der", "Boden", "ist", "nass"], distractors: ["trocken", "morgen", "fertig"],
              explain: "Fünf Wörter, die einen Sturz verhindern. Sag sie freundlich und zeig dabei auf den Boden." }
          ]
        },
        {
          id: "cl-u2-l2",
          title: { de: "Lärm, Randzeiten und Gäste", en: "Noise, quiet hours and guests", tr: "Gürültü, sessiz saatler ve misafirler", sk: "Hluk, okrajové časy a hostia", pl: "Hałas, godziny brzegowe i goście", hr: "Buka, rubni termini i gosti", sr: "Buka, rubni termini i gosti", sl: "Hrup, robni časi in gostje" },
          kind: "lesson",
          exercises: [
            { id: "cl-25", type: "vocab", term: "die Randzeit", options: ["off-peak time", "closing time", "overtime", "break time"], answer: 0,
              tr: { en: "off-peak time", tr: "sakin saatler", sk: "okrajový čas" },
              explain: "Randzeiten sind früh am Morgen oder spät am Abend. Da sind wenige Gäste unterwegs — die beste Zeit für laute Arbeit." },
            { id: "cl-26", type: "choice", prompt: "Wann saugst du den Gang vor den Zimmern?", options: ["Um 6 Uhr früh", "Ab etwa 9 Uhr", "Um 22 Uhr", "Während dem Frühstück im Gang direkt"], answer: 1,
              explain: "Vor 8 Uhr schlafen noch Gäste. Nach dem Frühstück ist der Gang leer und der Lärm stört niemanden." },
            { id: "cl-27", type: "truefalse", statement: "In der Nachtschicht darfst du in der Lobby die Poliermaschine verwenden, weil keine Gäste da sind.", answer: false,
              explain: "Die Lobby liegt oft unter Zimmern, und laute Maschinen hört man im ganzen Haus. Laute Geräte nur nach Absprache mit der Rezeption." },
            { id: "cl-28", type: "build", prompt: "Entschuldige dich freundlich bei einem Gast.", answer: ["Entschuldigung", "ich", "bin", "gleich", "fertig"], distractors: ["nicht", "kaputt", "morgen"],
              explain: "Der Gast will wissen, wie lange es dauert. Ein Satz reicht und die Situation ist entspannt." },
            { id: "cl-29", type: "match", prompt: "Zeit und passende Arbeit", pairs: [["Früh vor dem Frühstück", "Lobby und Eingang"], ["Vormittag", "Gänge saugen"], ["Nachmittag", "Wellness und Fitness"], ["Abend", "Gäste-WC kontrollieren"]],
              explain: "Arbeite immer dort, wo gerade keine Gäste sind. So störst du nie und wirst selbst nicht gestört." },
            { id: "cl-30", type: "order", prompt: "Ein Gast will durch den Bereich, in dem du arbeitest", steps: ["Arbeit kurz unterbrechen", "Gerät zur Seite stellen", "Platz machen und grüßen", "Gast durchgehen lassen", "Weiterarbeiten"],
              explain: "Der Gast hat immer Vorrang. Zehn Sekunden Unterbrechung sind billiger als eine schlechte Bewertung." }
          ]
        },
        {
          id: "cl-u2-l3",
          title: { de: "Prüfung — Vor Gästen arbeiten", en: "Test — Working in front of guests", tr: "Sınav — Misafirlerin önünde çalışmak", sk: "Test — Práca pred hosťami", pl: "Test — Praca przy gościach", hr: "Provjera — Rad pred gostima", sr: "Provera — Rad pred gostima", sl: "Preverjanje — Delo pred gosti" },
          kind: "checkpoint",
          exercises: [
            { id: "cl-31", type: "truefalse", statement: "Beim Arbeiten im Gästebereich grüßt du jeden Gast, den du siehst.", answer: true,
              explain: "Ein kurzes Grüß Gott oder Guten Morgen genügt. Gäste merken sich freundliche Mitarbeiter, nicht den Boden." },
            { id: "cl-32", type: "choice", prompt: "Ein Gast fragt dich etwas und du verstehst nichts. Was tust du?", options: ["Weggehen", "Freundlich lächeln und zur Rezeption begleiten", "Nicken und weiterarbeiten", "Lauter sprechen"], answer: 1,
              explain: "Du musst nicht alles verstehen. Wer den Gast zur Rezeption bringt, hat den Job richtig gemacht." },
            { id: "cl-33", type: "vocab", term: "der Handlauf", options: ["the handrail", "the doormat", "the ceiling", "the shelf"], answer: 0,
              tr: { en: "handrail", tr: "küpeşte", sk: "zábradlie" },
              explain: "Der Handlauf im Stiegenhaus wird von allen angefasst. Er wird täglich gewischt und desinfiziert." },
            { id: "cl-34", type: "order", prompt: "Lobby am Vormittag auffrischen", steps: ["Müll und Gläser wegräumen", "Tische abwischen", "Glastür putzen", "Boden saugen", "Polster und Sessel richten"],
              explain: "Erst wegräumen, dann reinigen, zuletzt richten. Gerade gerückte Sessel machen den größten Unterschied im Eindruck." },
            { id: "cl-35", type: "match", prompt: "Gastsituation und richtige Reaktion", pairs: [["Gast steht im Weg", "Warten und grüßen"], ["Gast fragt nach Weg", "Zeigen oder begleiten"], ["Gast beschwert sich", "Rezeption holen"], ["Gast raucht drinnen", "Rezeption informieren"]],
              explain: "Du löst nichts allein, was zur Rezeption gehört. Weiterleiten ist keine Schwäche, sondern der Ablauf im Haus." },
            { id: "cl-36", type: "build", prompt: "Sage einem Gast, dass er hier durchgehen kann.", answer: ["Sie", "können", "hier", "durchgehen"], distractors: ["nicht", "kaputt", "später"],
              explain: "Zeig dabei mit der Hand auf die trockene Seite. Wort und Geste zusammen versteht jeder Gast." }
          ]
        }
      ]
    },
    {
      id: "cl-u3",
      title: { de: "Einheit 3 — Wellness, Müll & Sicherheit", en: "Unit 3 — Spa, waste & safety", tr: "Ünite 3 — Spa, çöp ve güvenlik", sk: "Jednotka 3 — Wellness, odpad a bezpečnosť", pl: "Jednostka 3 — Wellness, śmieci i bezpieczeństwo", hr: "Cjelina 3 — Wellness, otpad i sigurnost", sr: "Celina 3 — Wellness, otpad i bezbednost", sl: "Enota 3 — Wellness, odpadki in varnost" },
      subtitle: { de: "Du machst Sauna und Fitness hygienisch und meldest Gefahren richtig.",
                  en: "You clean sauna and gym hygienically and report hazards properly.",
                  tr: "Sauna ve fitness alanını hijyenik temizlersin ve tehlikeleri doğru bildirirsin.",
                  sk: "Saunu a fitness upratuješ hygienicky a nebezpečenstvá hlásiš správne.",
                  pl: "Czyścisz saunę i siłownię higienicznie i prawidłowo zgłaszasz zagrożenia.",
                  hr: "Saunu i teretanu čistiš higijenski i opasnosti prijavljuješ ispravno.",
                  sr: "Saunu i teretanu čistiš higijenski i opasnosti prijavljuješ ispravno.",
                  sl: "Savno in fitnes očistiš higiensko in nevarnosti pravilno javiš." },
      lessons: [
        {
          id: "cl-u3-l1",
          title: { de: "Wellness und Fitness", en: "Spa and gym", tr: "Spa ve fitness", sk: "Wellness a fitness", pl: "Wellness i siłownia", hr: "Wellness i teretana", sr: "Wellness i teretana", sl: "Wellness in fitnes" },
          kind: "lesson",
          exercises: [
            { id: "cl-37", type: "vocab", term: "der Barfußbereich", options: ["barefoot area", "car park", "storage room", "smoking area"], answer: 0,
              tr: { en: "barefoot area", tr: "çıplak ayak alanı", sk: "priestor pre bosé nohy" },
              explain: "Im Wellness gehen alle ohne Schuhe. Dort wird der Boden desinfiziert, nicht nur gewischt — sonst wandern Fußpilze weiter." },
            { id: "cl-38", type: "order", prompt: "Sauna reinigen nach dem Betrieb", steps: ["Sauna abkühlen lassen", "Handtücher und Müll rausholen", "Bänke mit Saunareiniger wischen", "Boden desinfizieren", "Lüften und trocknen lassen"],
              explain: "Nie in die heiße Sauna. Erst abkühlen lassen, sonst verdampft das Mittel und du atmest es ein." },
            { id: "cl-39", type: "truefalse", statement: "Saunabänke aus Holz putzt du mit viel Wasser und starkem Reiniger.", answer: false,
              explain: "Holz nur feucht und mit dem dafür vorgesehenen Mittel. Zu viel Wasser lässt das Holz aufquellen und splittern." },
            { id: "cl-40", type: "choice", prompt: "Was kontrollierst du im Fitnessraum mehrmals täglich?", options: ["Die Fenster", "Griffe, Matten und Desinfektionsspender", "Die Decke", "Die Steckdosen"], answer: 1,
              explain: "Schweiß bleibt an Griffen und Matten. Ein leerer Desinfektionsspender ist im Fitnessraum ein sofortiger Reklamationsgrund." },
            { id: "cl-41", type: "match", prompt: "Wellness-Bereich und Hauptaufgabe", pairs: [["Sauna", "Bänke und Boden"], ["Dusche", "Kalk und Abfluss"], ["Ruheraum", "Frische Tücher auflegen"], ["Pool-Rand", "Rutschgefahr prüfen"]],
              explain: "Jeder Bereich hat einen typischen Schwachpunkt. Wer den kennt, sieht in fünf Sekunden, ob alles passt." },
            { id: "cl-42", type: "build", prompt: "Melde, dass die Sauna noch benutzt wird.", answer: ["In", "der", "Sauna", "ist", "noch", "ein", "Gast"], distractors: ["leer", "kaputt"],
              explain: "Nie im Wellness reinigen, solange Gäste da sind. Melde es und komm später zurück." }
          ]
        },
        {
          id: "cl-u3-l2",
          title: { de: "Müll und Trennung", en: "Waste and separation", tr: "Çöp ve ayrıştırma", sk: "Odpad a triedenie", pl: "Śmieci i segregacja", hr: "Otpad i odvajanje", sr: "Otpad i odvajanje", sl: "Odpadki in ločevanje" },
          kind: "lesson",
          exercises: [
            { id: "cl-43", type: "vocab", term: "die Mülltrennung", options: ["waste separation", "waste collection", "recycling bin", "cleaning plan"], answer: 0,
              tr: { en: "waste separation", tr: "çöp ayrıştırma", sk: "triedenie odpadu" },
              explain: "Falsch getrennter Müll kostet das Haus Geld, weil die Entsorgung teurer wird. Deshalb wird im Hotel konsequent getrennt." },
            { id: "cl-44", type: "match", prompt: "Abfall und Tonne", pairs: [["Flasche", "Altglas"], ["Zeitung", "Papier"], ["Joghurtbecher", "Kunststoff"], ["Kaffeesud", "Biomüll"]],
              explain: "Vier Tonnen, die es in fast jedem Haus gibt. Im Zweifel fragen statt raten — falsch getrennt ist schlimmer als gefragt." },
            { id: "cl-45", type: "choice", prompt: "Im Mülleimer im Gäste-WC liegt eine Spritze. Was tust du?", options: ["Mit der Hand rausnehmen", "Nicht anfassen und sofort melden", "In den Restmüll kippen", "Liegen lassen und nichts sagen"], answer: 1,
              explain: "Spitze Gegenstände nie mit der Hand anfassen. Verletzungsgefahr — das übernimmt eine eingeschulte Person mit dem richtigen Behälter." },
            { id: "cl-46", type: "truefalse", statement: "Volle Müllsäcke darfst du im Gang stehen lassen, bis du fertig bist.", answer: false,
              explain: "Müll im Gästebereich sieht schlecht aus und riecht. Volle Säcke kommen sofort in den Müllraum." },
            { id: "cl-47", type: "order", prompt: "Müll aus dem Gäste-WC entsorgen", steps: ["Handschuhe anziehen", "Sack zubinden", "Neuen Sack einsetzen", "Sack in den Müllraum bringen", "Hände waschen"],
              explain: "Sack zubinden, nicht zusammendrücken. Beim Drücken kann Glas oder Metall durch den Sack schneiden." },
            { id: "cl-48", type: "build", prompt: "Sage, dass der Müllraum voll ist.", answer: ["Der", "Müllraum", "ist", "voll"], distractors: ["leer", "sauber", "morgen"],
              explain: "Früh melden, damit die Abholung rechtzeitig kommt. Ein voller Müllraum blockiert die ganze Schicht." }
          ]
        },
        {
          id: "cl-u3-l3",
          title: { de: "Prüfung — Sicher im ganzen Haus", en: "Test — Safe throughout the house", tr: "Sınav — Tüm otelde güvenlik", sk: "Test — Bezpečne v celom dome", pl: "Test — Bezpiecznie w całym hotelu", hr: "Provjera — Sigurno u cijeloj kući", sr: "Provera — Bezbedno u celoj kući", sl: "Preverjanje — Varno v celi hiši" },
          kind: "checkpoint",
          exercises: [
            { id: "cl-49", type: "vocab", term: "der Fluchtweg", options: ["escape route", "service lift", "main corridor", "delivery entrance"], answer: 0,
              tr: { en: "escape route", tr: "kaçış yolu", sk: "úniková cesta" },
              explain: "Fluchtwege bleiben immer frei. Dein Wagen, Müllsäcke oder eine Leiter dürfen nie dort stehen." },
            { id: "cl-50", type: "truefalse", statement: "Eine Brandschutztür im Stiegenhaus darfst du beim Arbeiten mit einem Keil offen halten.", answer: false,
              explain: "Brandschutztüren müssen zufallen können. Offen gekeilt lassen sie im Ernstfall Rauch ins ganze Stiegenhaus." },
            { id: "cl-51", type: "order", prompt: "Ein Glas ist in der Lobby zerbrochen", steps: ["Bereich sichern und Gäste fernhalten", "Handschuhe anziehen", "Große Scherben aufheben", "Kleine Splitter aufsaugen", "Boden nachwischen"],
              explain: "Zuerst sichern, dann aufräumen. Kleine Splitter sieht man nicht — deshalb immer saugen und nachwischen." },
            { id: "cl-52", type: "choice", prompt: "Du entdeckst am Abend eine kaputte Lampe im dunklen Stiegenhaus. Was tust du?", options: ["Bis morgen warten", "Sofort der Rezeption melden", "Selbst reparieren", "Aufschreiben und am Monatsende melden"], answer: 1,
              explain: "Ein dunkles Stiegenhaus ist eine Sturzgefahr. Sofort melden, damit noch am selben Abend Licht gemacht wird." },
            { id: "cl-53", type: "match", prompt: "Gefahr und richtige Reaktion", pairs: [["Wasser am Boden", "Absichern und melden"], ["Scherben", "Handschuhe und aufsaugen"], ["Blockierter Fluchtweg", "Sofort frei machen"], ["Fremde Person im Personalraum", "Rezeption rufen"]],
              explain: "Vier Standardsituationen im öffentlichen Bereich. Wer sie kennt, muss nie improvisieren." },
            { id: "cl-54", type: "build", prompt: "Melde eine Gefahr am Gang.", answer: ["Im", "Gang", "ist", "Wasser"], distractors: ["trocken", "fertig", "morgen"],
              explain: "Kurz und klar. Damit weiß die Rezeption sofort, wo etwas passiert ist, auch ohne viel Deutsch." }
          ]
        }
      ]
    }
  ]
};
