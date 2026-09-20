import React, { useEffect, useState } from "react";
import { ArrowRight, Check, RotateCcw, Volume2, X } from "lucide-react";
import { createQueue, current, answer, isComplete, progress, qualityOf } from "../learn/queue.js";
import { speak } from "./speech.js";
import { UI, t } from "./ui.js";

/**
 * Karteikarten-Training
 * =====================
 * Vorne ein Wort, hinten die Uebersetzung. Der Lernende dreht selbst um und
 * sagt selbst, ob er es wusste.
 *
 * Warum Selbsteinschaetzung statt Multiple Choice: Bei vier Optionen raet man
 * sich durch, ohne das Wort je abgerufen zu haben. Wer die Karte umdreht, hat
 * vorher wirklich nachgedacht — und merkt selbst, wenn er danebenlag.
 * Die Ehrlichkeit kostet nichts: es gibt hier keine Herzen zu verlieren.
 *
 * "Nicht gewusst" schiebt die Karte zurueck in den Stapel (queue.js), aber
 * erst nach einem Moment mit der offenen Karte — wer sofort weitergeschoben
 * wird, hat das Wort nicht gelesen. Der Block ist durch, wenn jede Karte
 * einmal gewusst wurde.
 */
export default function CardTrainer({ deck, lang, onDirection, onAnswered, onFinish, onQuit }) {
  const [phase, setPhase] = useState("ready");      // ready | play
  const [queue, setQueue] = useState(() => createQueue(deck.cards));
  const [flipped, setFlipped] = useState(false);
  const [holding, setHolding] = useState(false);    // Karte nach "nicht gewusst" offen lassen
  const [knownFirstTry, setKnownFirstTry] = useState(0);
  const [missed, setMissed] = useState(0);

  const entry = current(queue);
  const card = entry?.exercise;
  const de2tr = deck.direction === "de2tr";

  // Anderer Stapel oder andere Richtung -> von vorne
  useEffect(() => {
    setQueue(createQueue(deck.cards));
    setFlipped(false);
    setHolding(false);
    setKnownFirstTry(0);
    setMissed(0);
  }, [deck.id, deck.direction]);

  const head = (
    <header className="lp-head">
      <button type="button" className="lp-quit" onClick={onQuit} aria-label="Beenden">
        <X size={22} />
      </button>
      <div className="lp-bar" role="progressbar"
        aria-valuenow={Math.round(progress(queue) * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: Math.round(progress(queue) * 100) + "%" }} />
      </div>
      <div className="sh-remaining">
        <b>{queue.entries.length}</b> {t(UI.remaining, lang)}
      </div>
    </header>
  );

  /* ------------------------------------------------------ Startbildschirm */
  if (phase === "ready") {
    return (
      <div className="lp">
        {head}
        <div className="lp-body sh-center">
          <div className="sh-ready">
            <span className="sh-ready-count">{deck.cards.length}</span>
            <h2>{t(UI.ready, lang)}</h2>
            <p>{t(de2tr ? UI.readyHint : UI.readyHintR, lang)}</p>

            {onDirection && lang !== "de" && (
              <div className="sh-direction">
                <span>{t(UI.direction, lang)}</span>
                <div>
                  <button type="button" className={de2tr ? "active" : ""}
                    onClick={() => onDirection("de2tr")}>
                    DE <ArrowRight size={13} /> {lang.toUpperCase()}
                  </button>
                  <button type="button" className={!de2tr ? "active" : ""}
                    onClick={() => onDirection("tr2de")}>
                    {lang.toUpperCase()} <ArrowRight size={13} /> DE
                  </button>
                </div>
              </div>
            )}

            <button type="button" className="lp-action" onClick={() => setPhase("play")}>
              {t(UI.start, lang)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  /** Weiter zur naechsten Karte. */
  function advance(knew) {
    const result = answer(queue, knew);
    if (result.finished) {
      onAnswered(result.finished.exercise.id, qualityOf(result.finished));
      if (result.finished.firstTry) setKnownFirstTry((n) => n + 1);
    }
    setFlipped(false);
    setHolding(false);
    if (knew && isComplete(result.queue)) {
      const perfect = knownFirstTry + (result.finished?.firstTry ? 1 : 0) === queue.total;
      onFinish({ xp: 8 + queue.total * 2, perfect, total: queue.total, retries: missed });
      return;
    }
    setQueue(result.queue);
  }

  return (
    <div className="lp">
      {head}

      <div className="lp-body sh-center">
        <p className="lp-kicker">{!entry.firstTry ? t(UI.again, lang) : deck.title}</p>

        <div className={"sh-card" + (flipped ? " flipped" : "") + (holding ? " missed" : "")}
          role="button" tabIndex={0}
          onClick={() => !flipped && setFlipped(true)}
          onKeyDown={(e) => { if (!flipped && (e.key === "Enter" || e.key === " ")) setFlipped(true); }}>
          <span className="sh-card-face">{card.front}</span>
          {flipped && <span className="sh-card-line" />}
          {flipped && <span className="sh-card-back">{card.back}</span>}
          <button type="button" className="sh-card-speak" aria-label={t(UI.listen, lang)}
            onClick={(e) => { e.stopPropagation(); speak(card.de); }}>
            <Volume2 size={20} />
          </button>
        </div>

        {holding && (
          <small className="sh-returns"><RotateCcw size={14} /> {t(UI.cardAgain, lang)}</small>
        )}
      </div>

      <footer className={"lp-foot" + (holding ? " bad" : "")}>
        {!flipped && (
          <button type="button" className="lp-action" onClick={() => setFlipped(true)}>
            {t(UI.flip, lang)}
          </button>
        )}
        {flipped && !holding && (
          <div className="sh-judge">
            <button type="button" className="sh-judge-btn bad"
              onClick={() => { setMissed((n) => n + 1); setHolding(true); }}>
              <X size={18} /> {t(UI.didntKnow, lang)}
            </button>
            <button type="button" className="sh-judge-btn ok" onClick={() => advance(true)}>
              <Check size={18} /> {t(UI.knew, lang)}
            </button>
          </div>
        )}
        {holding && (
          <button type="button" className="lp-action bad" onClick={() => advance(false)}>
            {t(UI.next, lang)}
          </button>
        )}
      </footer>
    </div>
  );
}
