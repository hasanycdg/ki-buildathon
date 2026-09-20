import React, { useEffect, useState } from "react";
import { BedDouble, Check, Clock, Flame, Heart, Star, Trophy } from "lucide-react";
import { housekeepingTasks } from "./tasks/housekeeping.js";
import * as store from "./store.js";
import TaskPlayer from "./TaskPlayer.jsx";
import "./learn.css";

const ROLES = [housekeepingTasks];
const ICONS = { BedDouble };

/* ------------------------------------------------------- Rollenauswahl */

function RoleSelect({ onPick }) {
  return (
    <div className="ls">
      <header className="ls-head">
        <h1>Was machst du im Haus?</h1>
        <p>Wähle deine Rolle. Du lernst die Handgriffe, die du wirklich brauchst.</p>
      </header>
      <div className="ls-grid">
        {ROLES.map((role) => {
          const Icon = ICONS[role.icon] || BedDouble;
          return (
            <button key={role.id} type="button" className="ls-card" onClick={() => onPick(role.id)}>
              <span className="ls-icon" style={{ background: role.accent }}><Icon size={26} color="#fff" /></span>
              <strong>{role.name}</strong>
              <span className="ls-tag">{role.tagline}</span>
              <p>{role.blurb}</p>
              <span className="ls-meta">{role.tasks.length} Tätigkeiten</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Übersicht */

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

function Done({ result, onClose }) {
  return (
    <div className="lt-done">
      <div className="lt-done-card">
        <span className="lt-done-badge"><Trophy size={34} color="#fff" /></span>
        <h2>{result.perfect ? "Perfekt!" : "Geschafft!"}</h2>
        <p>{result.perfect ? "Alles auf Anhieb richtig." : "Du hast jeden Schritt richtig gelöst."}</p>
        <div className="lt-done-stats">
          <div><b>+{result.xp}</b><span>XP</span></div>
          <div><b>{result.steps}</b><span>Schritte</span></div>
        </div>
        <button type="button" onClick={onClose}>Weiter</button>
      </div>
    </div>
  );
}

export default function LearnTab() {
  const [state, setState] = useState(() => store.syncHearts(store.load()));
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => { store.save(state); }, [state]);

  const role = ROLES.find((r) => r.id === state.roleId);

  if (!role) return <div className="content-single"><RoleSelect onPick={(roleId) => setState((s) => ({ ...s, roleId }))} /></div>;

  if (active) {
    return (
      <TaskPlayer
        task={active}
        hearts={state.hearts.count}
        onHeartLost={() => setState((s) => store.loseHeart(s))}
        onAnswered={(id, quality) => setState((s) => store.recordAnswer(s, id, quality))}
        onFinish={({ xp, perfect, steps }) => {
          setState((s) => store.completeLesson(s, active.id, { xp, perfect }));
          setResult({ xp, perfect, steps });
          setActive(null);
        }}
        onQuit={() => setActive(null)}
      />
    );
  }

  return (
    <div className="content-single">
      <div className="lt">
        <StatBar state={state} role={role} onSwitch={() => setState((s) => ({ ...s, roleId: null }))} />
        <h2 className="lt-section">Deine Tätigkeiten</h2>
        {role.tasks.map((task, i) => {
          const done = Boolean(state.lessons[task.id]?.completed);
          return (
            <button key={task.id} type="button" className={"lt-task" + (done ? " done" : "")}
              onClick={() => setActive(task)}>
              <span className="lt-task-no">{done ? <Check size={22} /> : i + 1}</span>
              <span className="lt-task-main">
                <strong>{task.title}</strong>
                <span>{task.goal}</span>
              </span>
              <span className="lt-task-meta"><Clock size={14} /> {task.minutes} Min</span>
            </button>
          );
        })}
        {result && <Done result={result} onClose={() => setResult(null)} />}
      </div>
    </div>
  );
}
