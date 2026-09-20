import React, { useEffect, useState } from "react";
import { BedDouble, Check, Clock, Flag, ConciergeBell, Flame, Heart, SprayCan, Star, Trophy, UtensilsCrossed } from "lucide-react";
import { ROLES, getRole } from "./tasks/index.js";
import { stagesOf, formatTime, STAR_TEXT } from "./stages.js";
import { LANGS, t } from "./i18n.js";
import * as store from "./store.js";
import TaskPlayer, { Stars } from "./TaskPlayer.jsx";
import "./learn.css";

const ICONS = { BedDouble, ConciergeBell, UtensilsCrossed, SprayCan };

/* Oberflaechentexte */
const UI = {
  pickRole:  { de: "Was machst du im Haus?", en: "What do you do here?", pl: "Czym się tu zajmujesz?",
               hr: "Što radiš u kući?", sr: "Šta radiš u kući?" },
  pickHint:  { de: "Wähle deine Rolle. Du lernst die Handgriffe, die du wirklich brauchst.",
               en: "Choose your role. You learn the moves you actually need.",
               pl: "Wybierz swoją rolę. Nauczysz się tego, czego naprawdę potrzebujesz.",
               hr: "Odaberi svoju ulogu. Učiš pokrete koji ti stvarno trebaju.",
               sr: "Izaberi svoju ulogu. Učiš pokrete koji ti stvarno trebaju." },
  yourLang:  { de: "Deine Sprache", en: "Your language", pl: "Twój język", hr: "Tvoj jezik", sr: "Tvoj jezik" },
  tasks:     { de: "Tätigkeiten", en: "tasks", pl: "zadania", hr: "zadaci", sr: "zadaci" },
  yourTasks: { de: "Deine Tätigkeiten", en: "Your tasks", pl: "Twoje zadania",
               hr: "Tvoji zadaci", sr: "Tvoji zadaci" },
  learningPath: { de: "Dein Lernpfad", en: "Your learning path", pl: "Twoja ścieżka nauki",
                  hr: "Tvoj put učenja", sr: "Tvoj put učenja" },
  pathHint: { de: "Eine Tätigkeit nach der anderen – in deinem Tempo.", en: "One task at a time — at your pace.",
              pl: "Jedno zadanie po drugim — we własnym tempie.", hr: "Jedan zadatak za drugim — tvojim tempom.",
              sr: "Jedan zadatak za drugim — tvojim tempom." },
  completed: { de: "abgeschlossen", en: "completed", pl: "ukończono", hr: "završeno", sr: "završeno" },
  startTask: { de: "Starten", en: "Start", pl: "Zacznij", hr: "Pokreni", sr: "Pokreni" },
  repeatTask: { de: "Wiederholen", en: "Practice again", pl: "Powtórz", hr: "Ponovi", sr: "Ponovi" },
  switch:    { de: "Rolle wechseln", en: "Switch role", pl: "Zmień rolę", hr: "Promijeni ulogu", sr: "Promeni ulogu" },
  days:      { de: "Tage", en: "days", pl: "dni", hr: "dana", sr: "dana" },
  min:       { de: "Min", en: "min", pl: "min", hr: "min", sr: "min" },
  perfect:   { de: "Perfekt!", en: "Perfect!", pl: "Idealnie!", hr: "Savršeno!", sr: "Savršeno!" },
  doneT:     { de: "Geschafft!", en: "Done!", pl: "Udało się!", hr: "Uspjelo!", sr: "Uspelo!" },
  perfectS:  { de: "Alles auf Anhieb richtig.", en: "Everything right first time.",
               pl: "Wszystko dobrze za pierwszym razem.", hr: "Sve točno iz prve.", sr: "Sve tačno iz prve." },
  doneS:     { de: "Du hast jeden Schritt richtig gelöst.", en: "You solved every step correctly.",
               pl: "Rozwiązałeś poprawnie każdy krok.", hr: "Riješio si svaki korak točno.",
               sr: "Rešio si svaki korak tačno." },
  steps:     { de: "Schritte", en: "steps", pl: "kroki", hr: "koraci", sr: "koraci" },
  stagesN:   { de: "Etappen", en: "stages", pl: "etapy", hr: "etape", sr: "etape" },
  time:      { de: "Zeit", en: "Time", pl: "Czas", hr: "Vrijeme", sr: "Vreme" },
  best:      { de: "Bestzeit", en: "Best", pl: "Najlepszy", hr: "Najbolje", sr: "Najbolje" },
  backList:  { de: "Zurück zur Übersicht", en: "Back to the list", pl: "Powrót do listy",
               hr: "Natrag na popis", sr: "Nazad na listu" },
  cont:      { de: "Weiter", en: "Continue", pl: "Dalej", hr: "Dalje", sr: "Dalje" }
};

function LangPicker({ lang, setLang, label }) {
  return (
    <div className="ls-lang">
      {label && <span>{t(UI.yourLang, lang)}</span>}
      <div className="ls-lang-row">
        {LANGS.map(([code, name, short]) => (
          <button key={code} type="button"
            className={"ls-lang-btn" + (lang === code ? " active" : "")}
            onClick={() => setLang(code)} title={name}>
            <b>{short}</b> <span className="ls-lang-full">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RoleSelect({ lang, setLang, onPick }) {
  return (
    <div className="ls">
      <header className="ls-head">
        <h1>{t(UI.pickRole, lang)}</h1>
        <p>{t(UI.pickHint, lang)}</p>
      </header>
      <LangPicker lang={lang} setLang={setLang} label />
      <div className="ls-grid">
        {ROLES.map((role) => {
          const Icon = ICONS[role.icon] || BedDouble;
          return (
            <button key={role.id} type="button" className="ls-card" onClick={() => onPick(role.id)}>
              <span className="ls-icon" style={{ background: role.accent }}><Icon size={26} color="#fff" /></span>
              <strong>{t(role.name, lang)}</strong>
              <span className="ls-tag">{t(role.tagline, lang)}</span>
              <p>{t(role.blurb, lang)}</p>
              <span className="ls-meta">{role.tasks.length} {t(UI.tasks, lang)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatBar({ state, role, lang, setLang, onSwitch }) {
  return (
    <>
      <div className="lt-stats">
        <div className="lt-role">
          <strong>{t(role.name, lang)}</strong>
          <button type="button" onClick={onSwitch}>{t(UI.switch, lang)}</button>
        </div>
        <div className="lt-metrics">
          <span><Flame size={18} color="#f0762b" /> <b>{state.streak.count}</b> {t(UI.days, lang)}</span>
          <span><Star size={18} color="#f5b93b" /> <b>{state.xp}</b> XP</span>
          <span><Heart size={18} color="#e0405d" /> <b>{state.hearts.count}</b></span>
        </div>
      </div>
      <LangPicker lang={lang} setLang={setLang} />
    </>
  );
}

function Done({ result, lang, onClose }) {
  return (
    <div className="lt-done">
      <div className="lt-done-card">
        <span className="lt-done-badge"><Trophy size={34} color="#fff" /></span>
        <h2>{t(result.stars === 5 ? UI.perfect : UI.doneT, lang)}</h2>
        <Stars n={result.stars} size={34} />
        <p>{t(STAR_TEXT[result.stars], lang)}</p>
        <div className="lt-done-stats">
          <div><b>+{result.xp}</b><span>XP</span></div>
          <div><b>{formatTime(result.ms)}</b><span>{t(UI.time, lang)}</span></div>
          <div><b>{result.steps}</b><span>{t(UI.steps, lang)}</span></div>
        </div>
        <button type="button" onClick={onClose}>{t(UI.backList, lang)}</button>
      </div>
    </div>
  );
}

export default function LearnTab() {
  const [state, setState] = useState(() => store.syncHearts(store.load()));
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => { store.save(state); }, [state]);

  const lang = state.lang || "de";
  const setLang = (l) => setState((s) => ({ ...s, lang: l }));
  const role = getRole(state.roleId);
  const startTask = (task) => {
    // Nach einem kompletten Rueckwurf darf sofort weitergeuebt werden.
    // Gleichzeitig bleiben Kopfzeile und Player auf demselben Herzestand.
    setState((s) => (s.hearts?.count > 0 ? s : store.refillHearts(s)));
    setActive(task);
  };

  if (!role) {
    return (
      <div className="content-single">
        <RoleSelect lang={lang} setLang={setLang} onPick={(roleId) => setState((s) => ({ ...s, roleId }))} />
      </div>
    );
  }

  if (active) {
    return (
      <TaskPlayer
        task={active}
        lang={lang}
        initialHearts={state.hearts?.count ?? 5}
        onHeartsChange={(count) => setState((s) => ({
          ...s,
          hearts: { count, updatedAt: Date.now() }
        }))}
        onFinish={({ stars, mistakes, resets, ms, steps }) => {
          const xp = 10 + stars * 8;
          setState((s) => store.completeLesson(s, active.id, { xp, stars, ms }));
          setResult({ xp, stars, mistakes, resets, ms, steps });
          setActive(null);
        }}
        onQuit={() => setActive(null)}
      />
    );
  }

  const doneCount = role.tasks.filter((task) => state.lessons[task.id]?.completed).length;
  const pathPercent = Math.round((doneCount / role.tasks.length) * 100);
  const nextTaskId = role.tasks.find((task) => !state.lessons[task.id]?.completed)?.id;

  return (
    <div className="content-single">
      <div className="lt">
        <StatBar state={state} role={role} lang={lang} setLang={setLang}
          onSwitch={() => setState((s) => ({ ...s, roleId: null }))} />
        <section className="lt-unit">
          <div className="lt-unit-head" style={{ background: role.accent }}>
            <div>
              <span>{t(UI.learningPath, lang)}</span>
              <strong>{t(role.name, lang)}</strong>
              <p>{t(UI.pathHint, lang)}</p>
            </div>
            <div className="lt-unit-progress">
              <b>{doneCount}/{role.tasks.length}</b>
              <span>{t(UI.completed, lang)}</span>
            </div>
            <div className="lt-unit-bar" aria-label={`${pathPercent}%`}><span style={{ width: pathPercent + "%" }} /></div>
          </div>
          <div className="lt-path">
          {role.tasks.map((task, i) => {
          const rec = state.lessons[task.id];
          const done = Boolean(rec?.completed);
          const current = task.id === nextTaskId;
          const nStages = stagesOf(task).length;
          return (
            <div key={task.id} className={"lt-path-step " + (i % 2 ? "right" : "left") + (current ? " current" : "") }>
              {i > 0 && <span className="lt-path-line" />}
              <button type="button" className={"lt-path-node" + (done ? " done" : "") + (current ? " current" : "")}
                onClick={() => startTask(task)} aria-label={t(task.title, lang)}>
                {done ? <Check size={25} strokeWidth={3} /> : i + 1}
              </button>
              <button type="button" className={"lt-task" + (done ? " done" : "") + (current ? " current" : "")}
                onClick={() => startTask(task)}>
                <span className="lt-task-main">
                  <strong>{t(task.title, lang)}</strong>
                  <span>{t(task.goal, lang)}</span>
                  {done && <Stars n={rec.stars} size={15} />}
                </span>
                <span className="lt-task-meta">
                  <span><Flag size={13} /> {nStages} {t(UI.stagesN, lang)}</span>
                  <span><Clock size={13} /> {done && rec.bestMs ? formatTime(rec.bestMs) : task.minutes + " " + t(UI.min, lang)}</span>
                  <b>{t(done ? UI.repeatTask : UI.startTask, lang)} →</b>
                </span>
              </button>
            </div>
          );
        })}
          </div>
        </section>
        {result && <Done result={result} lang={lang} onClose={() => setResult(null)} />}
      </div>
    </div>
  );
}
