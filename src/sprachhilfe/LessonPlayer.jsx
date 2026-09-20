import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Heart, RotateCcw, Volume2, X } from "lucide-react";
import { createQueue, current, answer, isComplete, progress, qualityOf } from "../learn/queue.js";
import { isAnswered, isCorrect, solutionLines } from "./grade.js";
import { speak } from "./speech.js";
import { UI, t } from "./ui.js";

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

function Choice({ ex, value, setValue, locked, feedback }) {
  return (
    <div className="lp-options">
      {ex.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={locked}
          className={"lp-option" + (value === i ? " selected" : "") +
            (feedback && i === ex.answer ? " correct" : "") +
            (feedback && value === i && i !== ex.answer ? " wrong" : "")}
          onClick={() => setValue(i)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Vocab({ ex, value, setValue, locked, lang, feedback }) {
  // Die Uebersetzung in die Muttersprache erscheint ERST nach der Antwort.
  // Vorher wuerde sie die Loesung verraten und die Aufgabe wertlos machen.
  const bridge = lang !== "de" && ex.tr?.[lang];
  return (
    <>
      <div className="lp-term">
        <span>{ex.term}</span>
        <button type="button" className="lp-speak" onClick={() => speak(ex.speak || ex.term)}
          aria-label={t(UI.listen, lang)}>
          <Volume2 size={20} />
        </button>
      </div>
      <p className={"lp-bridge" + (locked && bridge ? " shown" : "")}>
        {locked && bridge ? t(UI.inYourLang, lang) + " " + bridge : " "}
      </p>
      <Choice ex={ex} value={value} setValue={setValue} locked={locked} feedback={feedback} />
    </>
  );
}

function Build({ ex, value, setValue, locked, lang }) {
  const pool = useMemo(
    () => shuffle([...ex.answer, ...(ex.distractors || [])], ex.id.length * 37),
    [ex.id]
  );
  const picked = value || [];
  const used = new Set(picked.map((p) => p.key));

  return (
    <>
      <div className="lp-build-line">
        {picked.length === 0 && <span className="lp-placeholder">{t(UI.tapWords, lang)}</span>}
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

function Order({ ex, value, setValue, locked, lang, feedback }) {
  const pool = useMemo(() => shuffle(ex.steps, ex.id.length * 53), [ex.id]);
  const picked = value || [];
  return (
    <>
      <ol className="lp-order-line">
        {picked.length === 0 && <span className="lp-placeholder">{t(UI.tapSteps, lang)}</span>}
        {picked.map((step, i) => {
          const verdict = feedback ? (step === ex.steps[i] ? " correct" : " wrong") : "";
          return (
            <li key={step}>
              <button type="button" disabled={locked} className={"lp-step picked" + verdict}
                onClick={() => setValue(picked.filter((s) => s !== step))}>
                <span className="lp-step-no">{i + 1}</span>{step}
              </button>
            </li>
          );
        })}
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

function Match({ ex, value, setValue, locked, lang }) {
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

  useEffect(() => { setActive(null); }, [ex.id]);

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
          const free = slots - (used.get(r) || 0);
          return (
            <button key={r} type="button" disabled={locked || isFull(r)}
              className={"lp-match-item" + (isFull(r) ? " taken" : "")}
              onClick={() => pickRight(r)}>
              {r}
              {slots > 1 && (
                <span className="lp-match-slots">
                  {free} {t(UI.of, lang)} {slots} {t(UI.freeSlots, lang)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrueFalse({ ex, value, setValue, locked, lang, feedback }) {
  const cls = (v) => "lp-tf" + (value === v ? " selected" : "") +
    (feedback && ex.answer === v ? " correct" : "") +
    (feedback && value === v && ex.answer !== v ? " wrong" : "");
  return (
    <div className="lp-truefalse">
      <button type="button" disabled={locked} className={cls(true)} onClick={() => setValue(true)}>
        {t(UI.tfTrue, lang)}
      </button>
      <button type="button" disabled={locked} className={cls(false)} onClick={() => setValue(false)}>
        {t(UI.tfFalse, lang)}
      </button>
    </div>
  );
}

function promptOf(ex, lang) {
  if (ex.type === "vocab") return t(UI.whatMeans, lang);
  if (ex.type === "truefalse") return ex.statement;
  return ex.prompt;
}

/* ====================================================== Der Player selbst */

export default function LessonPlayer({
  lesson, lang, hearts, onHeartLost, onRefill, onAnswered, onFinish, onQuit
}) {
  const [run, setRun] = useState(0);                 // hochzaehlen = Lektion neu
  const [queue, setQueue] = useState(() => createQueue(lesson.exercises));
  const [value, setValue] = useState(null);
  const [feedback, setFeedback] = useState(null);    // null | { correct, explain, lines }
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [retries, setRetries] = useState(0);
  const [lost, setLost] = useState(false);
  const liveRef = useRef(null);

  const entry = current(queue);
  const ex = entry?.exercise;
  const locked = feedback !== null;

  useEffect(() => { setValue(null); }, [ex?.id, entry?.attempts]);
  useEffect(() => { if (feedback && liveRef.current) liveRef.current.focus(); }, [feedback]);

  function restart() {
    setQueue(createQueue(lesson.exercises));
    setValue(null);
    setFeedback(null);
    setFirstTryCount(0);
    setLost(false);
    setRun((r) => r + 1);
    onRefill?.();
  }

  /* --------------------------------------------------- Herzen leer */
  if (lost) {
    return (
      <div className="lp">
        <header className="lp-head">
          <button type="button" className="lp-quit" onClick={onQuit} aria-label="Zurück"><X size={22} /></button>
          <div className="lp-bar"><span style={{ width: "0%" }} /></div>
        </header>
        <div className="lp-body sh-center">
          <div className="sh-lost-card">
            <span className="sh-lost-icon"><Heart size={32} color="#fff" /></span>
            <h2>{t(UI.noHearts, lang)}</h2>
            <p>{t(UI.noHeartsMsg, lang)}</p>
            <button type="button" className="lp-action bad" onClick={restart}>
              {t(UI.restart, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ex) return null;

  function check() {
    if (!isAnswered(ex, value) || locked) return;
    const correct = isCorrect(ex, value);
    if (!correct) { onHeartLost(); setRetries((r) => r + 1); }
    setFeedback({ correct, explain: ex.explain, lines: correct ? [] : solutionLines(ex) });
  }

  function next() {
    // Bei leeren Herzen erst die Korrektur bestaetigen lassen, dann zurueck
    // an den Anfang. Wer nichts gelesen hat, lernt beim Wiederholen nichts.
    if (!feedback.correct && hearts <= 0) {
      setFeedback(null);
      setLost(true);
      return;
    }
    const correct = feedback.correct;
    const result = answer(queue, correct);
    if (result.finished) {
      onAnswered(result.finished.exercise.id, qualityOf(result.finished));
      if (result.finished.firstTry) setFirstTryCount((c) => c + 1);
    }
    setFeedback(null);
    setValue(null);

    if (isComplete(result.queue)) {
      const perfect = firstTryCount + (result.finished?.firstTry ? 1 : 0) === queue.total;
      onFinish({ xp: 10 + queue.total * 2, perfect, total: queue.total, retries });
      return;
    }
    setQueue(result.queue);
  }

  const pct = Math.round(progress(queue) * 100);
  const speakable = ex.type === "vocab" ? null : ex.speak;   // vocab hat schon einen Knopf

  return (
    <div className="lp" key={run}>
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
          {entry.needed > 1 || !entry.firstTry ? t(UI.again, lang) : t(lesson.title, lang)}
        </p>
        <h2 className="lp-prompt">
          {promptOf(ex, lang)}
          {speakable && (
            <button type="button" className="lp-speak sh-inline-speak" onClick={() => speak(speakable)}
              aria-label={t(UI.listen, lang)}>
              <Volume2 size={18} />
            </button>
          )}
        </h2>

        {ex.type === "choice" && <Choice ex={ex} value={value} setValue={setValue} locked={locked} feedback={feedback} />}
        {ex.type === "vocab" && <Vocab ex={ex} value={value} setValue={setValue} locked={locked} lang={lang} feedback={feedback} />}
        {ex.type === "build" && <Build ex={ex} value={value} setValue={setValue} locked={locked} lang={lang} />}
        {ex.type === "order" && <Order ex={ex} value={value} setValue={setValue} locked={locked} lang={lang} feedback={feedback} />}
        {ex.type === "match" && <Match ex={ex} value={value} setValue={setValue} locked={locked} lang={lang} />}
        {ex.type === "truefalse" && <TrueFalse ex={ex} value={value} setValue={setValue} locked={locked} lang={lang} feedback={feedback} />}
      </div>

      <footer className={"lp-foot" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}>
        {feedback && (
          <div className="lp-feedback" tabIndex={-1} ref={liveRef} role="status">
            <strong>
              {feedback.correct
                ? <><Check size={18} /> {t(UI.right, lang)}</>
                : <><X size={18} /> {t(UI.wrong, lang)}</>}
            </strong>
            {!feedback.correct && feedback.lines.length > 0 && (
              <div className="sh-solution">
                <span>{t(UI.solution, lang)}</span>
                {feedback.lines.map((line, i) => (
                  <div key={line}>
                    <b>{feedback.lines.length > 1 ? i + 1 + "." : "✓"}</b>{line}
                  </div>
                ))}
              </div>
            )}
            <p>{feedback.explain}</p>
            {!feedback.correct && (
              <small className="sh-returns"><RotateCcw size={14} /> {t(UI.comesBack, lang)}</small>
            )}
          </div>
        )}
        <button
          type="button"
          className={"lp-action" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}
          disabled={!feedback && !isAnswered(ex, value)}
          onClick={feedback ? next : check}
        >
          {feedback ? t(feedback.correct ? UI.next : UI.understood, lang) : t(UI.check, lang)}
        </button>
      </footer>
    </div>
  );
}
