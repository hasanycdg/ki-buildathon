/**
 * Prueft das gesamte Lern-Curriculum.
 * Ausfuehren:  node src/learn/validate.mjs
 *
 * Faengt genau die Fehler ab, die man im Browser erst merkt, wenn ein
 * Mitarbeiter davorsitzt: fehlende Uebersetzungen, unloesbare Aufgaben,
 * Verweise auf Szenen, die es nicht gibt.
 */
import { ROLES } from "./tasks/index.js";
import { missingTranslations, LANG_CODES, t } from "./i18n.js";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
/* JSX laesst sich in Node nicht importieren — Existenz ueber die Datei pruefen. */
const sceneExists = (key) => existsSync(join(HERE, "scenes", key + ".jsx"));

const SCENE_KEYS = { bed: "BedScene", room: "RoomScene", bath: "BathScene",
                     reception: "ReceptionScene", buffet: "BuffetScene", lobby: "LobbyScene" };
/* So viele Frames hat die jeweilige Animation wirklich. */
const SCENE_FRAMES = { bed: 6, room: 0, bath: 5, reception: 6, buffet: 5, lobby: 4 };

const problems = [];
const warn = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

let tasks = 0, steps = 0;

for (const role of ROLES) {
  const where0 = role.id;
  if (!role.tasks?.length) fail(where0, "keine Taetigkeiten");

  const gaps = missingTranslations(role);
  if (gaps.length) {
    const byLang = {};
    gaps.forEach((g) => { byLang[g.lang] = (byLang[g.lang] || 0) + 1; });
    fail(where0, `${gaps.length} fehlende Uebersetzungen (${Object.entries(byLang).map(([l, n]) => l + ":" + n).join(", ")})`);
    gaps.slice(0, 3).forEach((g) => fail(where0, `  -> ${g.lang} fehlt bei "${g.de.slice(0, 50)}"`));
  }

  const ids = new Set();
  for (const task of role.tasks) {
    tasks++;
    const where = `${role.id}/${task.id}`;
    if (ids.has(task.id)) fail(where, "doppelte Taetigkeits-ID");
    ids.add(task.id);
    if (typeof task.minutes !== "number") fail(where, "minutes fehlt oder ist keine Zahl");
    if (!task.steps?.length) fail(where, "keine Schritte");

    for (const [i, step] of (task.steps || []).entries()) {
      steps++;
      const w = `${where}#${i}(${step.type})`;

      if (step.type !== "demo" && !step.explain) fail(w, "explain fehlt — ohne Begruendung ist es Raten");

      switch (step.type) {
        case "demo": {
          if (!SCENE_KEYS[step.scene]) { fail(w, `unbekannte Szene "${step.scene}"`); break; }
          if (!sceneExists(SCENE_KEYS[step.scene])) fail(w, `Szenendatei ${SCENE_KEYS[step.scene]}.jsx fehlt`);
          const want = SCENE_FRAMES[step.scene];
          if (step.frames?.length !== want)
            fail(w, `${step.frames?.length} Frames, Animation hat aber ${want}`);
          (step.frames || []).forEach((f, j) => {
            if (!f.caption) fail(w, `Frame ${j}: caption fehlt`);
            if (!f.detail) fail(w, `Frame ${j}: detail fehlt`);
          });
          break;
        }
        case "hotspot": {
          if (!SCENE_KEYS[step.scene]) fail(w, `unbekannte Szene "${step.scene}"`);
          if (!step.spots?.length) { fail(w, "keine Zonen"); break; }
          const sids = new Set();
          step.spots.forEach((s) => {
            if (sids.has(s.id)) fail(w, `doppelte Zonen-ID ${s.id}`);
            sids.add(s.id);
            if (!s.label || !s.why) fail(w, `Zone ${s.id}: label oder why fehlt`);
            if (!(s.x >= 0 && s.x <= 100) || !(s.y >= 0 && s.y <= 100))
              fail(w, `Zone ${s.id}: x/y ausserhalb 0-100 (${s.x}/${s.y})`);
            if (!(s.r >= 20 && s.r <= 44)) warn.push(`${w}: Zone ${s.id} Radius ${s.r} ungewoehnlich`);
          });
          break;
        }
        case "sequence": {
          const n = step.steps?.length || 0;
          if (n < 3) fail(w, `nur ${n} Schritte`);
          if (n > 7) warn.push(`${w}: ${n} Schritte sind viel`);
          // Uebersetzte Schritte muessen in JEDER Sprache eindeutig sein,
          // sonst ist die Reihenfolge nicht pruefbar.
          for (const lang of LANG_CODES) {
            const labels = (step.steps || []).map((s) => t(s, lang));
            if (new Set(labels).size !== labels.length)
              fail(w, `doppelte Schritt-Beschriftung in Sprache "${lang}"`);
          }
          break;
        }
        case "decide": {
          const n = step.options?.length || 0;
          if (n < 3) fail(w, `nur ${n} Optionen`);
          if (typeof step.answer !== "number" || step.answer < 0 || step.answer >= n)
            fail(w, `answer ${step.answer} liegt ausserhalb von 0..${n - 1}`);
          break;
        }
        case "checklist": {
          const items = step.items || [];
          const right = items.filter((it) => it.correct).length;
          const wrong = items.length - right;
          if (right < 1) fail(w, "keine richtige Antwort");
          if (wrong < 2) fail(w, `nur ${wrong} falsche Option(en) — zu leicht`);
          break;
        }
        default:
          fail(w, `unbekannter Schritt-Typ "${step.type}"`);
      }
    }
  }
}

console.log(`Rollen: ${ROLES.length} | Taetigkeiten: ${tasks} | Schritte: ${steps} | Sprachen: ${LANG_CODES.join(", ")}`);
for (const role of ROLES) {
  console.log(`  ${String(t(role.name, "de")).padEnd(22)} ${role.tasks.length} Taetigkeiten: ` +
    role.tasks.map((x) => x.steps.length + " Schr.").join(", "));
}
if (warn.length) { console.log("\nHinweise:"); warn.forEach((w) => console.log("  ~ " + w)); }
if (problems.length) {
  console.log(`\n${problems.length} PROBLEME:`);
  problems.forEach((p) => console.log("  ! " + p));
  process.exit(1);
}
console.log("\n>>> Curriculum vollstaendig und fehlerfrei");
