import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, Play, Pause, RotateCcw, X } from "lucide-react";
import * as Scenes from "./scenes/index.js";
import { createQueue, current, answer, isComplete, progress, qualityOf } from "./queue.js";
import { t, tList } from "./i18n.js";


/* Feste Oberflaechentexte — dieselbe Struktur wie die Inhalte. */
const RETRY   = { de: "Nochmal — das war noch nicht richtig", en: "Again — that wasn't right yet",
                  pl: "Jeszcze raz — to nie było poprawne", hr: "Ponovno — to još nije bilo točno",
                  sr: "Ponovo — to još nije bilo tačno" };
const CHECK   = { de: "Prüfen", en: "Check", pl: "Sprawdź", hr: "Provjeri", sr: "Proveri" };
const NEXT    = { de: "Weiter", en: "Continue", pl: "Dalej", hr: "Dalje", sr: "Dalje" };
const RIGHT   = { de: "Richtig", en: "Correct", pl: "Poprawnie", hr: "Točno", sr: "Tačno" };
const WRONG   = { de: "Noch nicht", en: "Not yet", pl: "Jeszcze nie", hr: "Još ne", sr: "Još ne" };
const WATCH   = { de: "Schau dir alle Schritte an", en: "Watch all the steps",
                  pl: "Obejrzyj wszystkie kroki", hr: "Pogledaj sve korake", sr: "Pogledaj sve korake" };
const GOT_IT  = { de: "Verstanden — jetzt selbst", en: "Got it — now your turn",
                  pl: "Rozumiem — teraz ty", hr: "Razumijem — sada ti", sr: "Razumem — sada ti" };
const STEP_OF = { de: "Schritt", en: "Step", pl: "Krok", hr: "Korak", sr: "Korak" };
const OF      = { de: "von", en: "of", pl: "z", hr: "od", sr: "od" };
const AGAIN   = { de: "Nochmal", en: "Replay", pl: "Jeszcze raz", hr: "Ponovno", sr: "Ponovo" };
const PLAY    = { de: "Abspielen", en: "Play", pl: "Odtwórz", hr: "Pokreni", sr: "Pokreni" };
const PAUSE   = { de: "Pause", en: "Pause", pl: "Pauza", hr: "Pauza", sr: "Pauza" };
const FOUND   = { de: "Stellen gefunden", en: "spots found", pl: "znalezione miejsca",
                  hr: "pronađenih mjesta", sr: "pronađenih mesta" };
const MISSHIT = { de: "Fehlgriff", en: "miss", pl: "pudło", hr: "promašaj", sr: "promašaj" };
const ORDER_H = { de: "Tippe die Schritte in der richtigen Reihenfolge an",
                  en: "Tap the steps in the right order", pl: "Dotknij kroków we właściwej kolejności",
                  hr: "Dodirni korake ispravnim redoslijedom", sr: "Dodirni korake ispravnim redosledom" };

const SCENES = {
  bed: Scenes.BedScene, room: Scenes.RoomScene, bath: Scenes.BathScene,
  reception: Scenes.ReceptionScene, buffet: Scenes.BuffetScene, lobby: Scenes.LobbyScene
};

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

function Demo({ step, onDone, lang }) {
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
      {step.intro && <p className="tp-intro">{t(step.intro, lang)}</p>}

      <div className="tp-stage">
        <Scene frame={frame} />
      </div>

      <div className="tp-caption">
        <span className="tp-step-badge">{t(STEP_OF, lang)} {frame + 1} {t(OF, lang)} {step.frames.length}</span>
        <strong>{t(f.caption, lang)}</strong>
        <p>{t(f.detail, lang)}</p>
      </div>

      <div className="tp-controls">
        <button type="button" onClick={() => { setPlaying(false); setFrame((n) => Math.max(0, n - 1)); }}
          disabled={frame === 0} aria-label="Zurück"><ChevronLeft size={20} /></button>

        <button type="button" className="tp-play"
          onClick={() => { if (frame >= last) { setFrame(0); setPlaying(true); } else setPlaying((p) => !p); }}>
          {frame >= last ? <><RotateCcw size={18} /> {t(AGAIN, lang)}</> : playing ? <><Pause size={18} /> {t(PAUSE, lang)}</> : <><Play size={18} /> {t(PLAY, lang)}</>}
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
        {frame < last ? t(WATCH, lang) : t(GOT_IT, lang)}
      </button>
    </div>
  );
}

/* ================================================= Stellen antippen */

function Hotspot({ step, found, setFound, miss, setMiss, locked, lang }) {
  const Scene = SCENES[step.scene];
  const total = step.spots.length;

  function tapSpot(spot) {
    if (locked || found.includes(spot.id)) return;
    setFound([...found, spot.id]);
  }

  return (
    <div className="tp-hotspot">
      <p className="tp-hint">{t(step.hint, lang)}</p>
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
              aria-label={hit ? t(spot.label, lang) : "Unbekannte Stelle"}
            >
              {hit && <Check size={16} />}
            </button>
          );
        })}
      </div>

      <div className="tp-found">
        <div className="tp-found-head">
          <strong>{found.length} / {total} — {t(FOUND, lang)}</strong>
          {miss > 0 && <span className="tp-miss">{miss} × {t(MISSHIT, lang)}</span>}
        </div>
        <ul>
          {step.spots.map((spot) => {
            const hit = found.includes(spot.id);
            return (
              <li key={spot.id} className={hit ? "on" : ""}>
                {hit ? <><Check size={15} /> <b>{t(spot.label, lang)}</b> — {t(spot.why, lang)}</> : <span className="tp-blank" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ================================================= Reihenfolge */

function Sequence({ step, value, setValue, locked, lang }) {
  const labels = useMemo(() => tList(step.steps, lang), [step, lang]);
  const pool = useMemo(() => shuffle(labels, labels.join("").length * 53), [labels]);
  const picked = value || [];
  return (
    <>
      <ol className="tp-seq-line">
        {picked.length === 0 && <span className="tp-placeholder">{t(ORDER_H, lang)}</span>}
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

function Decide({ step, value, setValue, locked, lang }) {
  return (
    <div className="tp-options">
      {tList(step.options, lang).map((opt, i) => (
        <button key={i} type="button" disabled={locked}
          className={"tp-option" + (value === i ? " selected" : "")}
          onClick={() => setValue(i)}>{opt}</button>
      ))}
    </div>
  );
}

/* ================================================= Checkliste */

function Checklist({ step, value, setValue, locked, lang }) {
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
            {t(item.label, lang)}
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

export function stepCorrect(step, value, found, lang = "de") {
  if (step.type === "hotspot") return found.length === step.spots.length;
  if (step.type === "sequence") return (value || []).join("|") === tList(step.steps, lang).join("|");
  if (step.type === "decide") return value === step.answer;
  if (step.type === "checklist") {
    const want = step.items.map((it, i) => (it.correct ? i : null)).filter((x) => x !== null);
    const got = [...(value || [])].sort((a, b) => a - b);
    return got.join(",") === want.join(",");
  }
  return true;
}

function promptOf(step, lang) {
  return t(step.prompt, lang) || t(step.title, lang) || "";
}

/* ================================================= Der Player */

export default function TaskPlayer({ task, hearts, lang, onHeartLost, onAnswered, onFinish, onQuit }) {
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
          <div className="tp-title"><strong>{t(task.title, lang)}</strong><span>{t(demo.title, lang)}</span></div>
          <div className="tp-hearts"><Heart size={19} fill="#e0405d" color="#e0405d" /><b>{hearts}</b></div>
        </header>
        <div className="tp-body"><Demo step={demo} lang={lang} onDone={() => setDemoIndex(-1)} /></div>
      </div>
    );
  }

  if (!step) return null;

  function check() {
    if (!stepAnswered(step, value, found) || locked) return;
    const correct = stepCorrect(step, value, found, lang);
    if (!correct) onHeartLost();
    setFeedback({ correct, explain: t(step.explain, lang) });
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
        <p className="tp-kicker">{!entry.firstTry ? t(RETRY, lang) : t(task.title, lang)}</p>
        <h2 className="tp-prompt">{promptOf(step, lang)}</h2>

        {step.type === "hotspot" && <Hotspot step={step} found={found} setFound={setFound} miss={miss} setMiss={setMiss} locked={locked} lang={lang} />}
        {step.type === "sequence" && <Sequence step={step} value={value} setValue={setValue} locked={locked} lang={lang} />}
        {step.type === "decide" && <Decide step={step} value={value} setValue={setValue} locked={locked} lang={lang} />}
        {step.type === "checklist" && <Checklist step={step} value={value} setValue={setValue} locked={locked} lang={lang} />}
      </div>

      <footer className={"tp-foot" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}>
        {feedback && (
          <div className="tp-feedback">
            <strong>{feedback.correct ? <><Check size={18} /> {t(RIGHT, lang)}</> : <><X size={18} /> {t(WRONG, lang)}</>}</strong>
            <p>{feedback.explain}</p>
          </div>
        )}
        <button type="button"
          className={"tp-action" + (feedback ? (feedback.correct ? " ok" : " bad") : " ok")}
          disabled={!feedback && !stepAnswered(step, value, found)}
          onClick={feedback ? next : check}>
          {feedback ? t(NEXT, lang) : t(CHECK, lang)}
        </button>
      </footer>
    </div>
  );
}
