# Etappen — verbindliche Struktur für alle Inhaltsdateien

Eine Tätigkeit hat statt einer flachen `steps`-Liste jetzt **`stages`**:
2–4 Etappen, jede mit einem eigenen **Lernziel**.

```js
{
  id: "hk-bett",
  title: { de, en, pl, hr, sr },
  goal:  { de, en, pl, hr, sr },     // Ziel der GANZEN Tätigkeit, bleibt
  minutes: 4,
  stages: [
    {
      id: "hk-bett-s1",
      goal: { de: "Du kennst die fünf Handgriffe und weißt, warum die Ecken zuerst kommen.",
              en: "...", pl: "...", hr: "...", sr: "..." },
      steps: [ /* wie bisher */ ]
    },
    { id: "hk-bett-s2", goal: {...}, steps: [...] },
    { id: "hk-bett-s3", goal: {...}, steps: [...] }
  ]
}
```

## Warum

Die Etappe ist der **Kontrollpunkt**. Gehen die fünf Herzen aus, wird die
Lernende an den *Anfang der aktuellen Etappe* zurückgesetzt — nicht an den
Anfang der Tätigkeit und schon gar nicht auf „heute nicht mehr". Abgeschlossene
Etappen bleiben erhalten.

Daraus folgt für den Zuschnitt: **Eine Etappe ist so groß, dass ihre
Wiederholung zumutbar ist.** 1–3 Schritte. Niemals 5.

## Regeln für den Zuschnitt

0. **Eine Etappe mit nur einem Schritt ist sinnlos.** Der Rückwurf würde
   dich dann genau dort absetzen, wo du gescheitert bist — die Herzen
   kosten nichts. Bündele 2–3 Schritte, wo die Tätigkeit es hergibt.
   Ein einzelner Schritt ist nur für die Vorführung und für einen
   thematisch alleinstehenden Schluss-Schritt vertretbar.
1. **2 bis 4 Etappen** pro Tätigkeit.
2. Ein `demo`-Schritt steht **immer allein** in der ersten Etappe. Zuschauen
   ist eine eigene Lernphase.
3. Danach 1–3 Schritte pro Etappe, thematisch zusammengehörig.
4. Jede `stage.id` ist `<task-id>-s1`, `-s2`, …
5. **Kein Schritt darf verlorengehen.** Die Summe aller `stage.steps`
   entspricht exakt der bisherigen `steps`-Liste, in derselben Reihenfolge.

## Regeln für das Lernziel

Das Lernziel steht auf der Ansage-Karte vor der Etappe und noch einmal, wenn
die Herzen ausgehen. Es ist das Erste und das Letzte, was die Person liest.

- Formuliere aus **ihrer** Sicht: „**Du** erkennst …", „**Du** kannst …".
- Ein Satz. Konkret und überprüfbar.
- Gut: „Du erkennst an der Matratze, was gemeldet werden muss."
- Schlecht: „Einführung in die Bettenkunde." / „Grundlagen." / „Teil 2."
- In **allen fünf Sprachen**: de, en, pl, hr, sr.

## Prüfen

    node src/learn/validate.mjs

Muss melden: `Curriculum vollstaendig und fehlerfrei`, und für jede Tätigkeit
die Etappenzahl ausweisen.
