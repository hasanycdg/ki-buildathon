/**
 * Rolle: Rezeption / Front Office
 * Aufbau siehe ../types.js — 3 Units, je 3 Lessons, je 6 Aufgaben.
 */
export const reception = {
  id: "reception",
  name: { de: "Rezeption", en: "Reception", tr: "Resepsiyon", sk: "Recepcia", pl: "Recepcja", hr: "Recepcija", sr: "Recepcija", sl: "Recepcija" },
  tagline: { de: "Gäste empfangen und das Buchungssystem bedienen",
             en: "Welcoming guests and running the booking system",
             tr: "Misafirleri karşılamak ve rezervasyon sistemini kullanmak",
             sk: "Vítať hostí a obsluhovať rezervačný systém",
             pl: "Przyjmowanie gości i obsługa systemu rezerwacji",
             hr: "Primanje gostiju i rad u sustavu rezervacija",
             sr: "Primanje gostiju i rad u sistemu rezervacija",
             sl: "Sprejemanje gostov in delo z rezervacijskim sistemom" },
  icon: "ConciergeBell",
  accent: "#7c3aed",
  blurb: { de: "Du bist der erste Mensch, den der Gast sieht. Du lernst den Check-in, unser Buchungssystem und die Sätze für schwierige Momente — auch ohne Deutsch.",
           en: "You are the first person the guest sees. You learn check-in, our booking system and the phrases for difficult moments — even without German.",
           tr: "Misafirin gördüğü ilk kişi sensin. Check-in'i, rezervasyon sistemimizi ve zor anlar için cümleleri öğrenirsin — Almanca bilmeden de.",
           sk: "Si prvý človek, ktorého hosť uvidí. Naučíš sa check-in, náš rezervačný systém a vety pre ťažké chvíle — aj bez nemčiny.",
           pl: "Jesteś pierwszą osobą, którą widzi gość. Nauczysz się check-inu, naszego systemu rezerwacji i zdań na trudne chwile — nawet bez niemieckiego.",
           hr: "Ti si prva osoba koju gost vidi. Naučit ćeš prijavu, naš sustav rezervacija i rečenice za teške trenutke — i bez njemačkog.",
           sr: "Ti si prva osoba koju gost vidi. Naučićeš prijavu, naš sistem rezervacija i rečenice za teške trenutke — i bez nemačkog.",
           sl: "Si prva oseba, ki jo gost vidi. Naučiš se prijave, našega rezervacijskega sistema in stavkov za težke trenutke — tudi brez nemščine." },
  units: [
    {
      id: "rc-u1",
      title: { de: "Einheit 1 — Gast & Ankunft", en: "Unit 1 — Guest & arrival", tr: "Ünite 1 — Misafir ve varış", sk: "Jednotka 1 — Hosť a príchod", pl: "Jednostka 1 — Gość i przyjazd", hr: "Cjelina 1 — Gost i dolazak", sr: "Celina 1 — Gost i dolazak", sl: "Enota 1 — Gost in prihod" },
      subtitle: { de: "Du empfängst einen Gast und machst den Check-in allein.",
                  en: "You welcome a guest and handle check-in on your own.",
                  tr: "Bir misafiri karşılar ve check-in'i tek başına yaparsın.",
                  sk: "Privítaš hosťa a check-in zvládneš sám.",
                  pl: "Przyjmujesz gościa i robisz check-in samodzielnie.",
                  hr: "Primaš gosta i sam obaviš prijavu.",
                  sr: "Primaš gosta i sam obaviš prijavu.",
                  sl: "Sprejmeš gosta in prijavo opraviš sam." },
      lessons: [
        {
          id: "rc-u1-l1",
          title: { de: "Wörter an der Rezeption", en: "Words at reception", tr: "Resepsiyonda kelimeler", sk: "Slová na recepcii", pl: "Słowa na recepcji", hr: "Riječi na recepciji", sr: "Reči na recepciji", sl: "Besede na recepciji" },
          kind: "lesson",
          exercises: [
            { id: "rc-1", type: "vocab", term: "die Anreise", options: ["arrival", "departure", "invoice", "cleaning"], answer: 0,
              tr: { en: "arrival", tr: "giriş", sk: "príchod" },
              explain: "Anreise heißt: Der Gast kommt heute an. Auf der Anreiseliste stehen alle Gäste, die du heute erwartest." },
            { id: "rc-2", type: "vocab", term: "die Zimmerkarte", options: ["key card", "guest list", "receipt", "door sign"], answer: 0,
              tr: { en: "key card", tr: "oda kartı", sk: "kľúč od izby" },
              explain: "Mit der Zimmerkarte öffnet der Gast sein Zimmer. Du programmierst sie erst, wenn das Zimmer wirklich fertig ist." },
            { id: "rc-3", type: "vocab", term: "der Meldezettel", options: ["menu card", "registration form", "cleaning plan", "price list"], answer: 1,
              tr: { en: "registration form", tr: "kayıt formu", sk: "registračný formulár" },
              explain: "Jeder Gast unterschreibt bei der Ankunft den Meldezettel. Das ist Pflicht per Gesetz, nicht nur Hausregel." },
            { id: "rc-4", type: "match", prompt: "Wort und Bedeutung", pairs: [["Einzelzimmer", "1 Person"], ["Doppelzimmer", "2 Personen"], ["Halbpension", "Frühstück und Abendessen"], ["Nächtigung", "Eine Nacht im Haus"]],
              explain: "Diese vier Wörter stehen in jeder Buchung. Wer sie kennt, liest die Liste ohne Hilfe." },
            { id: "rc-5", type: "choice", prompt: "Ein Gast steht vor dir. Was tust du zuerst?", options: ["Namen im System suchen", "Grüßen und Blickkontakt", "Zimmerkarte holen", "Telefon abheben"], answer: 1,
              explain: "Zuerst grüßen, dann arbeiten. Der Gast wartet gern, wenn er gesehen wurde — aber nicht, wenn er ignoriert wird." },
            { id: "rc-6", type: "build", prompt: "Begrüße einen Gast am Vormittag.", answer: ["Guten", "Morgen", "herzlich", "willkommen"], distractors: ["Rechnung", "leider", "morgen"],
              explain: "Vier Wörter reichen für einen guten Start. Bis 11 Uhr sagt man 'Guten Morgen', danach 'Guten Tag'." }
          ]
        },
        {
          id: "rc-u1-l2",
          title: { de: "Der Check-in", en: "Check-in", tr: "Check-in", sk: "Check-in", pl: "Check-in", hr: "Prijava", sr: "Prijava", sl: "Prijava" },
          kind: "lesson",
          exercises: [
            { id: "rc-7", type: "order", prompt: "So läuft ein Check-in.", steps: ["Grüßen und nach dem Namen fragen", "Buchung im System suchen", "Meldezettel ausfüllen lassen", "Zimmerkarte programmieren", "Frühstückszeit und Weg zum Zimmer erklären"],
              explain: "Immer dieselbe Reihenfolge. So vergisst du weder den Meldezettel noch die Information zum Frühstück." },
            { id: "rc-8", type: "choice", prompt: "Der Gast kommt um 11 Uhr, das Zimmer ist noch nicht fertig. Was tust du?", options: ["Zimmer trotzdem geben", "Gast wegschicken", "Gepäck annehmen und eine Uhrzeit nennen", "Sagen, er soll später fragen"], answer: 2,
              explain: "Check-in ist meist ab 15 Uhr. Gepäck annehmen und eine konkrete Uhrzeit nennen — 'später' ist keine Antwort." },
            { id: "rc-9", type: "vocab", term: "der Aufenthalt", options: ["stay", "payment", "breakfast", "signature"], answer: 0,
              tr: { en: "stay", tr: "konaklama", sk: "pobyt" },
              explain: "Der Aufenthalt ist die ganze Zeit von der Anreise bis zur Abreise. Im System siehst du dort die Anzahl der Nächte." },
            { id: "rc-10", type: "truefalse", statement: "Du darfst die Zimmernummer laut sagen, wenn andere Gäste danebenstehen.", answer: false,
              explain: "Die Zimmernummer ist Sicherheit. Du zeigst sie leise auf der Karte oder schreibst sie auf, statt sie in die Halle zu rufen." },
            { id: "rc-11", type: "build", prompt: "Frage höflich nach dem Ausweis.", answer: ["Darf", "ich", "Ihren", "Ausweis", "sehen"], distractors: ["nicht", "Zimmer", "heute"],
              explain: "Mit 'Darf ich' klingt jede Frage höflich. Den Ausweis brauchst du für den Meldezettel." },
            { id: "rc-12", type: "match", prompt: "Frage des Gastes und deine Antwort", pairs: [["Wann ist Frühstück?", "Von 7 bis 10 Uhr"], ["Wo ist mein Zimmer?", "Erster Stock, links"], ["Gibt es WLAN?", "Ja, Passwort auf der Karte"], ["Wann muss ich raus?", "Bis 11 Uhr am Abreisetag"]],
              explain: "Das sind die vier häufigsten Fragen bei der Ankunft. Wenn du sie vorher beantwortest, ruft niemand später an." }
          ]
        },
        {
          id: "rc-u1-l3",
          title: { de: "Prüfung — Gast & Ankunft", en: "Test — Guest & arrival", tr: "Sınav — Misafir ve varış", sk: "Test — Hosť a príchod", pl: "Test — Gość i przyjazd", hr: "Provjera — Gost i dolazak", sr: "Provera — Gost i dolazak", sl: "Preverjanje — Gost in prihod" },
          kind: "checkpoint",
          exercises: [
            { id: "rc-13", type: "vocab", term: "die Abreise", options: ["check-out", "check-in", "booking", "complaint"], answer: 0,
              tr: { en: "departure", tr: "çıkış", sk: "odchod" },
              explain: "Abreise heißt: Der Gast geht heute. Diese Zimmer meldest du früh ans Housekeeping, weil neue Gäste warten." },
            { id: "rc-14", type: "choice", prompt: "Ein Gast hat keine Buchung und will ein Zimmer. Was tust du?", options: ["Sagen, wir sind voll", "Freie Zimmer im System prüfen", "Chef anrufen", "Ihn warten lassen"], answer: 1,
              explain: "Zuerst nachsehen. Ein Gast ohne Buchung heißt 'Walk-in' und ist bares Geld für ein kleines Haus." },
            { id: "rc-15", type: "truefalse", statement: "Du gibst die Zimmerkarte erst aus, wenn das Zimmer als sauber gemeldet ist.", answer: true,
              explain: "Nie ein Zimmer vergeben, das Housekeeping noch nicht freigegeben hat. Sonst steht der Gast im ungemachten Zimmer." },
            { id: "rc-16", type: "order", prompt: "Ein Gast reist ab. Was machst du?", steps: ["Nach dem Aufenthalt fragen", "Rechnung öffnen und Extras prüfen", "Zahlung kassieren", "Zimmerkarte zurücknehmen", "Zimmer im System auf Abreise setzen"],
              explain: "Extras wie Minibar oder Getränke zuerst prüfen. Nach der Zahlung kannst du nichts mehr dazubuchen." },
            { id: "rc-17", type: "match", prompt: "Abkürzung auf der Liste", pairs: [["AN", "Anreise"], ["AB", "Abreise"], ["EZ", "Einzelzimmer"], ["DZ", "Doppelzimmer"]],
              explain: "Diese Kürzel stehen auf jeder Tagesliste. Wer sie kennt, braucht keine Erklärung mehr." },
            { id: "rc-18", type: "build", prompt: "Sage dem Gast, dass sein Zimmer bereit ist.", answer: ["Ihr", "Zimmer", "ist", "fertig"], distractors: ["leider", "morgen", "kaputt"],
              explain: "Kurz und klar. Der Gast will nur wissen, ob er hinaufgehen kann." }
          ]
        }
      ]
    },
    {
      id: "rc-u2",
      title: { de: "Einheit 2 — Buchungssystem & Übergabe", en: "Unit 2 — Booking system & handover", tr: "Ünite 2 — Rezervasyon sistemi ve devir", sk: "Jednotka 2 — Rezervačný systém a odovzdanie", pl: "Jednostka 2 — System rezerwacji i przekazanie", hr: "Cjelina 2 — Sustav rezervacija i primopredaja", sr: "Celina 2 — Sistem rezervacija i primopredaja", sl: "Enota 2 — Rezervacijski sistem in predaja" },
      subtitle: { de: "Du bedienst das Buchungssystem und gibst dein Wissen weiter.",
                  en: "You operate the booking system and pass your knowledge on.",
                  tr: "Rezervasyon sistemini kullanır ve bilgini aktarırsın.",
                  sk: "Obsluhuješ rezervačný systém a odovzdávaš svoje znalosti ďalej.",
                  pl: "Obsługujesz system rezerwacji i przekazujesz swoją wiedzę dalej.",
                  hr: "Radiš u sustavu rezervacija i prenosiš svoje znanje dalje.",
                  sr: "Radiš u sistemu rezervacija i prenosiš svoje znanje dalje.",
                  sl: "Delaš z rezervacijskim sistemom in svoje znanje predaš naprej." },
      lessons: [
        {
          id: "rc-u2-l1",
          title: { de: "Das Buchungssystem", en: "The booking system", tr: "Rezervasyon sistemi", sk: "Rezervačný systém", pl: "System rezerwacji", hr: "Sustav rezervacija", sr: "Sistem rezervacija", sl: "Rezervacijski sistem" },
          kind: "lesson",
          exercises: [
            { id: "rc-19", type: "vocab", term: "die Buchung", options: ["booking", "invoice", "key", "shift"], answer: 0,
              tr: { en: "booking", tr: "rezervasyon", sk: "rezervácia" },
              explain: "Eine Buchung ist ein reserviertes Zimmer für bestimmte Nächte. Jede Buchung hat eine Nummer — die suchst du zuerst." },
            { id: "rc-20", type: "order", prompt: "Neue Buchung im System anlegen", steps: ["Datum und Nächte eingeben", "Freies Zimmer auswählen", "Name und Telefonnummer eintragen", "Preis und Verpflegung wählen", "Speichern und Nummer notieren"],
              explain: "Erst das Datum, dann das Zimmer. Wer den Namen zuerst eintippt, muss bei belegten Zimmern von vorne beginnen." },
            { id: "rc-21", type: "choice", prompt: "Das System zeigt ein Zimmer als frei, aber der Kalender an der Wand nicht. Was gilt?", options: ["Der Kalender", "Das System", "Nachfragen und beides prüfen", "Das Zimmer bleibt leer"], answer: 2,
              explain: "Bei zwei Quellen nie raten. Nachfragen und danach die falsche Stelle sofort korrigieren, damit der Fehler nicht bleibt." },
            { id: "rc-22", type: "truefalse", statement: "Wenn du etwas Neues am System herausfindest, schreibst du es in die Anleitung im Haus.", answer: true,
              explain: "Genau so bleibt Wissen im Haus. Sonst weiß es wieder nur eine Person — und die geht irgendwann." },
            { id: "rc-23", type: "match", prompt: "Feld im System und Bedeutung", pairs: [["Status", "Frei, belegt oder reserviert"], ["Rate", "Preis pro Nacht"], ["Verpflegung", "Frühstück oder Halbpension"], ["Notiz", "Wünsche des Gastes"]],
              explain: "Vier Felder, die du bei jeder Buchung siehst. Die Notiz ist wichtig: dort steht zum Beispiel 'Allergie' oder 'spätes Anreisen'." },
            { id: "rc-24", type: "build", prompt: "Frage eine Kollegin um Hilfe am System.", answer: ["Kannst", "du", "mir", "das", "zeigen"], distractors: ["nicht", "später", "fertig"],
              explain: "Einmal fragen und mitschreiben ist besser als zehnmal raten. Danach schreibst du es in die Anleitung." }
          ]
        },
        {
          id: "rc-u2-l2",
          title: { de: "Übergabe & Wissen sichern", en: "Handover & securing knowledge", tr: "Devir ve bilgiyi kayıt altına alma", sk: "Odovzdanie a zaistenie znalostí", pl: "Przekazanie i zapisanie wiedzy", hr: "Primopredaja i osiguranje znanja", sr: "Primopredaja i osiguranje znanja", sl: "Predaja in zavarovanje znanja" },
          kind: "lesson",
          exercises: [
            { id: "rc-25", type: "order", prompt: "Schichtübergabe an die Kollegin", steps: ["Übergabebuch öffnen", "Offene Anreisen durchgehen", "Probleme und Beschwerden nennen", "Kassa und Belege prüfen", "Übergabe unterschreiben"],
              explain: "Nur was im Übergabebuch steht, ist wirklich übergeben. Mündlich vergisst man in fünf Minuten die Hälfte." },
            { id: "rc-26", type: "vocab", term: "das Übergabebuch", options: ["handover log", "guest book", "price list", "menu"], answer: 0,
              tr: { en: "handover log", tr: "devir defteri", sk: "kniha odovzdania zmeny" },
              explain: "Im Übergabebuch steht alles Offene der Schicht. Es ist das Gedächtnis der Rezeption, nicht dein Notizzettel." },
            { id: "rc-27", type: "truefalse", statement: "Ein Passwort fürs Buchungssystem darfst du auf einen Zettel unter die Tastatur legen.", answer: false,
              explain: "Zugangsdaten gehören an einen sicheren Ort, den der Chef kennt — nicht unter die Tastatur, wo jeder Gast hinkommt." },
            { id: "rc-28", type: "choice", prompt: "Nur eine Kollegin weiß, wie man im System storniert. Was ist richtig?", options: ["Sie immer anrufen", "Einmal zeigen lassen und Schritte aufschreiben", "Nie stornieren", "Buchung löschen"], answer: 1,
              explain: "Einmal zeigen lassen, mitschreiben, ins Handbuch legen. Dann kann es morgen jeder — auch wenn die Kollegin kündigt." },
            { id: "rc-29", type: "match", prompt: "Wohin gehört die Information?", pairs: [["Gast kommt um 23 Uhr", "Übergabebuch"], ["Zimmer 8 hat kaputte Lampe", "Technik melden"], ["Neuer Schritt im System", "Hausanleitung"], ["Gast hat Nussallergie", "Notiz in der Buchung"]],
              explain: "Jede Information hat einen festen Platz. Was nur im Kopf bleibt, ist am nächsten Tag weg." },
            { id: "rc-30", type: "build", prompt: "Sage, dass du die Schicht übergibst.", answer: ["Ich", "übergebe", "dir", "die", "Schicht"], distractors: ["morgen", "nicht", "Zimmer"],
              explain: "Ein klarer Satz beendet die Schicht. Danach ist die Kollegin verantwortlich, nicht mehr du." }
          ]
        },
        {
          id: "rc-u2-l3",
          title: { de: "Prüfung — System & Übergabe", en: "Test — System & handover", tr: "Sınav — Sistem ve devir", sk: "Test — Systém a odovzdanie", pl: "Test — System i przekazanie", hr: "Provjera — Sustav i primopredaja", sr: "Provera — Sistem i primopredaja", sl: "Preverjanje — Sistem in predaja" },
          kind: "checkpoint",
          exercises: [
            { id: "rc-31", type: "order", prompt: "Ein Gast will seine Buchung um eine Nacht verlängern.", steps: ["Im System prüfen, ob das Zimmer frei bleibt", "Preis für die Zusatznacht nennen", "Buchung verlängern und speichern", "Housekeeping informieren", "Im Übergabebuch notieren"],
              explain: "Erst prüfen, dann zusagen. Und immer dem Housekeeping sagen — sonst wird das Zimmer als Abreise gereinigt." },
            { id: "rc-32", type: "choice", prompt: "Du hast beim Buchen ein falsches Datum gespeichert. Was tust du?", options: ["Nichts sagen", "Sofort korrigieren und melden", "Buchung löschen", "Am Schichtende korrigieren"], answer: 1,
              explain: "Fehler sofort melden ist nie ein Problem, ein verschwiegener Fehler schon. Am Abend steht sonst ein Gast ohne Zimmer da." },
            { id: "rc-33", type: "truefalse", statement: "Eine Stornierung wird im System dokumentiert, nicht einfach gelöscht.", answer: true,
              explain: "Storniert statt gelöscht: So sieht man später, wer wann abgesagt hat — wichtig bei Streit um Stornokosten." },
            { id: "rc-34", type: "vocab", term: "die Stornierung", options: ["cancellation", "confirmation", "extension", "upgrade"], answer: 0,
              tr: { en: "cancellation", tr: "iptal", sk: "zrušenie rezervácie" },
              explain: "Der Gast sagt seine Buchung ab. Prüfe immer die Frist — danach kostet die Stornierung Geld." },
            { id: "rc-35", type: "match", prompt: "Situation und richtiger Ort im System", pairs: [["Gast reist früher ab", "Buchung kürzen"], ["Gast bleibt länger", "Buchung verlängern"], ["Gast sagt ab", "Stornieren"], ["Gast wechselt Zimmer", "Zimmer umbuchen"]],
              explain: "Vier Standardfälle. Wenn du weißt, welcher Fall vorliegt, findest du im System immer den richtigen Knopf." },
            { id: "rc-36", type: "build", prompt: "Schreibe eine Notiz ins Übergabebuch.", answer: ["Zimmer", "12", "kommt", "spät", "an"], distractors: ["sauber", "leider", "morgen"],
              explain: "Kurze Notizen liest die Nachtschicht wirklich. Lange Texte werden überblättert." }
          ]
        }
      ]
    },
    {
      id: "rc-u3",
      title: { de: "Einheit 3 — Schwierige Situationen", en: "Unit 3 — Difficult situations", tr: "Ünite 3 — Zor durumlar", sk: "Jednotka 3 — Ťažké situácie", pl: "Jednostka 3 — Trudne sytuacje", hr: "Cjelina 3 — Teške situacije", sr: "Celina 3 — Teške situacije", sl: "Enota 3 — Težke situacije" },
      subtitle: { de: "Du bleibst ruhig bei Beschwerden, am Telefon und im Notfall.",
                  en: "You stay calm with complaints, on the phone and in an emergency.",
                  tr: "Şikâyetlerde, telefonda ve acil durumda sakin kalırsın.",
                  sk: "Zostaneš pokojný pri sťažnostiach, na telefóne aj v núdzi.",
                  pl: "Zachowujesz spokój przy reklamacjach, przy telefonie i w nagłym wypadku.",
                  hr: "Ostaješ miran kod pritužbi, na telefonu i u hitnom slučaju.",
                  sr: "Ostaješ miran kod žalbi, na telefonu i u hitnom slučaju.",
                  sl: "Ostaneš miren pri pritožbah, na telefonu in v nujnem primeru." },
      lessons: [
        {
          id: "rc-u3-l1",
          title: { de: "Beschwerden", en: "Complaints", tr: "Şikâyetler", sk: "Sťažnosti", pl: "Reklamacje", hr: "Pritužbe", sr: "Žalbe", sl: "Pritožbe" },
          kind: "lesson",
          exercises: [
            { id: "rc-37", type: "choice", prompt: "Ein Gast beschwert sich laut über sein Zimmer. Was tust du zuerst?", options: ["Widersprechen", "Zuhören und ausreden lassen", "Chef holen", "Rabatt anbieten"], answer: 1,
              explain: "Zuerst zuhören. Die meisten Gäste werden ruhig, sobald sie merken, dass sie ernst genommen werden." },
            { id: "rc-38", type: "vocab", term: "die Beschwerde", options: ["complaint", "compliment", "invoice", "request"], answer: 0,
              tr: { en: "complaint", tr: "şikâyet", sk: "sťažnosť" },
              explain: "Eine Beschwerde ist eine Chance: Ein Gast, der reklamiert, gibt dir die Möglichkeit, es zu reparieren." },
            { id: "rc-39", type: "truefalse", statement: "Bei einer Beschwerde sagst du zuerst, wer schuld ist.", answer: false,
              explain: "Schuld interessiert den Gast nicht. Er will eine Lösung — Sätze wie 'das war Housekeeping' machen es nur schlimmer." },
            { id: "rc-40", type: "order", prompt: "So gehst du mit einer Beschwerde um.", steps: ["Zuhören und ausreden lassen", "Sich entschuldigen", "Das Problem wiederholen", "Eine Lösung anbieten", "Im Übergabebuch notieren"],
              explain: "Wiederholen zeigt, dass du verstanden hast. Notieren sorgt dafür, dass die nächste Schicht nachfragt." },
            { id: "rc-41", type: "match", prompt: "Beschwerde und erste Lösung", pairs: [["Zimmer ist laut", "Anderes Zimmer anbieten"], ["Heizung geht nicht", "Technik rufen"], ["Zimmer nicht sauber", "Housekeeping sofort schicken"], ["WLAN geht nicht", "Passwort prüfen"]],
              explain: "Für diese vier Fälle brauchst du niemanden zu fragen. Du kannst sie sofort selbst lösen." },
            { id: "rc-42", type: "build", prompt: "Entschuldige dich beim Gast.", answer: ["Das", "tut", "mir", "leid"], distractors: ["nicht", "morgen", "Zimmer"],
              explain: "Vier Wörter, die fast jede Beschwerde entschärfen. Sie kosten nichts und sind kein Schuldeingeständnis." }
          ]
        },
        {
          id: "rc-u3-l2",
          title: { de: "Telefon & Notfall", en: "Phone & emergency", tr: "Telefon ve acil durum", sk: "Telefón a núdza", pl: "Telefon i nagły wypadek", hr: "Telefon i hitan slučaj", sr: "Telefon i hitan slučaj", sl: "Telefon in nujni primer" },
          kind: "lesson",
          exercises: [
            { id: "rc-43", type: "vocab", term: "der Notruf", options: ["emergency call", "wake-up call", "room service", "reminder"], answer: 0,
              tr: { en: "emergency call", tr: "acil çağrı", sk: "tiesňové volanie" },
              explain: "In Österreich und Deutschland: 112 für Feuerwehr und Rettung. Die Nummer hängt bei der Rezeption." },
            { id: "rc-44", type: "choice", prompt: "Das Telefon läutet, gleichzeitig steht ein Gast vor dir. Was tust du?", options: ["Telefon ignorieren", "Gast ignorieren", "Gast ansehen, abheben und kurz um Warten bitten", "Weggehen"], answer: 2,
              explain: "Beide bekommen ein Zeichen. Ein Blick zum Gast und ein kurzer Satz am Telefon — niemand fühlt sich übergangen." },
            { id: "rc-45", type: "order", prompt: "So nimmst du einen Anruf an.", steps: ["Hausname und eigener Name", "Zuhören und mitschreiben", "Wichtiges wiederholen", "Nächsten Schritt nennen", "Verabschieden"],
              explain: "Wiederholen verhindert Fehler bei Namen und Daten. Mitschreiben ist Pflicht, auch wenn es einfach klingt." },
            { id: "rc-46", type: "truefalse", statement: "Du sagst am Telefon, in welchem Zimmer ein Gast wohnt.", answer: false,
              explain: "Nie. Du verbindest höchstens durch. Ein fremder Anrufer darf nie erfahren, wo ein Gast schläft." },
            { id: "rc-47", type: "match", prompt: "Notfall und erster Schritt", pairs: [["Feuer", "Alarm auslösen"], ["Gast bewusstlos", "112 rufen"], ["Wasserschaden", "Haupthahn und Technik"], ["Streit in der Bar", "Chef holen"]],
              explain: "Vier Notfälle, vier klare Schritte. Bei Feuer und Rettung nie zuerst den Chef suchen — erst alarmieren." },
            { id: "rc-48", type: "build", prompt: "Melde dich am Telefon.", answer: ["Guten", "Tag", "Rezeption", "Anna", "am", "Apparat"], distractors: ["leider", "Zimmer"],
              explain: "Haus, Abteilung, Name. Der Anrufer weiß sofort, mit wem er spricht." }
          ]
        },
        {
          id: "rc-u3-l3",
          title: { de: "Prüfung — Schwierige Situationen", en: "Test — Difficult situations", tr: "Sınav — Zor durumlar", sk: "Test — Ťažké situácie", pl: "Test — Trudne sytuacje", hr: "Provjera — Teške situacije", sr: "Provera — Teške situacije", sl: "Preverjanje — Težke situacije" },
          kind: "checkpoint",
          exercises: [
            { id: "rc-49", type: "truefalse", statement: "Wenn du eine Frage nicht beantworten kannst, darfst du das sagen.", answer: true,
              explain: "'Ich frage nach und melde mich in zehn Minuten' ist eine gute Antwort. Geraten und falsch ist viel schlimmer." },
            { id: "rc-50", type: "order", prompt: "Ein Gast meldet Feuerrauch im Gang.", steps: ["Alarm auslösen", "112 anrufen", "Gästeliste greifen", "Gäste zum Sammelplatz führen", "Feuerwehr an der Tür einweisen"],
              explain: "Die Gästeliste ist die einzige Information darüber, wer im Haus ist. Ohne sie weiß die Feuerwehr nicht, wen sie sucht." },
            { id: "rc-51", type: "match", prompt: "Situation und richtige Reaktion", pairs: [["Beschwerde", "Zuhören und Lösung"], ["Anruf für einen Gast", "Durchstellen, keine Zimmernummer"], ["Notfall", "Alarm und 112"], ["Offene Frage", "Nachfragen und zurückmelden"]],
              explain: "Vier Standardsituationen an der Rezeption. Wer sie kennt, muss nie improvisieren." },
            { id: "rc-52", type: "vocab", term: "die Gästeliste", options: ["guest list", "wine list", "shift plan", "price list"], answer: 0,
              tr: { en: "guest list", tr: "misafir listesi", sk: "zoznam hostí" },
              explain: "Darauf steht, wer heute im Haus ist. Im Notfall nimmst du sie mit nach draußen." },
            { id: "rc-53", type: "choice", prompt: "Ein Gast will die Rechnung nicht zahlen und wird laut. Was tust du?", options: ["Lauter werden", "Ruhig bleiben und den Chef holen", "Gast hinausbegleiten", "Rechnung streichen"], answer: 1,
              explain: "Geld und Streit sind Chefsache. Du bleibst ruhig, sagst nichts zu, und holst die verantwortliche Person." },
            { id: "rc-54", type: "build", prompt: "Bitte den Gast um einen Moment Geduld.", answer: ["Einen", "Moment", "bitte"], distractors: ["nicht", "morgen", "fertig"],
              explain: "Drei Wörter, die dir Zeit verschaffen. Sie funktionieren am Telefon und am Schalter." }
          ]
        }
      ]
    }
  ]
};
