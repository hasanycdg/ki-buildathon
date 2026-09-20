import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Heart, Volume2, X } from "lucide-react";
import { createQueue, current, answer, isComplete, progress, qualityOf } from "./queue.js";
import { isAnswered, isCorrect } from "./grade.js";

/* Deutsche Sprachausgabe — hilft genau denen, die kein Deutsch koennen. */
function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* Browser ohne Sprachausgabe: kein Drama */ }
}

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

/* ============================================================ Aufgabentypen */

function Choice({ ex, value, setValue, locked }) {
  return (
    <div className="lp-options">
      {ex.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={locked}
          className={"lp-option" + (value === i ? " selected" : "")}
          onClick={() => setValue(i)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Vocab({ ex, value, setValue, locked, lang }) {
  // Die Uebersetzung in die Muttersprache erscheint ERST nach der Antwort.
  // Vorher wuerde sie die Loesung verraten und die Aufgabe wertlos machen.
  return (
    <>
      <div className="lp-term">
        <span>{ex.term}</span>
        <button type="button" className="lp-speak" onClick={() => speak(ex.speak || ex.term)} aria-label="Vorlesen">
          <Volume2 size={20} />
        </button>
      </div>
      <p className={"lp-bridge" + (locked ? " shown" : "")}>
        {locked && ex.tr?.[lang] ? "In deiner Sprache: " + ex.tr[lang] : "\u00a0"}
      </p>
      <Choice ex={ex} value={value} setValue={setValue} locked={locked} />
    </>
  );
}

function Build({ ex, value, setValue, locked }) {
  const pool = useMemo(
    () => shuffle([...ex.answer, ...(ex.distractors || [])], ex.id.length * 37),
    [ex.id]
  );
  const picked = value || [];
  const used = new Set();
  picked.forEach((p) => used.add(p.key));

  return (
    <>
      <div className="lp-build-line">
        {picked.length === 0 && <span className="lp-placeholder">Tippe die Wörter in der richtigen Reihenfolge an</span>}
        {picked.map((p) => (
          <button key={p.key} type="button" disabled={locked} className="lp-tile picked"
            onClick={() => setValue(picked.filter((x) => x.key !== p.key))}>
            {p.word}
          </button>
        ))}
      </div>
      <div className="lp-build-pool">
        {pool.map((word, i) => {
          const key = word + "#" + i;
          if (used.has(key)) return <span key={key} className="lp-tile ghost">{word}</span>;
          return (
            <button key={key} type="button" disabled={locked} className="lp-tile"
              onClick={() => setValue([...picked, { key, word }])}>
              {word}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Order({ ex, value, setValue, locked }) {
  const pool = useMemo(() => shuffle(ex.steps, ex.id.length * 53), [ex.id]);
  const picked = value || [];
  return (
    <>
      <ol className="lp-order-line">
        {picked.length === 0 && <span className="lp-placeholder">Tippe die Schritte in der richtigen Reihenfolge an</span>}
        {picked.map((step, i) => (
          <li key={step}>
            <button type="button" disabled={locked} className="lp-step picked"
              onClick={() => setValue(picked.filter((s) => s !== step))}>
              <span className="lp-step-no">{i + 1}</span>{step}
            </button>
          </li>
        ))}
      </ol>
      <div className="lp-order-pool">
        {pool.filter((s) => !picked.includes(s)).map((step) => (
          <button key={step} type="button" disabled={locked} className="lp-step"
            onClick={() => setValue([...picked, step])}>
            {step}
          </button>
        ))}
      </div>
    </>
  );
}

function Match({ ex, value, setValue, locked }) {
  const left = ex.pairs.map((p) => p[0]);

  // Ein Zielwert darf mehrfach vorkommen ("Badetuch -> Bad", "Föhn -> Bad").
  // Er wird deshalb nur EINMAL angezeigt und ist so oft waehlbar,
  // wie er in den Paaren steht.
  const capacity = useMemo(() => {
    const map = new Map();
    ex.pairs.forEach(([, r]) => map.set(r, (map.get(r) || 0) + 1));
    return map;
  }, [ex.id]);
  const right = useMemo(() => shuffle([...capacity.keys()], ex.id.length * 71), [ex.id]);

  const made = value || {};
  const [active, setActive] = useState(null);

  const used = new Map();
  Object.values(made).forEach((r) => used.set(r, (used.get(r) || 0) + 1));
  const isFull = (r) => (used.get(r) || 0) >= capacity.get(r);

  function pickLeft(l) {
    if (locked) return;
    if (made[l]) { const next = { ...made }; delete next[l]; setValue(next); return; }
    setActive(active === l ? null : l);
  }
  function pickRight(r) {
    if (locked || !active || isFull(r)) return;
    setValue({ ...made, [active]: r });
    setActive(null);
  }

  return (
    <div className="lp-match">
      <div className="lp-match-col">
        {left.map((l) => (
          <button key={l} type="button" disabled={locked}
            className={"lp-match-item" + (active === l ? " active" : "") + (made[l] ? " done" : "")}
            onClick={() => pickLeft(l)}>
            {l}
            {made[l] && <span className="lp-match-echo">{made[l]}</span>}
          </button>
        ))}
      </div>
      <div className="lp-match-col">
        {right.map((r) => {
          const slots = capacity.get(r);
          const left_ = slots - (used.get(r) || 0);
          return (
            <button key={r} type="button" disabled={locked || isFull(r)}
              className={"lp-match-item" + (isFull(r) ? " taken" : "")}
              onClick={() => pickRight(r)}>
              {r}
              {slots > 1 && <span className="lp-match-slots">{left_} von {slots} frei</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrueFalse({ value, setValue, locked }) {
  return (
    <div className="lp-truefalse">
      <button type="button" disabled={locked} className={"lp-tf" + (value === true ? " selected" : "")} onClick={() => setValue(true)}>
        Richtig
      </button>
      <button type="button" disabled={locked} className={"lp-tf" + (value === false ? " selected" : "")} onClick={() => setValue(false)}>
        Falsch
      </button>
    </div>
  );
}

function promptOf(ex) {
  if (ex.type === "vocab") return "Was bedeutet das?";
  if (ex.type === "truefalse") return ex.statement;
  return ex.prompt;
}

/* ====================================================== Der Player selbst */

export default function LessonPlayer({ lesson, lang, hearts, onHeartLost, onAnswered, onFinish, onQuit }) {
  const [queue, setQueue] = useState(() => createQueue(lesson.exercises));
  const [value, setValue] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | {correct, explain}
  const [firstTryCount, setFirstTryCount] = useState(0);
  const liveRef = useRef(null);

  const entry = current(queue);
  const ex = entry?.exercise;
  const locked = feedback !== null;

  useEffect(() => { setValue(null); }, [ex?.id, entry?.attempts]);

  useEffect(() => {
    if (feedback && liveRef.current) liveRef.current.focus();
  }, [feedback]);

  if (!ex) return null;

  function check() {
    if (!isAnswered(ex, value) || locked) return;
    const correct = isCorrect(ex, value);
    if (!correct) onHeartLost();
    setFeedback({ correct, explain: ex.explain });
  }

  function next() {
    const correct = feedback.correct;
    const result = answer(queue, correct);
    if (result.finished) {
      onAnswered(result.finished.exercise.id, qualityOf(result.finished));
      if (result.finished.firstTry) setFirstTryCount((c) => c + 1);
    }
    setFeedback(null);

    if (isComplete(result.queue)) {
      const perfect = firstTryCount + (result.finished?.firstTry ? 1 : 0) === queue.total;
      onFinish({ xp: 10 + queue.total * 2, perfect });
      return;
    }
    setQueue(result.queue);
  }

  const pct = Math.round(progress(queue) * 100);

  return (
    <div className="lp">
      <header className="lp-head">
        <button type="button" className="lp-quit" onClick={onQuit} aria-label="Lektion verlassen">
          <X size={22} />
        </button>
        <div className="lp-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: pct + "%" }} />
        </div>
        <div className="lp-hearts" aria-label={hearts + " Herzen übrig"}>
          <Heart size={20} fill={hearts > 0 ? "#e0405d" : "none"} color="#e0405d" />
          <strong>{hearts}</strong>
        </div>
      </header>

      <div className="lp-body">
        <p className="lp-kicker">
          {entry.needed > 1 || !entry.firstTry ? "Nochmal — du hattest das falsch" : lesson.title}
        </p>
        <h2 className="lp-prompt">{promptOf(ex)}</h2>

        {ex.type === "choice" && <Choice ex={ex} value={value} setValue={setValue} locked={locked} />}
        {ex.type === "vocab" && <Vocab ex={ex} value={value} setValue={setValue} locked={locked} lang={lang} />}
        {ex.type === "build" && <Build ex={ex} value={value} setValue={setValue} locked={locked} />}
        {ex.type === "order" && <Order ex={ex} value={value} setValue={setValue} locked={locked} />}
        {ex.type === "match" && <Match ex={ex} value={value} setValue={setValue} locked={locked} />}
        {ex.type === "truefalse" && <TrueFalse value={value} setValue={setValue} locked={locked} />}
      </div>

      <footer className={"lp-foot" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}>
        {feedback && (
          <div className="lp-feedback" tabIndex={-1} ref={liveRef} role="status">
            <strong>
              {feedback.correct ? <><Check size={18} /> Richtig</> : <><X size={18} /> Nicht ganz</>}
            </strong>
            <p>{feedback.explain}</p>
          </div>
        )}
        <button
          type="button"
          className={"lp-action" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}
          disabled={!feedback && !isAnswered(ex, value)}
          onClick={feedback ? next : check}
        >
          {feedback ? "Weiter" : "Prüfen"}
        </button>
      </footer>
    </div>
  );
}
