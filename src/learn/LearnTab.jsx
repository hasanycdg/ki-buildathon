import React, { useEffect, useMemo, useState } from "react";
import {
  BedDouble, Check, ConciergeBell, Flame, Heart, Lock, RotateCcw,
  SprayCan, Star, Trophy, UtensilsCrossed
} from "lucide-react";
import { ROLES, getRole } from "./roles/index.js";
import { allLessons, countExercises } from "./types.js";
import * as store from "./store.js";
import LessonPlayer from "./LessonPlayer.jsx";
import "./learn.css";

const ICONS = { BedDouble, ConciergeBell, UtensilsCrossed, SprayCan };
const LANGS = [
  ["en", "English"],
  ["tr", "Türkçe"],
  ["sk", "Slovenčina"]
];

/* ------------------------------------------------------- Rollenauswahl */

function RoleSelect({ onPick }) {
  const [lang, setLang] = useState("en");

  return (
    <div className="ls">
      <header className="ls-head">
        <h1>Was machst du im Haus?</h1>
        <p>Wähle deine Rolle. Du lernst genau das, was du für deine Arbeit brauchst — nicht mehr.</p>
      </header>

      <div className="ls-lang">
        <span>Deine Sprache</span>
        <div className="ls-lang-row">
          {LANGS.map(([code, label]) => (
            <button key={code} type="button"
              className={"ls-lang-btn" + (lang === code ? " active" : "")}
              onClick={() => setLang(code)}>
              {label}
            </button>
          ))}
        </div>
        <small>Deutsche Begriffe bekommen eine Übersetzung in dieser Sprache.</small>
      </div>

      <div className="ls-grid">
        {ROLES.map((role) => {
          const Icon = ICONS[role.icon] || BedDouble;
          return (
            <button key={role.id} type="button" className="ls-card" onClick={() => onPick(role.id, lang)}>
              <span className="ls-icon" style={{ background: role.accent }}>
                <Icon size={26} color="#fff" />
              </span>
              <strong>{role.name}</strong>
              <span className="ls-tag">{role.tagline}</span>
              <p>{role.blurb}</p>
              <span className="ls-meta">
                {role.units.length} Einheiten · {countExercises(role)} Aufgaben
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Der Lernpfad */

function StatBar({ state, role, onSwitch }) {
  return (
    <div className="lt-stats">
      <div className="lt-role">
        <strong>{role.name}</strong>
        <button type="button" onClick={onSwitch}>Rolle wechseln</button>
      </div>
      <div className="lt-metrics">
        <span><Flame size={18} color="#f0762b" /> <b>{state.streak.count}</b> Tage</span>
        <span><Star size={18} color="#f5b93b" /> <b>{state.xp}</b> XP</span>
        <span><Heart size={18} color="#e0405d" /> <b>{state.hearts.count}</b></span>
      </div>
    </div>
  );
}

function RefreshCard({ items, onStart }) {
  if (!items.length) return null;
  const top = items[0];
  return (
    <div className="lt-refresh">
      <div className="lt-refresh-icon"><RotateCcw size={22} /></div>
      <div>
        <strong>Zeit zum Auffrischen</strong>
        <p>
          „{top.lesson.title}" sitzt nur noch zu {Math.round(top.strength * 100)} %.
          {items.length > 1 && ` Und ${items.length - 1} weitere.`}
        </p>
      </div>
      <button type="button" onClick={() => onStart(top.lesson)}>Wiederholen</button>
    </div>
  );
}

function LessonNode({ lesson, index, status, strength, accent, onStart }) {
  const offset = [0, 46, 70, 46, 0, -46, -70, -46][index % 8];
  const done = status === "done";
  const locked = status === "locked";
  const ring = Math.round(strength * 100);

  return (
    <div className="lt-node-wrap" style={{ transform: `translateX(${offset}px)` }}>
      <button
        type="button"
        disabled={locked}
        className={"lt-node " + status + (lesson.kind === "checkpoint" ? " checkpoint" : "")}
        style={done ? { background: accent, borderColor: accent } : undefined}
        onClick={() => onStart(lesson)}
        title={lesson.title}
      >
        {locked ? <Lock size={24} /> : done ? (lesson.kind === "checkpoint" ? <Trophy size={26} /> : <Check size={28} />) : <span>{index + 1}</span>}
      </button>
      <span className="lt-node-label">{lesson.title}</span>
      {done && strength < 0.6 && <span className="lt-node-weak">{ring} % — auffrischen</span>}
    </div>
  );
}

function Path({ role, state, onStart }) {
  const ordered = useMemo(() => allLessons(role).map((l) => l.id), [role]);
  let counter = -1;

  return (
    <div className="lt-path">
      {role.units.map((unit) => (
        <section key={unit.id} className="lt-unit">
          <header className="lt-unit-head" style={{ background: role.accent }}>
            <strong>{unit.title}</strong>
            <span>{unit.subtitle}</span>
          </header>
          <div className="lt-nodes">
            {unit.lessons.map((lesson) => {
              counter += 1;
              const done = Boolean(state.lessons[lesson.id]?.completed);
              const unlocked = store.isUnlocked(state, ordered, lesson.id);
              const status = done ? "done" : unlocked ? "open" : "locked";
              return (
                <LessonNode
                  key={lesson.id}
                  lesson={lesson}
                  index={counter}
                  status={status}
                  strength={store.lessonStrength(state, lesson)}
                  accent={role.accent}
                  onStart={onStart}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* --------------------------------------------------- Abschluss-Bildschirm */

function Done({ result, onClose }) {
  return (
    <div className="lt-done">
      <div className="lt-done-card">
        <span className="lt-done-badge"><Trophy size={34} color="#fff" /></span>
        <h2>{result.perfect ? "Perfekt!" : "Geschafft!"}</h2>
        <p>{result.perfect ? "Alles auf Anhieb richtig." : "Du hast jede Aufgabe richtig gelöst — auch die, die du wiederholen musstest."}</p>
        <div className="lt-done-stats">
          <div><b>+{result.xp}</b><span>XP</span></div>
          <div><b>{result.total}</b><span>Aufgaben</span></div>
          <div><b>{result.retries}</b><span>Wiederholt</span></div>
        </div>
        <button type="button" onClick={onClose}>Weiter</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Hauptteil */

export default function LearnTab() {
  const [state, setState] = useState(() => store.syncHearts(store.load()));
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => { store.save(state); }, [state]);

  const role = getRole(state.roleId);

  function pickRole(roleId, lang) {
    setState((s) => ({ ...s, roleId, lang }));
  }

  function startLesson(lesson) {
    setRetries(0);
    setActive(lesson);
  }

  if (!role) return <RoleSelect onPick={pickRole} />;

  const lessons = allLessons(role);
  const refresh = store.needsRefresh(state, lessons);

  if (active) {
    return (
      <LessonPlayer
        lesson={active}
        lang={state.lang}
        hearts={state.hearts.count}
        onHeartLost={() => { setRetries((r) => r + 1); setState((s) => store.loseHeart(s)); }}
        onAnswered={(exerciseId, quality) => setState((s) => store.recordAnswer(s, exerciseId, quality))}
        onFinish={({ xp, perfect }) => {
          setState((s) => store.completeLesson(s, active.id, { xp, perfect }));
          setResult({ xp, perfect, total: active.exercises.length, retries });
          setActive(null);
        }}
        onQuit={() => setActive(null)}
      />
    );
  }

  return (
    <div className="lt">
      <StatBar state={state} role={role} onSwitch={() => setState((s) => ({ ...s, roleId: null }))} />
      <RefreshCard items={refresh} onStart={startLesson} />
      <Path role={role} state={state} onStart={startLesson} />
      {result && <Done result={result} onClose={() => setResult(null)} />}
    </div>
  );
}
