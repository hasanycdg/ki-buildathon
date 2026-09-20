const KEY = "worklingo.admin.content.v1";
export const CONTENT_EVENT = "worklingo-content-change";

export const EMPTY_CONTENT_STATE = { overrides: {}, customTasks: [] };

export function loadContentState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    return parsed ? { ...EMPTY_CONTENT_STATE, ...parsed } : EMPTY_CONTENT_STATE;
  } catch {
    return EMPTY_CONTENT_STATE;
  }
}

export function saveContentState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Der Prototyp funktioniert auch ohne persistenten Browser-Speicher weiter. */
  }
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT, { detail: state }));
}

export function localized(de, manual = {}, mode = "auto") {
  if (mode === "manual") {
    return { de, en: manual.en || de, pl: manual.pl || de, hr: manual.hr || de, sr: manual.sr || de };
  }
  // Im Prototyp markiert autoTranslate die spaetere Uebersetzungs-Pipeline.
  // Bis ein Backend angebunden ist, sorgt der deutsche Fallback fuer vollstaendige Inhalte.
  return { de, en: manual.en || de, pl: manual.pl || de, hr: manual.hr || de, sr: manual.sr || de, autoTranslated: true };
}

export function buildCustomTask(draft) {
  const id = draft.id || `custom-${Date.now()}`;
  const title = localized(draft.title, draft.translations?.title, draft.translationMode);
  const goal = localized(draft.goal, draft.translations?.goal, draft.translationMode);
  const question = localized(draft.question || draft.goal, draft.translations?.question, draft.translationMode);
  const correct = localized(draft.correctAnswer || "Richtig handeln", draft.translations?.correctAnswer, draft.translationMode);
  const wrongOne = localized(draft.wrongAnswerOne || "Abwarten", draft.translations?.wrongAnswerOne, draft.translationMode);
  const wrongTwo = localized(draft.wrongAnswerTwo || "Den Schritt überspringen", draft.translations?.wrongAnswerTwo, draft.translationMode);
  const explain = localized(draft.explanation || draft.goal, draft.translations?.explanation, draft.translationMode);
  let exercise;
  if (draft.taskType === "order") {
    exercise = {
      type: "sequence",
      prompt: question,
      steps: (draft.animation || []).map((step) => localized(step, {}, draft.translationMode)),
      explain
    };
  } else if (draft.taskType === "checklist") {
    exercise = {
      type: "checklist",
      prompt: question,
      items: [
        { label: correct, correct: true },
        { label: wrongOne, correct: false },
        { label: wrongTwo, correct: false }
      ],
      explain
    };
  } else if (draft.taskType === "hotspot") {
    const objects = draft.objects?.length ? draft.objects : ["bed", "towel", "spray"];
    exercise = {
      type: "hotspot",
      scene: draft.scene || "room",
      customScene: draft.customScene || null,
      prompt: question,
      hint: localized("Finde alle markierten Stellen in der Szene.", {}, draft.translationMode),
      spots: objects.slice(0, 6).map((object, index) => {
        const placement = typeof object === "string" ? { id: object } : object;
        return {
        id: `${placement.id}-${index}`,
        x: placement.x ?? 20 + (index * 27) % 68,
        y: placement.y ?? 35 + (index % 2) * 32,
        r: 34,
        label: localized(placement.id, {}, draft.translationMode),
        why: explain
      }}),
      explain
    };
  } else {
    exercise = {
      type: "decide",
      prompt: question,
      options: [wrongOne, correct, wrongTwo],
      answer: 1,
      explain
    };
  }
  exercise.media = draft.media || [];

  const demo = draft.storyboard?.length ? {
    type: "demo",
    scene: draft.scene || "room",
    customScene: draft.customScene || null,
    intro: localized("Schau dir den vollständigen Ablauf an.", {}, draft.translationMode),
    assetFrames: draft.storyboard.map((frame) => ({
      ...frame,
      caption: localized(frame.caption, {}, draft.translationMode),
      detail: localized(frame.detail || frame.caption, {}, draft.translationMode)
    })),
    frames: draft.storyboard.map((frame) => ({
      caption: localized(frame.caption, {}, draft.translationMode),
      detail: localized(frame.detail || frame.caption, {}, draft.translationMode)
    }))
  } : null;

  return {
    id,
    custom: true,
    active: draft.active !== false,
    roleId: draft.roleId || "housekeeping",
    title,
    goal,
    minutes: Number(draft.minutes) || 4,
    builder: {
      scene: draft.scene,
      customScene: draft.customScene || null,
      objects: draft.objects || [],
      animation: draft.animation || [],
      storyboard: draft.storyboard || [],
      media: draft.media || [],
      translationMode: draft.translationMode || "auto"
    },
    stages: [{
      id: `${id}-s1`,
      goal,
      steps: demo ? [demo, exercise] : [exercise]
    }]
  };
}

export function applyContentState(role, state) {
  const standard = role.tasks
    .filter((task) => state.overrides?.[task.id]?.active !== false)
    .map((task) => {
      const override = state.overrides?.[task.id];
      return override ? { ...task, ...(override.task || {}), title: override.title || task.title, goal: override.goal || task.goal } : task;
    });
  const custom = (state.customTasks || []).filter((task) => task.roleId === role.id && task.active !== false);
  return { ...role, tasks: [...standard, ...custom] };
}
