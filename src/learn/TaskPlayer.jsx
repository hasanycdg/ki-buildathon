import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Clock, Flag, Heart, Play, Pause, RotateCcw, Star, Target, X } from "lucide-react";
import * as Scenes from "./scenes/index.js";
import GeneratedScene from "./scenes/GeneratedScene.jsx";
import { createQueue, current, answer, isComplete, progress } from "./queue.js";
import { t, tList } from "./i18n.js";
import { stagesOf, starsFor, formatTime, STAR_TEXT } from "./stages.js";


/* Feste Oberflaechentexte — dieselbe Struktur wie die Inhalte. */
const RETRY   = { de: "Nochmal — das war noch nicht richtig", en: "Again — that wasn't right yet",
                  pl: "Jeszcze raz — to nie było poprawne", hr: "Ponovno — to još nije bilo točno",
                  sr: "Ponovo — to još nije bilo tačno" };
const CHECK   = { de: "Prüfen", en: "Check", pl: "Sprawdź", hr: "Provjeri", sr: "Proveri" };
const NEXT    = { de: "Weiter", en: "Continue", pl: "Dalej", hr: "Dalje", sr: "Dalje" };
const UNDERSTOOD = { de: "Verstanden", en: "Got it", pl: "Rozumiem", hr: "Razumijem", sr: "Razumem" };
const RIGHT   = { de: "Richtig", en: "Correct", pl: "Poprawnie", hr: "Točno", sr: "Tačno" };
const WRONG   = { de: "Noch nicht", en: "Not yet", pl: "Jeszcze nie", hr: "Još ne", sr: "Još ne" };
const CORRECT_ANSWER = { de: "Richtige Antwort", en: "Correct answer", pl: "Poprawna odpowiedź",
                         hr: "Točan odgovor", sr: "Tačan odgovor" };
const COMES_BACK = { de: "Diese Aufgabe kommt gleich noch einmal.", en: "This question will come back shortly.",
                     pl: "To zadanie pojawi się za chwilę ponownie.", hr: "Ovaj zadatak će se uskoro ponoviti.",
                     sr: "Ovaj zadatak će se uskoro ponoviti." };
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


const STAGE     = { de: "Etappe", en: "Stage", pl: "Etap", hr: "Etapa", sr: "Etapa" };
const GOAL      = { de: "Dein Lernziel", en: "Your learning goal", pl: "Twój cel",
                    hr: "Tvoj cilj učenja", sr: "Tvoj cilj učenja" };
const START     = { de: "Los geht's", en: "Let's go", pl: "Zaczynamy", hr: "Idemo", sr: "Idemo" };
const STAGE_OK  = { de: "Etappe geschafft", en: "Stage complete", pl: "Etap zaliczony",
                    hr: "Etapa završena", sr: "Etapa završena" };
const SAVED     = { de: "Gespeichert. Ab hier geht es weiter, wenn die Herzen ausgehen.",
                    en: "Saved. If your hearts run out, you continue from here.",
                    pl: "Zapisane. Jeśli skończą się serca, wrócisz tutaj.",
                    hr: "Spremljeno. Ako ti ponestane srca, nastavljaš odavde.",
                    sr: "Sačuvano. Ako ti ponestane srca, nastavljaš odavde." };
const NO_HEARTS = { de: "Herzen alle", en: "Out of hearts", pl: "Koniec serc",
                    hr: "Nema više srca", sr: "Nema više srca" };
const RESET_MSG = { de: "Du gehst zurück an den Anfang dieser Etappe. Was du davor geschafft hast, bleibt dir.",
                    en: "You go back to the start of this stage. What you finished before stays yours.",
                    pl: "Wracasz na początek tego etapu. To, co zrobiłeś wcześniej, zostaje.",
                    hr: "Vraćaš se na početak ove etape. Ono što si prije završio, ostaje tvoje.",
                    sr: "Vraćaš se na početak ove etape. Ono što si pre završio, ostaje tvoje." };
const RETRY_ST  = { de: "Etappe wiederholen", en: "Retry stage", pl: "Powtórz etap",
                    hr: "Ponovi etapu", sr: "Ponovi etapu" };

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


function Stars({ n, size = 26 }) {
  return (
    <div className="tp-stars" aria-label={n + " von 5 Sternen"}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= n ? "#f5b93b" : "none"}
          color={i <= n ? "#f5b93b" : "#cfdaec"}
          style={{ animationDelay: (i * 90) + "ms" }}
          className={i <= n ? "on" : ""} />
      ))}
    </div>
  );
}

/* ============================================ Vorfuehrung mit Animation */

function Demo({ step, onDone, lang }) {
  const Scene = SCENES[step.scene] || Scenes.RoomScene;
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
        {step.customScene ? <GeneratedScene scene={step.customScene} frame={frame} /> : <Scene frame={frame} />}
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
  const Scene = SCENES[step.scene] || Scenes.RoomScene;
  const total = step.spots.length;

  function tapSpot(spot) {
    if (locked || found.includes(spot.id)) return;
    setFound([...found, spot.id]);
  }

  return (
    <div className="tp-hotspot">
      <p className="tp-hint">{t(step.hint, lang)}</p>
      <div className="tp-stage tp-stage-click" onClick={() => { if (!locked) setMiss(miss + 1); }}>
        {step.customScene ? <GeneratedScene scene={step.customScene} dim /> : <Scene dim />}
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

function Sequence({ step, value, setValue, locked, lang, feedback }) {
  const labels = useMemo(() => tList(step.steps, lang), [step, lang]);
  const pool = useMemo(() => shuffle(labels, labels.join("").length * 53), [labels]);
  const picked = Array.isArray(value) ? value : [];
  return (
    <>
      <ol className="tp-seq-line">
        {picked.length === 0 && <span className="tp-placeholder">{t(ORDER_H, lang)}</span>}
        {picked.map((s, i) => {
          const expected = labels[i];
          const verdict = feedback ? (s === expected ? " correct" : " wrong") : "";
          return (
          <li key={s}>
            <button type="button" disabled={locked} className={"tp-chip picked" + verdict}
              onClick={() => setValue(picked.filter((x) => x !== s))}>
              <span className="tp-chip-no">{i + 1}</span>{s}
            </button>
          </li>
        )})}
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

function Decide({ step, value, setValue, locked, lang, feedback }) {
  const chosen = typeof value === "number" ? value : null;
  return (
    <div className="tp-options">
      {tList(step.options, lang).map((opt, i) => (
        <button key={i} type="button" disabled={locked}
          className={"tp-option" + (chosen === i ? " selected" : "") +
            (feedback && i === step.answer ? " correct" : "") +
            (feedback && chosen === i && i !== step.answer ? " wrong" : "")}
          onClick={() => setValue(i)}>{opt}</button>
      ))}
    </div>
  );
}

/* ================================================= Checkliste */

function Checklist({ step, value, setValue, locked, lang, feedback }) {
  const picked = Array.isArray(value) ? value : [];
  return (
    <div className="tp-options">
      {step.items.map((item, i) => {
        const on = picked.includes(i);
        return (
          <button key={i} type="button" disabled={locked}
            className={"tp-option tp-check" + (on ? " selected" : "") +
              (feedback && item.correct ? " correct" : "") +
              (feedback && on && !item.correct ? " wrong" : "")}
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
  if (step.type === "sequence") return Array.isArray(value) && value.length === step.steps.length;
  if (step.type === "checklist") return Array.isArray(value) && value.length > 0;
  if (step.type === "decide") return typeof value === "number";
  return true;
}

export function stepCorrect(step, value, found, lang = "de") {
  if (step.type === "hotspot") return found.length === step.spots.length;
  if (step.type === "sequence") return Array.isArray(value) && value.join("|") === tList(step.steps, lang).join("|");
  if (step.type === "decide") return value === step.answer;
  if (step.type === "checklist") {
    const want = step.items.map((it, i) => (it.correct ? i : null)).filter((x) => x !== null);
    const got = [...(Array.isArray(value) ? value : [])].sort((a, b) => a - b);
    return got.join(",") === want.join(",");
  }
  return true;
}

function promptOf(step, lang) {
  return t(step.prompt, lang) || t(step.title, lang) || "";
}

function StepMedia({ media }) {
  if (!media?.length) return null;
  return (
    <div className="tp-media">
      {media.map((item) => item.type?.startsWith("video/")
        ? <video key={item.id || item.url} src={item.url} controls playsInline />
        : <img key={item.id || item.url} src={item.url} alt={item.name || "Lernbild"} />)}
    </div>
  );
}

/** Menschlich lesbare Loesung fuer die Fehlerkarte. */
export function correctAnswerOf(step, lang = "de") {
  if (step.type === "sequence") return tList(step.steps, lang);
  if (step.type === "decide") return [tList(step.options, lang)[step.answer]];
  if (step.type === "checklist") {
    return step.items.filter((item) => item.correct).map((item) => t(item.label, lang));
  }
  return [];
}

/* ================================================= Der Player */

export default function TaskPlayer({ task, lang, initialHearts = 5, onHeartsChange, onFinish, onQuit }) {
  const stages = useMemo(() => stagesOf(task), [task]);

  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState("intro");   // intro | play | stagedone | lost
  const [queue, setQueue] = useState(() => createQueue(stages[0].steps));
  const [demoIndex, setDemoIndex] = useState(-1);
  const [value, setValue] = useState(null);
  const [found, setFound] = useState([]);
  const [miss, setMiss] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const [hearts, setHearts] = useState(() => Math.max(1, Math.min(5, initialHearts)));
  const [mistakes, setMistakes] = useState(0);
  const [resets, setResets] = useState(0);

  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Laufende Zeit im Kopf
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt.current), 1000);
    return () => clearInterval(id);
  }, []);

  const stage = stages[stageIndex];
  const entry = current(queue);
  const step = entry?.exercise;
  const locked = feedback !== null;

  useEffect(() => { setValue(null); setFound([]); setMiss(0); }, [step, entry?.attempts]);

  /** Startet eine Etappe (neu oder nach Rueckwurf). */
  function beginStage(index) {
    const st = stages[index];
    setQueue(createQueue(st.steps));
    setDemoIndex(st.steps[0]?.type === "demo" ? 0 : -1);
    setFeedback(null);
    setValue(null);
    setFound([]);
    setPhase("play");
  }

  function loseHeart() {
    const nextHearts = Math.max(0, hearts - 1);
    setMistakes((m) => m + 1);
    setHearts(nextHearts);
    onHeartsChange?.(nextHearts);
  }

  /* ---------------------------------------------------------- Kopfzeile */
  const stageProgress = (stageIndex + progress(queue)) / stages.length;
  const head = (
    <header className="tp-head">
      <button type="button" className="tp-quit" onClick={onQuit} aria-label="Verlassen"><X size={22} /></button>
      <div className="tp-bar" role="progressbar" aria-valuenow={Math.round(stageProgress * 100)}>
        <span style={{ width: Math.round(stageProgress * 100) + "%" }} />
      </div>
      <div className="tp-timer"><Clock size={16} /> {formatTime(elapsed)}</div>
      <div className="tp-hearts">
        {[1, 2, 3, 4, 5].map((i) => (
          <Heart key={i} size={17} fill={i <= hearts ? "#e0405d" : "none"}
            color={i <= hearts ? "#e0405d" : "#d7dfec"} />
        ))}
      </div>
    </header>
  );

  /* ------------------------------------------------- Etappen-Ansage */
  if (phase === "intro") {
    return (
      <div className="tp">
        {head}
        <div className="tp-body tp-center">
          <div className="tp-stage-card">
            <span className="tp-stage-no">{t(STAGE, lang)} {stageIndex + 1} / {stages.length}</span>
            <h2>{t(task.title, lang)}</h2>
            <div className="tp-goal">
              <Target size={20} />
              <div>
                <strong>{t(GOAL, lang)}</strong>
                <p>{t(stage.goal, lang)}</p>
              </div>
            </div>
            <button type="button" className="tp-action ok" onClick={() => beginStage(stageIndex)}>
              {t(START, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------- Herzen leer */
  if (phase === "lost") {
    return (
      <div className="tp">
        {head}
        <div className="tp-body tp-center">
          <div className="tp-stage-card lost">
            <span className="tp-lost-icon"><Heart size={34} color="#fff" /></span>
            <h2>{t(NO_HEARTS, lang)}</h2>
            <p>{t(RESET_MSG, lang)}</p>
            <div className="tp-goal">
              <Flag size={20} />
              <div>
                <strong>{t(STAGE, lang)} {stageIndex + 1}</strong>
                <p>{t(stage.goal, lang)}</p>
              </div>
            </div>
            <button type="button" className="tp-action bad"
              onClick={() => {
                setResets((r) => r + 1);
                setHearts(5);
                onHeartsChange?.(5);
                beginStage(stageIndex);
              }}>
              {t(RETRY_ST, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------- Etappe geschafft */
  if (phase === "stagedone") {
    const last = stageIndex === stages.length - 1;
    return (
      <div className="tp">
        {head}
        <div className="tp-body tp-center">
          <div className="tp-stage-card done">
            <span className="tp-stage-badge"><Check size={30} color="#fff" /></span>
            <h2>{t(STAGE_OK, lang)}</h2>
            <p>{t(SAVED, lang)}</p>
            <button type="button" className="tp-action ok" onClick={() => {
              if (last) {
                onFinish({
                  stars: starsFor({ mistakes, resets }),
                  mistakes, resets, ms: Date.now() - startedAt.current,
                  steps: stages.reduce((n, st) => n + st.steps.length, 0)
                });
              } else {
                setStageIndex(stageIndex + 1);
                setPhase("intro");
              }
            }}>
              {last ? t(NEXT, lang) : t(START, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------- Vorfuehrung */
  if (demoIndex >= 0) {
    const demo = stage.steps[demoIndex];
    return (
      <div className="tp">
        {head}
        <div className="tp-body">
          <Demo step={demo} lang={lang} onDone={() => {
            setDemoIndex(-1);
            const rest = stage.steps.filter((x) => x.type !== "demo");
            if (rest.length === 0) setPhase("stagedone");
            else setQueue(createQueue(rest));
          }} />
        </div>
      </div>
    );
  }

  if (!step) return null;

  function check() {
    if (!stepAnswered(step, value, found) || locked) return;
    const correct = stepCorrect(step, value, found, lang);
    if (!correct) loseHeart();
    setFeedback({
      correct,
      explain: t(step.explain, lang),
      correctAnswers: correct ? [] : correctAnswerOf(step, lang)
    });
  }

  function next() {
    // Die Korrektur bleibt sichtbar, bis der Lernende sie bewusst bestaetigt.
    // Erst danach greift bei null Herzen der Rueckwurf zur Etappe.
    if (!feedback.correct && hearts === 0) {
      setFeedback(null);
      setPhase("lost");
      return;
    }
    const result = answer(queue, feedback.correct);
    setFeedback(null);
    // Antwortzustand sofort leeren: sonst sieht die naechste Aufgabe fuer
    // einen Render lang noch den Wert der vorigen (Zahl statt Liste -> Absturz).
    setValue(null);
    setFound([]);
    setMiss(0);
    if (isComplete(result.queue)) { setPhase("stagedone"); return; }
    setQueue(result.queue);
  }

  return (
    <div className="tp">
      {head}
      <div className="tp-body">
        <p className="tp-kicker">
          {t(STAGE, lang)} {stageIndex + 1} · {!entry.firstTry ? t(RETRY, lang) : t(stage.goal, lang)}
        </p>
        <h2 className="tp-prompt">{promptOf(step, lang)}</h2>
        <StepMedia media={step.media} />

        {step.type === "hotspot" && <Hotspot step={step} found={found} setFound={setFound} miss={miss} setMiss={setMiss} locked={locked} lang={lang} />}
        {step.type === "sequence" && <Sequence step={step} value={value} setValue={setValue} locked={locked} lang={lang} feedback={feedback} />}
        {step.type === "decide" && <Decide step={step} value={value} setValue={setValue} locked={locked} lang={lang} feedback={feedback} />}
        {step.type === "checklist" && <Checklist step={step} value={value} setValue={setValue} locked={locked} lang={lang} feedback={feedback} />}
      </div>

      <footer className={"tp-foot" + (feedback ? (feedback.correct ? " ok" : " bad") : "")}>
        {feedback && (
          <div className="tp-feedback">
            <strong>{feedback.correct ? <><Check size={18} /> {t(RIGHT, lang)}</> : <><X size={18} /> {t(WRONG, lang)}</>}</strong>
            <p>{feedback.explain}</p>
            {!feedback.correct && feedback.correctAnswers.length > 0 && (
              <div className="tp-correction">
                <span>{t(CORRECT_ANSWER, lang)}</span>
                {feedback.correctAnswers.map((item, i) => (
                  <div key={item}><b>{feedback.correctAnswers.length > 1 ? (i + 1) + "." : "✓"}</b>{item}</div>
                ))}
              </div>
            )}
            {!feedback.correct && <small className="tp-returns"><RotateCcw size={14} /> {t(COMES_BACK, lang)}</small>}
          </div>
        )}
        <button type="button"
          className={"tp-action" + (feedback ? (feedback.correct ? " ok" : " bad") : " ok")}
          disabled={!feedback && !stepAnswered(step, value, found)}
          onClick={feedback ? next : check}>
          {feedback ? t(feedback.correct ? NEXT : UNDERSTOOD, lang) : t(CHECK, lang)}
        </button>
      </footer>
    </div>
  );
}

export { Stars };
