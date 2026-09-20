import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, Play, Pause, RotateCcw, X } from "lucide-react";
import { BedScene, RoomScene } from "./scenes/index.js";
import { createQueue, current, answer, isComplete, progress, qualityOf } from "./queue.js";

const SCENES = { bed: BedScene, room: RoomScene };

function shuffle(list, seed) {
  const arr = [...list];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ============================================ Vorfuehrung mit Animation */

function Demo({ step, onDone }) {
  const Scene = SCENES[step.scene];
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = step.frames.length - 1;

  useEffect(() => {
    if (!playing || frame >= last) { if (frame >= last) setPlaying(false); return; }
    const t = setTimeout(() => setFrame((f) => f + 1), 2600);
    return () => clearTimeout(t);
  }, [playing, frame, last]);

  const f = step.frames[frame];

  return (
    <div className="tp-demo">
      {step.intro && <p className="tp-intro">{step.intro}</p>}

      <div className="tp-stage">
        <Scene frame={frame} />
      </div>

      <div className="tp-caption">
        <span className="tp-step-badge">Schritt {frame + 1} von {step.frames.length}</span>
        <strong>{f.caption}</strong>
        <p>{f.detail}</p>
      </div>

      <div className="tp-controls">
        <button type="button" onClick={() => { setPlaying(false); setFrame((n) => Math.max(0, n - 1)); }}
          disabled={frame === 0} aria-label="Zurück"><ChevronLeft size={20} /></button>

        <button type="button" className="tp-play"
          onClick={() => { if (frame >= last) { setFrame(0); setPlaying(true); } else setPlaying((p) => !p); }}>
          {frame >= last ? <><RotateCcw size={18} /> Nochmal</> : playing ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Abspielen</>}
        </button>

        <button type="button" onClick={() => { setPlaying(false); setFrame((n) => Math.min(last, n + 1)); }}
          disabled={frame >= last} aria-label="Weiter"><ChevronRight size={20} /></button>
      </div>

      <div className="tp-dots">
        {step.frames.map((_, i) => (
          <button key={i} type="button" className={i === frame ? "on" : ""} aria-label={"Schritt " + (i + 1)}
            onClick={() => { setPlaying(false); setFrame(i); }} />
        ))}
      </div>

      <button type="button" className="tp-action ok" onClick={onDone}
        disabled={frame < last}>
        {frame < last ? "Schau dir alle Schritte an" : "Verstanden — jetzt selbst"}
      </button>
    </div>
  );
}

/* ================================================= Stellen antippen */

function Hotspot({ step, found, setFound, miss, setMiss, locked }) {
  const Scene = SCENES[step.scene];
  const total = step.spots.length;

  function tapSpot(spot) {
    if (locked || found.includes(spot.id)) return;
    setFound([...found, spot.id]);
  }

  return (
    <div className="tp-hotspot">
      <p className="tp-hint">{step.hint}</p>
      <div className="tp-stage tp-stage-click" onClick={() => { if (!locked) setMiss(miss + 1); }}>
        <Scene dim />
        {step.spots.map((spot) => {
          const hit = found.includes(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              className={"tp-spot" + (hit ? " hit" : "")}
              style={{ left: spot.x + "%", top: spot.y + "%", width: spot.r + "px", height: spot.r + "px" }}
              onClick={(e) => { e.stopPropagation(); tapSpot(spot); }}
              aria-label={hit ? spot.label + " gefunden" : "Unbekannte Stelle"}
            >
              {hit && <Check size={16} />}
            </button>
          );
        })}
      </div>

      <div className="tp-found">
        <div className="tp-found-head">
          <strong>{found.length} von {total} Stellen gefunden</strong>
          {miss > 0 && <span className="tp-miss">{miss} Fehlgriff{miss > 1 ? "e" : ""}</span>}
        </div>
        <ul>
          {step.spots.map((spot) => {
            const hit = found.includes(spot.id);
            return (
              <li key={spot.id} className={hit ? "on" : ""}>
                {hit ? <><Check size={15} /> <b>{spot.label}</b> — {spot.why}</> : <span className="tp-blank" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ================================================= Reihenfolge */

function Sequence({ step, value, setValue, locked }) {
  const pool = useMemo(() => shuffle(step.steps, step.steps.join("").length * 53), [step]);
  const picked = value || [];
  return (
    <>
      <ol className="tp-seq-line">
        {picked.length === 0 && <span className="tp-placeholder">Tippe die Schritte in der richtigen Reihenfolge an</span>}
        {picked.map((s, i) => (
          <li key={s}>
            <button type="button" disabled={locked} className="tp-chip picked"
              onClick={() => setValue(picked.filter((x) => x !== s))}>
              <span className="tp-chip-no">{i + 1}</span>{s}
            </button>
          </li>
        ))}
      </ol>
      <div className="tp-seq-pool">
        {pool.filter((s) => !picked.includes(s)).map((s) => (
          <button key={s} type="button" disabled={locked} className="tp-chip"
            onClick={() => setValue([...picked, s])}>{s}</button>
        ))}
      </div>
    </>
  );
}

/* ================================================= Entscheidung */

function Decide({ step, value, setValue, locked }) {
  return (
    <div className="tp-options">
      {step.options.map((opt, i) => (
        <button key={i} type="button" disabled={locked}
          className={"tp-option" + (value === i ? " selected" : "")}
          onClick={() => setValue(i)}>{opt}</button>
      ))}
    </div>
  );
}

/* ================================================= Checkliste */

function Checklist({ step, value, setValue, locked }) {
  const picked = value || [];
  return (
    <div className="tp-options">
      {step.items.map((item, i) => {
        const on = picked.includes(i);
        return (
          <button key={i} type="button" disabled={locked}
            className={"tp-option tp-check" + (on ? " selected" : "")}
            onClick={() => setValue(on ? picked.filter((x) => x !== i) : [...picked, i])}>
            <span className="tp-box">{on && <Check size={14} />}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================= Auswertung */

export function stepAnswered(step, value, found) {
  if (step.type === "hotspot") return found.length === step.spots.length;
  if (step.type === "sequence") return (value || []).length === step.steps.length;
  if (step.type === "checklist") return (value || []).length > 0;
  if (step.type === "decide") return value !== null && value !== undefined;
  return true;
}

export function stepCorrect(step, value, found) {
  if (step.type === "hotspot") return found.length === step.spots.length;
  if (step.type === "sequence") return (value || []).join("|") === step.steps.join("|");
  if (step.type === "decide") return value === step.answer;
  if (step.type === "checklist") {
    const want = step.items.map((it, i) => (it.correct ? i : null)).filter((x) => x !== null);
    const got = [...(value || [])].sort((a, b) => a - b);
    return got.join(",") === want.join(",");
  }
  return true;
}

function promptOf(step) {
  return step.prompt || step.title || "";
}

/* ================================================= Der Player */

export default function TaskPlayer({ task, hearts, onHeartLost, onAnswered, onFinish, onQuit }) {
  const interactive = task.steps.filter((s) => s.type !== "demo");
  const [demoIndex, setDemoIndex] = useState(task.steps[0]?.type === "demo" ? 0 : -1);
  const [queue, setQueue] = useState(() => createQueue(interactive));
  const [value, setValue] = useState(null);
  const [found, setFound] = useState([]);
  const [miss, setMiss] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [firstTry, setFirstTry] = useState(0);

  const entry = current(queue);
  const step = entry?.exercise;
  const locked = feedback !== null;

  useEffect(() => { setValue(null); setFound([]); setMiss(0); }, [step, entry?.attempts]);

  // Zuerst die Vorfuehrung, danach die interaktiven Schritte
  if (demoIndex >= 0) {
    const demo = task.steps[demoIndex];
    return (
      <div className="tp">
        <header className="tp-head">
          <button type="button" className="tp-quit" onClick={onQuit} aria-label="Verlassen"><X size={22} /></button>
          <div className="tp-title"><strong>{task.title}</strong><span>{demo.title}</span></div>
          <div className="tp-hearts"><Heart size={19} fill="#e0405d" color="#e0405d" /><b>{hearts}</b></div>
        </header>
        <div className="tp-body"><Demo step={demo} onDone={() => setDemoIndex(-1)} /></div>
      </div>
    );
  }

  if (!step) return null;

  function check() {
    if (!stepAnswered(step, value, found) || locked) return;
    const correct = stepCorrect(step, value, found);
    if (!correct) onHeartLost();
    setFeedback({ correct, explain: step.explain });
  }

  function next() {
    const result = answer(queue, feedback.correct);
    if (result.finished) {
      onAnswered(task.id + ":" + result.finished.exercise.type, qualityOf(result.finished));
      if (result.finished.firstTry) setFirstTry((c) => c + 1);
    }
    setFeedback(null);
    if (isComplete(result.queue)) {
      onFinish({ xp: 15 + interactive.length * 5, perfect: firstTry + 1 === queue.total, steps: queue.total });
      return;
    }
    setQueue(result.queue);
  }

  const pct = Math.round(progress(queue) * 100);

  return (
    <div className="tp">
      <header className="tp-head">
        <button type="button" className="tp-quit" onClick={onQuit} aria-label="Verlassen"><X size={22} /></button>
        <div className="tp-bar"><span style={{ width: pct + "%" }} /></div>
        <div className="tp-hearts"><Heart size={19} fill={hearts > 0 ? "#e0405d" : "none"} color="#e0405d" /><b>{hearts}</b></div>
      </header>

      <div className="tp-body">
        <p className="tp-kicker">{!entry.firstTry ? "Nochmal — das war noch nicht richtig" : task.title}</p>
        <h2 className="tp-prompt">{promptOf(step)}</h2>

        {step.type === "hotspot" && <Hotspot step={step} found={found} setFound={setFound} miss={miss} setMiss={setMiss} locked={locked} />}
        {step.type === "sequence" && <Sequence step={step} value={value} setValue={setValue} locked={locked} />}
        {step.type === "decide" && <Decide step={step} value={value} setValue={setValue} locked={locked} />}
        {step.type === "checklist" && <Checklist step={step} value={value} setValue={setValue} locked={locked} />}
      </div>

      <footer className={"tp-foot" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}>
        {feedback && (
          <div className="tp-feedback">
            <strong>{feedback.correct ? <><Check size={18} /> Richtig</> : <><X size={18} /> Noch nicht</>}</strong>
            <p>{feedback.explain}</p>
          </div>
        )}
        <button type="button"
          className={"tp-action" + (feedback ? (feedback.correct ? " ok" : " bad") : " ok")}
          disabled={!feedback && !stepAnswered(step, value, found)}
          onClick={feedback ? next : check}>
          {feedback ? "Weiter" : "Prüfen"}
        </button>
      </footer>
    </div>
  );
}
