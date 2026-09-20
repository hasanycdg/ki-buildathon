import React, { useEffect, useMemo, useState } from "react";
import {
  BedDouble, Check, ChevronDown, ConciergeBell, Flame, GraduationCap, Heart,
  Layers, ListChecks, Lock, RotateCcw, SprayCan, Star, Trophy,
  UtensilsCrossed, Volume2
} from "lucide-react";
import { ROLES, getRole } from "../sprachhilfe-inhalte/index.js";
import { allLessons, countExercises } from "../sprachhilfe-inhalte/types.js";
import {
  wordsOfRole, countWordsOfRole, blocksOfRole, buildDeck, wordStrength, WORDS_PER_BLOCK
} from "./vokabular.js";
import { UI, LANGS, t } from "./ui.js";
import * as store from "./store.js";
import { load as loadLearnState } from "../learn/store.js";
import LessonPlayer from "./LessonPlayer.jsx";
import CardTrainer from "./CardTrainer.jsx";
import { speak } from "./speech.js";
import "../learn/learn.css";
import "./sprachhilfe.css";

const ICONS = { BedDouble, ConciergeBell, UtensilsCrossed, SprayCan };

/* ----------------------------------------------------------- Sprachwahl */

function LangPicker({ lang, setLang, hint }) {
  return (
    <div className="ls-lang">
      <span>{t(UI.yourLang, lang)}</span>
      <div className="ls-lang-row">
        {LANGS.map(([code, name, short]) => (
          <button key={code} type="button"
            className={"ls-lang-btn" + (lang === code ? " active" : "")}
            onClick={() => setLang(code)} title={name}>
            <b>{short}</b> <span className="ls-lang-full">{name}</span>
          </button>
        ))}
      </div>
      {hint && <small>{t(UI.langHint, lang)}</small>}
    </div>
  );
}

/* -------------------------------------------------------- Rollenauswahl */

function RoleSelect({ lang, setLang, onPick }) {
  return (
    <div className="ls">
      <header className="ls-head">
        <h1>{t(UI.pickRole, lang)}</h1>
        <p>{t(UI.pickHint, lang)}</p>
      </header>
      <LangPicker lang={lang} setLang={setLang} hint />
      <div className="ls-grid">
        {ROLES.map((role) => {
          const Icon = ICONS[role.icon] || BedDouble;
          return (
            <button key={role.id} type="button" className="ls-card" onClick={() => onPick(role.id)}>
              <span className="ls-icon" style={{ background: role.accent }}>
                <Icon size={26} color="#fff" />
              </span>
              <strong>{t(role.name, lang)}</strong>
              <span className="ls-tag">{t(role.tagline, lang)}</span>
              <p>{t(role.blurb, lang)}</p>
              <span className="ls-meta">
                {countWordsOfRole(role.id)} {t(UI.words, lang)} · {countExercises(role)} {t(UI.exercises, lang)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Kopfzeile */

function StatBar({ state, role, lang, onSwitch }) {
  return (
    <div className="lt-stats">
      <div className="lt-role">
        <strong>{t(role.name, lang)}</strong>
        <button type="button" onClick={onSwitch}>{t(UI.switchRole, lang)}</button>
      </div>
      <div className="lt-metrics">
        <span><Flame size={18} color="#f0762b" /> <b>{state.streak.count}</b> {t(UI.days, lang)}</span>
        <span><Star size={18} color="#f5b93b" /> <b>{state.xp}</b> XP</span>
        <span><Heart size={18} color="#e0405d" /> <b>{state.hearts.count}</b></span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 1. Lernen */

/** Ein Begriff: deutsch gross, Uebersetzung darunter, Balken fuer die Staerke. */
function WordCard({ word, lang, strength }) {
  const bridge = lang !== "de" ? word.tr?.[lang] : null;
  const pct = Math.round(strength * 100);
  return (
    <li className="sh-word">
      <button type="button" className="sh-word-speak" onClick={() => speak(word.de)}
        aria-label={t(UI.listen, lang) + ": " + word.de}>
        <Volume2 size={18} />
      </button>
      <div className="sh-word-main">
        <strong>{word.de}</strong>
        {bridge && <span className="sh-word-tr">{bridge}</span>}
      </div>
      <div className="sh-word-strength" title={pct + " %"}>
        <span className="sh-bar"><i style={{ width: pct + "%" }} /></span>
        <small>{pct === 0 ? t(UI.notYet, lang) : pct + " % " + t(UI.fresh, lang)}</small>
      </div>
    </li>
  );
}

function LearnView({ role, blocks, words, state, lang, onDrill }) {
  const strengthOf = (word) => wordStrength(state.items, word, store.strength);
  const known = words.filter((w) => strengthOf(w) > 0).length;
  const firstOpen = blocks.find((b) => b.words.some((w) => strengthOf(w) === 0)) || blocks[0];
  const [open, setOpen] = useState(() => new Set(firstOpen ? [firstOpen.id] : []));

  function toggle(id) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className="sh-words-head" style={{ borderLeftColor: role.accent }}>
        <div>
          <strong>{t(UI.learnHead, lang)}</strong>
          <p>{t(UI.learnHint, lang)}</p>
        </div>
        <div className="sh-words-count">
          <b>{known}/{words.length}</b>
          <span>{t(UI.learned, lang)}</span>
        </div>
      </div>

      {blocks.map((block) => {
        const isOpen = open.has(block.id);
        const done = block.words.filter((w) => strengthOf(w) > 0).length;
        return (
          <section key={block.id} className={"sh-block" + (isOpen ? " open" : "")}>
            <header>
              <button type="button" className="sh-block-toggle" onClick={() => toggle(block.id)}
                aria-expanded={isOpen}>
                <ChevronDown size={18} className="sh-chevron" />
                <span className="sh-block-no" style={{ background: role.accent }}>{block.number}</span>
                <span className="sh-block-title">
                  <strong>{t(UI.block, lang)} {block.number}</strong>
                  <span>{block.from} … {block.to}</span>
                </span>
                <span className="sh-block-count">{done}/{block.words.length}</span>
              </button>
              <button type="button" className="sh-drill-small"
                onClick={() => onDrill(block)}>
                {t(UI.trainBlock, lang)} →
              </button>
            </header>
            {isOpen && (
              <ul className="sh-word-list">
                {block.words.map((word) => (
                  <WordCard key={word.id} word={word} lang={lang} strength={strengthOf(word)} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}

/* -------------------------------------------------------- 2. Trainieren */

function BlockNode({ block, status, strength, accent, lang, onStart }) {
  const offset = [0, 46, 70, 46, 0, -46, -70, -46][block.index % 8];
  const done = status === "done";
  const locked = status === "locked";
  return (
    <div className="lt-node-wrap" style={{ transform: `translateX(${offset}px)` }}>
      <button type="button" disabled={locked}
        className={"lt-node " + status}
        style={done ? { background: accent, borderColor: accent } : undefined}
        onClick={() => onStart(block)}
        title={t(UI.block, lang) + " " + block.number}>
        {locked ? <Lock size={24} /> : done ? <Check size={28} /> : <span>{block.number}</span>}
      </button>
      <span className="lt-node-label">{block.from} … {block.to}</span>
      {done && strength < 0.6 && (
        <span className="lt-node-weak">{Math.round(strength * 100)} % — {t(UI.repeat, lang)}</span>
      )}
    </div>
  );
}

function TrainView({ role, blocks, state, lang, weak, onDrill, onWeak }) {
  const strengthOf = (word) => wordStrength(state.items, word, store.strength);
  return (
    <>
      <p className="sh-path-hint">{t(UI.trainHint, lang)}</p>

      <div className={"lt-refresh sh-weak" + (weak.length ? "" : " empty")}>
        <div className="lt-refresh-icon"><RotateCcw size={22} /></div>
        <div>
          <strong>{t(UI.weakWords, lang)}</strong>
          <p>{weak.length
            ? weak.slice(0, 4).map((w) => w.de).join(", ") + (weak.length > 4 ? " …" : "")
            : t(UI.weakNone, lang)}</p>
        </div>
        <button type="button" disabled={!weak.length} onClick={onWeak}>
          {weak.length || ""} {t(UI.repeat, lang)}
        </button>
      </div>

      <section className="lt-unit">
        <header className="lt-unit-head" style={{ background: role.accent }}>
          <strong>{t(role.name, lang)}</strong>
          <span>{blocks.length} × {WORDS_PER_BLOCK} {t(UI.words, lang)}</span>
        </header>
        <div className="lt-nodes">
          {blocks.map((block, i) => {
            const done = Boolean(state.lessons[block.id]?.completed);
            const prev = i === 0 ? null : blocks[i - 1];
            const unlocked = !prev || Boolean(state.lessons[prev.id]?.completed);
            const strength = block.words.reduce((s, w) => s + strengthOf(w), 0) / block.words.length;
            return (
              <BlockNode key={block.id} block={block}
                status={done ? "done" : unlocked ? "open" : "locked"}
                strength={strength} accent={role.accent} lang={lang} onStart={onDrill} />
            );
          })}
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------- 3. Kurs */

function LessonNode({ lesson, index, status, strength, accent, lang, onStart }) {
  const offset = [0, 46, 70, 46, 0, -46, -70, -46][index % 8];
  const done = status === "done";
  const locked = status === "locked";
  return (
    <div className="lt-node-wrap" style={{ transform: `translateX(${offset}px)` }}>
      <button type="button" disabled={locked}
        className={"lt-node " + status + (lesson.kind === "checkpoint" ? " checkpoint" : "")}
        style={done ? { background: accent, borderColor: accent } : undefined}
        onClick={() => onStart(lesson)} title={t(lesson.title, lang)}>
        {locked ? <Lock size={24} />
          : done ? (lesson.kind === "checkpoint" ? <Trophy size={26} /> : <Check size={28} />)
          : <span>{index + 1}</span>}
      </button>
      <span className="lt-node-label">{t(lesson.title, lang)}</span>
      {done && strength < 0.6 && (
        <span className="lt-node-weak">{Math.round(strength * 100)} % — {t(UI.repeat, lang)}</span>
      )}
    </div>
  );
}

function CourseView({ role, state, lang, onStart }) {
  const ordered = useMemo(() => allLessons(role).map((l) => l.id), [role.id]);
  const refresh = useMemo(() => store.needsRefresh(state, allLessons(role)), [state, role.id]);
  let counter = -1;

  return (
    <>
      <p className="sh-path-hint">{t(UI.courseHint, lang)}</p>
      {refresh.length > 0 && (
        <div className="lt-refresh">
          <div className="lt-refresh-icon"><RotateCcw size={22} /></div>
          <div>
            <strong>{t(UI.refreshHead, lang)}</strong>
            <p>
              „{t(refresh[0].lesson.title, lang)}" {t(UI.refreshBody, lang)}{" "}
              {Math.round(refresh[0].strength * 100)} %.
              {refresh.length > 1 && ` +${refresh.length - 1} ${t(UI.andMore, lang)}`}
            </p>
          </div>
          <button type="button" onClick={() => onStart(refresh[0].lesson)}>{t(UI.repeat, lang)}</button>
        </div>
      )}
      {role.units.map((unit) => (
        <section key={unit.id} className="lt-unit">
          <header className="lt-unit-head" style={{ background: role.accent }}>
            <strong>{t(unit.title, lang)}</strong>
            <span>{t(unit.subtitle, lang)}</span>
          </header>
          <div className="lt-nodes">
            {unit.lessons.map((lesson) => {
              counter += 1;
              const done = Boolean(state.lessons[lesson.id]?.completed);
              const unlocked = store.isUnlocked(state, ordered, lesson.id);
              return (
                <LessonNode key={lesson.id} lesson={lesson} index={counter}
                  status={done ? "done" : unlocked ? "open" : "locked"}
                  strength={store.lessonStrength(state, lesson)}
                  accent={role.accent} lang={lang} onStart={onStart} />
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

/* ----------------------------------------------------------- Abschluss */

function Done({ result, lang, onClose }) {
  return (
    <div className="lt-done">
      <div className="lt-done-card">
        <span className="lt-done-badge"><Trophy size={34} color="#fff" /></span>
        <h2>{t(result.perfect ? UI.perfect : UI.done, lang)}</h2>
        <p>{t(result.perfect ? UI.perfectSub : UI.doneSub, lang)}</p>
        <div className="lt-done-stats">
          <div><b>+{result.xp}</b><span>XP</span></div>
          <div><b>{result.total}</b><span>{t(result.cards ? UI.cards : UI.exercises, lang)}</span></div>
          <div><b>{result.retries}</b><span>{t(UI.retriedN, lang)}</span></div>
        </div>
        <button type="button" onClick={onClose}>{t(UI.close, lang)}</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Hauptteil */

const TABS = [
  ["learn",  UI.tabLearn,  ListChecks],
  ["train",  UI.tabTrain,  Layers],
  ["course", UI.tabCourse, GraduationCap]
];

export default function SprachhilfeTab() {
  const [state, setState] = useState(() => {
    const own = store.syncHearts(store.load());
    // Beim allerersten Oeffnen die Rolle aus dem Lern-Tab uebernehmen:
    // wer dort Housekeeping gewaehlt hat, will hier keine zweite Abfrage.
    if (own.roleId) return own;
    const inherited = loadLearnState().roleId;
    return getRole(inherited) ? { ...own, roleId: inherited } : own;
  });
  const [view, setView] = useState("learn");
  const [active, setActive] = useState(null);      // laufende Kurslektion
  const [deckSource, setDeckSource] = useState(null);  // laufender Kartenstapel
  const [direction, setDirection] = useState("de2tr");
  const [result, setResult] = useState(null);

  useEffect(() => { store.save(state); }, [state]);

  const lang = state.lang || "en";
  const setLang = (l) => setState((s) => ({ ...s, lang: l }));
  const role = getRole(state.roleId);

  const words = useMemo(() => (role ? wordsOfRole(role.id) : []), [role?.id]);
  const blocks = useMemo(() => (role ? blocksOfRole(role.id) : []), [role?.id]);

  /** Woerter, die schon geuebt wurden und wieder abrutschen. Schwaechste zuerst. */
  const weak = useMemo(() => {
    if (!role) return [];
    return words
      .map((w) => ({ w, s: wordStrength(state.items, w, store.strength) }))
      .filter((x) => x.s > 0 && x.s < 0.5)
      .sort((a, b) => a.s - b.s)
      .slice(0, WORDS_PER_BLOCK)
      .map((x) => x.w);
  }, [state.items, words, role?.id]);

  /** Kurslektion — laeuft ueber den Aufgaben-Player mit Herzen. */
  function startLesson(lesson) {
    // Nach einem Rueckwurf darf sofort weitergeuebt werden.
    setState((s) => (s.hearts?.count > 0 ? s : store.refillHearts(s)));
    setActive({ kind: "lesson", lesson });
  }

  /** Kartenstapel — Selbsteinschaetzung, keine Herzen. */
  function startDeck(source, id, title) {
    setDeckSource({ words: source, id, title });
  }

  // Karten brauchen eine Gegensprache. Wer die Oberflaeche auf Deutsch stehen
  // hat, bekommt Englisch als Vorgabe — eine Karte "Bett / Bett" ist keine.
  const cardLang = lang === "de" ? "en" : lang;

  const deck = useMemo(() => {
    if (!deckSource) return null;
    return buildDeck(deckSource.words, cardLang, direction, {
      id: deckSource.id, title: deckSource.title
    });
  }, [deckSource, cardLang, direction]);

  const onBlock = (block) =>
    startDeck(block.words, block.id, `${t(UI.block, lang)} ${block.number}`);
  const onWeak = () =>
    startDeck(weak, (role?.id || "x") + "-weak", t(UI.weakWords, lang));

  if (!role) {
    return (
      <div className="content-single">
        <RoleSelect lang={lang} setLang={setLang}
          onPick={(roleId) => setState((s) => ({ ...s, roleId }))} />
      </div>
    );
  }

  if (deck) {
    return (
      <CardTrainer
        deck={deck}
        lang={lang}
        onLang={setLang}
        onDirection={setDirection}
        onAnswered={(cardId, quality) => setState((s) => store.recordAnswer(s, cardId, quality))}
        onFinish={({ xp, perfect, total, retries }) => {
          setState((s) => store.completeLesson(s, deck.id, { xp, perfect }));
          setResult({ xp, perfect, total, retries, cards: true });
          setDeckSource(null);
        }}
        onQuit={() => setDeckSource(null)}
      />
    );
  }

  if (active) {
    return (
      <LessonPlayer
        lesson={active.lesson}
        lang={lang}
        hearts={state.hearts.count}
        onHeartLost={() => setState((s) => store.loseHeart(s))}
        onRefill={() => setState((s) => store.refillHearts(s))}
        onAnswered={(exerciseId, quality) => setState((s) => store.recordAnswer(s, exerciseId, quality))}
        onFinish={({ xp, perfect, total, retries }) => {
          setState((s) => store.completeLesson(s, active.lesson.id, { xp, perfect }));
          setResult({ xp, perfect, total, retries });
          setActive(null);
        }}
        onQuit={() => setActive(null)}
      />
    );
  }

  return (
    <div className="content-single">
      <div className="lt sh">
        <StatBar state={state} role={role} lang={lang}
          onSwitch={() => setState((s) => ({ ...s, roleId: null }))} />
        <LangPicker lang={lang} setLang={setLang} />

        <div className="sh-tabs" role="tablist">
          {TABS.map(([id, label, Icon]) => (
            <button key={id} type="button" role="tab" aria-selected={view === id}
              className={"sh-tab" + (view === id ? " active" : "")}
              onClick={() => setView(id)}>
              <Icon size={17} /> {t(label, lang)}
            </button>
          ))}
        </div>

        {view === "learn" && (
          <LearnView role={role} blocks={blocks} words={words} state={state}
            lang={lang} onDrill={onBlock} />
        )}
        {view === "train" && (
          <TrainView role={role} blocks={blocks} state={state} lang={lang}
            weak={weak} onDrill={onBlock} onWeak={onWeak} />
        )}
        {view === "course" && (
          <CourseView role={role} state={state} lang={lang} onStart={startLesson} />
        )}

        {result && <Done result={result} lang={lang} onClose={() => setResult(null)} />}
      </div>
    </div>
  );
}
