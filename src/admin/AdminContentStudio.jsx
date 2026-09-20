import React, { useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BedDouble, BookOpen, Box, Check, ChevronRight, CircleHelp,
  Clock3, Copy, Eye, Film, GripVertical, Image as ImageIcon, Languages, Layers3,
  MonitorPlay, MoreHorizontal, Paperclip, Play, Plus, Save, Search, Send, Sparkles,
  SprayCan, ToggleLeft, ToggleRight, UtensilsCrossed, X
} from "lucide-react";
import { ROLES } from "../learn/tasks/index.js";
import { t } from "../learn/i18n.js";
import * as Scenes from "../learn/scenes/index.js";
import { buildCustomTask, loadContentState, localized, saveContentState } from "./contentStore.js";
import { automaticTranslationEnabled, translateAdminDraft } from "./translationService.js";
import { aiGenerationEnabled, generateLessonDraft } from "./generationService.js";
import { getAsset, getAssetVisual, LEARNING_ASSETS } from "./assetLibrary.js";

const SCENES = [
  { id: "room", name: "Hotelzimmer", icon: BedDouble, color: "blue" },
  { id: "bath", name: "Badezimmer", icon: SprayCan, color: "teal" },
  { id: "buffet", name: "Frühstücksbuffet", icon: UtensilsCrossed, color: "orange" },
  { id: "reception", name: "Rezeption", icon: MonitorPlay, color: "violet" }
];

const OBJECTS = [
  ["bed", "Bett", "🛏️", "Zimmer"], ["pillow", "Polster", "🛌", "Zimmer"],
  ["towel", "Handtuch", "🧺", "Zimmer"], ["minibar", "Minibar", "🧊", "Zimmer"],
  ["spray", "Reiniger", "🧴", "Reinigung"], ["cloth", "Putztuch", "🟦", "Reinigung"],
  ["mop", "Wischmopp", "🧹", "Reinigung"], ["bucket", "Eimer", "🪣", "Reinigung"],
  ["cart", "Reinigungswagen", "🛒", "Reinigung"], ["vacuum", "Staubsauger", "♨️", "Reinigung"],
  ["key", "Zimmerkarte", "🪪", "Rezeption"], ["computer", "Computer", "🖥️", "Rezeption"],
  ["phone", "Telefon", "☎️", "Rezeption"], ["guest", "Gast", "🧍", "Rezeption"],
  ["suitcase", "Gepäck", "🧳", "Rezeption"], ["coffee", "Kaffeemaschine", "☕", "Buffet"],
  ["glass", "Glas", "🥛", "Buffet"], ["plate", "Teller", "🍽️", "Buffet"],
  ["bread", "Brotkorb", "🥖", "Buffet"], ["juice", "Saftspender", "🧃", "Buffet"],
  ["thermometer", "Thermometer", "🌡️", "Sicherheit"], ["gloves", "Handschuhe", "🧤", "Sicherheit"],
  ["sign", "Hinweisschild", "⚠️", "Sicherheit"], ["extinguisher", "Feuerlöscher", "🧯", "Sicherheit"]
];

const TASK_TYPES = [
  ["decision", "Entscheidung", "Eine richtige Antwort auswählen", CircleHelp],
  ["order", "Reihenfolge", "Schritte richtig sortieren", Layers3],
  ["hotspot", "Objekte finden", "Stellen in der Szene antippen", Eye],
  ["checklist", "Checkliste", "Mehrere richtige Punkte wählen", Check]
];
const EDITOR_STEPS = [["basis", "1. Grundlagen"], ["translations", "2. Übersetzungen"], ["scene", "3. Szene & Animation"], ["exercise", "4. Aufgabe"]];

const SCENE_COMPONENTS = {
  room: Scenes.RoomScene, bath: Scenes.BathScene, buffet: Scenes.BuffetScene, reception: Scenes.ReceptionScene
};

const normalizeObjects = (objects = []) => objects.map((object, index) => typeof object === "string"
  ? { id: object, x: 22 + (index * 23) % 64, y: 40 + (index % 2) * 28 }
  : object);

const emptyDraft = () => ({
  id: null, kind: "custom", title: "", goal: "", roleId: "housekeeping", minutes: 4,
  active: true, translationMode: "auto", translations: {}, scene: "room", objects: [],
  animation: ["Ausgangssituation", "Handgriff zeigen", "Ergebnis prüfen"], taskType: "decision",
  storyboard: [], question: "", correctAnswer: "", wrongAnswerOne: "", wrongAnswerTwo: "", explanation: "", media: []
});

function AdminToggle({ active, onClick, label }) {
  return (
    <button type="button" className={`content-toggle ${active ? "on" : ""}`} onClick={onClick} aria-label={label}>
      {active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      <span>{active ? "Aktiv" : "Deaktiviert"}</span>
    </button>
  );
}

function LessonPreview({ draft, onClose }) {
  const Scene = SCENE_COMPONENTS[draft.scene] || Scenes.RoomScene;
  const objects = normalizeObjects(draft.objects);
  const firstFrame = draft.storyboard?.[0];
  const generatedVisual = firstFrame && getAssetVisual(firstFrame.assetId, firstFrame.state);
  return (
    <>
      <button type="button" className="preview-scrim" onClick={onClose} aria-label="Vorschau schließen" />
      <aside className="lesson-preview" aria-label="Lektionsvorschau">
        <header><div><span>Live-Vorschau</span><strong>So sehen Lernende die Lektion</strong></div><button type="button" onClick={onClose} aria-label="Schließen"><X size={20} /></button></header>
        <div className="preview-device">
          <div className="preview-device-head"><X size={16} /><span><i style={{ width: "38%" }} /></span><b>♥ 5</b></div>
          <div className="preview-device-body">
            <small>{t(ROLES.find((role) => role.id === draft.roleId)?.name, "de") || "Lerninhalt"} · {draft.minutes} Min.</small>
            <h3>{draft.title || "Titel deiner Lektion"}</h3>
            <p>{draft.goal || "Das Lernziel erscheint hier."}</p>
            <div className="preview-scene">
              {draft.media?.[0] ? (draft.media[0].type.startsWith("video/")
                ? <video src={draft.media[0].url} controls muted playsInline />
                : <img src={draft.media[0].url} alt={draft.media[0].name} />) : generatedVisual
                  ? <img src={generatedVisual} alt={getAsset(firstFrame.assetId)?.name || "Lernobjekt"} />
                  : <Scene dim />}
              {objects.map((object) => {
                const meta = OBJECTS.find(([id]) => id === object.id);
                return <span key={object.id} style={{ left: `${object.x}%`, top: `${object.y}%` }}>{meta?.[2]}</span>;
              })}
            </div>
            <div className="preview-task-label">{TASK_TYPES.find(([id]) => id === draft.taskType)?.[1] || "Aufgabe"}</div>
            <h4>{draft.question || "Deine Aufgabenfrage erscheint hier"}</h4>
            {(draft.taskType === "order" ? draft.animation : [draft.wrongAnswerOne || "Antwort A", draft.correctAnswer || "Antwort B", draft.wrongAnswerTwo || "Antwort C"]).map((answer, index) => <button type="button" key={index}>{draft.taskType === "order" && <b>{index + 1}</b>}{answer}</button>)}
          </div>
          <footer><button type="button">Prüfen</button></footer>
        </div>
        <div className="preview-hint"><Eye size={16} /><span>Die Vorschau aktualisiert sich während der Bearbeitung automatisch.</span></div>
      </aside>
    </>
  );
}

function AutoLessonCreator({ draft, setDraft, aiBrief, setAiBrief, messages, generating, onGenerate, onMedia, mediaInputRef, onBack, onPreview, onSave, saving, onManual }) {
  const frames = draft.storyboard || [];
  const [frame, setFrame] = useState(0);
  const activeFrame = frames[Math.min(frame, Math.max(0, frames.length - 1))];
  const activeAsset = activeFrame && getAsset(activeFrame.assetId);
  const activeVisual = activeFrame && getAssetVisual(activeFrame.assetId, activeFrame.state);
  return (
    <section className="auto-creator">
      <header className="auto-creator-head">
        <button type="button" className="content-back" onClick={onBack}><ArrowLeft size={18} /> Lerninhalte</button>
        <div><span><Sparkles size={14} /> Mistral Lesson Creator</span><h2>Beschreiben. Fertig.</h2><p>Du sagst, was geschult werden soll. Szene, Animation, Aufgabe und Übersetzungen entstehen automatisch.</p></div>
        <em className={aiGenerationEnabled ? "connected" : ""}>{aiGenerationEnabled ? "Mistral verbunden" : "Demo-Modus"}</em>
      </header>

      <div className="auto-creator-grid">
        <main className="auto-prompt-card">
          <div className="auto-simple-fields">
            <label><span>Titel <small>optional</small></span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Wird automatisch erstellt" /></label>
            <label><span>Für wen?</span><select value={draft.roleId} onChange={(event) => setDraft({ ...draft, roleId: event.target.value })}>{ROLES.map((role) => <option key={role.id} value={role.id}>{t(role.name, "de")}</option>)}</select></label>
          </div>

          <div className="auto-prompt-title"><span><Sparkles size={19} /></span><div><h3>Was sollen Mitarbeitende lernen?</h3><p>Schreib einfach drauflos – ohne Formularsprache.</p></div></div>
          <div className="auto-conversation">
            {messages.slice(-3).map((message, index) => <div key={index} className={message.role}><b>{message.role === "assistant" ? "Mistral" : "Du"}</b><p>{message.text}</p></div>)}
            {generating && <div className="assistant auto-thinking"><b>Mistral</b><p><i /> <i /> <i /> Szene und Animation werden gebaut …</p></div>}
          </div>
          <textarea className="auto-main-input" value={aiBrief} onChange={(event) => setAiBrief(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onGenerate(); } }} placeholder="Zum Beispiel: Zeige neuen Mitarbeitenden, wie sie die Kaffeemaschine ausschalten, die Fächer öffnen, alle Teile reinigen und am Ende kontrollieren …" />
          {draft.media?.length > 0 && <div className="auto-attachments">{draft.media.map((item) => <span key={item.id}>{item.type.startsWith("video/") ? <Film size={14} /> : <ImageIcon size={14} />}{item.name}<button type="button" onClick={() => setDraft({ ...draft, media: draft.media.filter((media) => media.id !== item.id) })}><X size={12} /></button></span>)}</div>}
          <div className="auto-prompt-actions">
            <input ref={mediaInputRef} type="file" accept="image/*,video/*" hidden onChange={(event) => { onMedia(event.target.files?.[0]); event.target.value = ""; }} />
            <button type="button" className="auto-upload" onClick={() => mediaInputRef.current?.click()}><Paperclip size={17} /> Foto oder Video</button>
            <button type="button" className="auto-generate" disabled={generating || !aiBrief.trim()} onClick={onGenerate}>{generating ? "Wird erstellt …" : draft.goal ? "Änderung übernehmen" : "Lektion erstellen"}<Sparkles size={17} /></button>
          </div>
          <div className="auto-examples"><span>Beispiele:</span>{["Kaffeemaschine reinigen", "Minibar kontrollieren", "Gast einchecken"].map((example) => <button type="button" key={example} onClick={() => setAiBrief(example)}>{example}</button>)}</div>
          <button type="button" className="auto-manual-link" onClick={onManual}>Erweiterte Einstellungen manuell öffnen</button>
        </main>

        <aside className={`auto-result-card ${draft.goal ? "ready" : ""}`}>
          {!draft.goal ? <div className="auto-empty-result"><div className="auto-orbit"><Sparkles size={28} /></div><strong>Hier erscheint deine fertige Lektion</strong><p>Mit echter Szene, bewegten Objektzuständen und einer passenden Aufgabe.</p><small>{LEARNING_ASSETS.length} interaktive Hotelobjekte vorbereitet</small></div> : <>
            <div className="auto-result-head"><span><Check size={15} /> Entwurf fertig</span><button type="button" onClick={onPreview}><Eye size={15} /> Lernansicht</button></div>
            <h3>{draft.title}</h3><p>{draft.goal}</p>
            <div className="auto-scene-stage">
              {draft.media?.[0] ? (draft.media[0].type.startsWith("video/") ? <video src={draft.media[0].url} controls muted /> : <img src={draft.media[0].url} alt="Eigene Referenz" />) : activeVisual ? <img key={`${activeFrame.assetId}-${activeFrame.state}`} src={activeVisual} alt={activeAsset?.name || "Lernobjekt"} /> : <div className="auto-scene-fallback"><Box size={44} /></div>}
              <span>{activeAsset?.name || "Automatische Szene"}</span>
            </div>
            <div className="auto-storyboard">{frames.map((item, index) => <button type="button" key={`${item.caption}-${index}`} className={index === frame ? "active" : ""} onClick={() => setFrame(index)}><b>{index + 1}</b><span>{item.caption}</span></button>)}</div>
            <div className="auto-result-meta"><span><Film size={14} /> {frames.length} Szenen</span><span><CircleHelp size={14} /> Aufgabe inklusive</span><span><Languages size={14} /> 5 Sprachen</span></div>
            <button type="button" className="auto-publish" disabled={saving} onClick={onSave}>{saving ? "Wird übersetzt …" : "Lektion veröffentlichen"}<ChevronRight size={17} /></button>
          </>}
        </aside>
      </div>
    </section>
  );
}

export default function AdminContentStudio({ onNotice }) {
  const [contentState, setContentState] = useState(loadContentState);
  const [view, setView] = useState("list");
  const [draft, setDraft] = useState(emptyDraft);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editorTab, setEditorTab] = useState("basis");
  const [objectQuery, setObjectQuery] = useState("");
  const [objectCategory, setObjectCategory] = useState("Alle");
  const [previewStep, setPreviewStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiBrief, setAiBrief] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creationMode, setCreationMode] = useState("auto");
  const [aiMessages, setAiMessages] = useState([{ role: "assistant", text: "Beschreibe mir einfach, was Mitarbeitende lernen sollen. Du kannst auch ein Foto oder Video anhängen." }]);
  const mediaInputRef = useRef(null);

  const rows = useMemo(() => {
    const standards = ROLES.flatMap((role) => role.tasks.map((task) => {
      const override = contentState.overrides?.[task.id];
      return { ...task, roleId: role.id, roleName: t(role.name, "de"), kind: "standard", active: override?.active !== false,
        displayTitle: t(override?.title || task.title, "de"), displayGoal: t(override?.goal || task.goal, "de") };
    }));
    const custom = (contentState.customTasks || []).map((task) => ({ ...task, kind: "custom",
      roleName: t(ROLES.find((role) => role.id === task.roleId)?.name, "de"), displayTitle: t(task.title, "de"), displayGoal: t(task.goal, "de") }));
    return [...standards, ...custom].filter((item) =>
      (roleFilter === "all" || item.roleId === roleFilter) &&
      `${item.displayTitle} ${item.displayGoal} ${item.roleName}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [contentState, query, roleFilter]);
  const editorIndex = EDITOR_STEPS.findIndex(([id]) => id === editorTab);

  function persist(next, message) {
    setContentState(next);
    saveContentState(next);
    onNotice?.(message);
  }

  function toggle(item) {
    if (item.kind === "standard") {
      const current = contentState.overrides?.[item.id] || {};
      persist({ ...contentState, overrides: { ...contentState.overrides, [item.id]: { ...current, active: !item.active } } },
        `${item.displayTitle} wurde ${item.active ? "deaktiviert" : "aktiviert"}.`);
    } else {
      persist({ ...contentState, customTasks: contentState.customTasks.map((task) => task.id === item.id ? { ...task, active: !item.active } : task) },
        `${item.displayTitle} wurde ${item.active ? "deaktiviert" : "aktiviert"}.`);
    }
  }

  function openNew() {
    setDraft(emptyDraft());
    setAiBrief("");
    setCreationMode("auto");
    setAiMessages([{ role: "assistant", text: "Was möchtest du erklären? Schreib es so, wie du es einer Kollegin sagen würdest – ich baue daraus die komplette Lektion." }]);
    setEditorTab("basis");
    setView("editor");
  }

  function openEdit(item) {
    const override = contentState.overrides?.[item.id];
    const firstStep = item.stages?.[0]?.steps?.[0];
    setDraft({
      ...emptyDraft(), id: item.id, kind: item.kind, roleId: item.roleId, active: item.active,
      title: item.displayTitle, goal: item.displayGoal, minutes: item.minutes || 4,
      translationMode: item.kind === "standard" ? "manual" : item.builder?.translationMode || "auto",
      translations: item.kind === "standard"
        ? { title: override?.title || item.title, goal: override?.goal || item.goal }
        : { title: item.title, goal: item.goal, question: firstStep?.prompt,
            correctAnswer: firstStep?.options?.[1], wrongAnswerOne: firstStep?.options?.[0],
            wrongAnswerTwo: firstStep?.options?.[2], explanation: firstStep?.explain },
      scene: item.builder?.scene || "room", objects: normalizeObjects(item.builder?.objects || []), animation: item.builder?.animation || emptyDraft().animation,
      storyboard: item.builder?.storyboard || [],
      media: item.builder?.media || firstStep?.media || [],
      taskType: firstStep?.type === "sequence" ? "order" : firstStep?.type === "decide" ? "decision" : firstStep?.type || "decision",
      question: firstStep?.prompt?.de || "", correctAnswer: firstStep?.options?.[1]?.de || "",
      wrongAnswerOne: firstStep?.options?.[0]?.de || "", wrongAnswerTwo: firstStep?.options?.[2]?.de || "",
      explanation: firstStep?.explain?.de || ""
    });
    setEditorTab("basis");
    setView("editor");
  }

  async function generateFromBrief() {
    if (!aiBrief.trim()) {
      onNotice?.("Beschreibe kurz, was Mitarbeitende lernen sollen.");
      return;
    }
    setGenerating(true);
    const request = aiBrief.trim();
    setAiMessages((messages) => [...messages, { role: "user", text: request, media: draft.media }]);
    setAiBrief("");
    const mediaContext = draft.media?.length ? ` Referenzmedien: ${draft.media.map((item) => item.name).join(", ")}.` : "";
    const existingContext = draft.goal ? ` Bestehender Entwurf: ${JSON.stringify({ title: draft.title, goal: draft.goal, scene: draft.scene, objects: draft.objects.map((item) => item.id || item), animation: draft.animation, taskType: draft.taskType, question: draft.question, correctAnswer: draft.correctAnswer, wrongAnswerOne: draft.wrongAnswerOne, wrongAnswerTwo: draft.wrongAnswerTwo, explanation: draft.explanation })}. Änderungswunsch: ` : "";
    const result = await generateLessonDraft(existingContext + request + mediaContext);
    setDraft((current) => ({ ...current, ...result.draft, title: current.title.trim() || result.draft.title, objects: normalizeObjects(result.draft.objects), translationMode: "auto" }));
    setAiMessages((messages) => [...messages, { role: "assistant", text: `Fertig – ich habe „${result.draft.title}“ mit ${result.draft.animation?.length || 3} Animationsschritten und einer ${TASK_TYPES.find(([id]) => id === result.draft.taskType)?.[1] || "Aufgabe"} vorbereitet. Du kannst mir weitere Änderungen schreiben oder direkt die Vorschau öffnen.` }]);
    setGenerating(false);
    onNotice?.(result.usedFallback
      ? "Lektion wurde mit der lokalen Hotelvorlage erstellt. Du kannst alles anpassen."
      : "Lektion wurde vollständig mit KI erstellt. Bitte kurz prüfen.");
  }

  async function acceptMedia(file) {
    if (!file || (!file.type.startsWith("image/") && !file.type.startsWith("video/"))) {
      onNotice?.("Bitte nur Fotos oder Videos hochladen.");
      return;
    }
    const persistent = file.size <= 3 * 1024 * 1024;
    const url = persistent ? await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    }) : URL.createObjectURL(file);
    const item = { id: `${file.name}-${Date.now()}`, name: file.name, type: file.type, url, persistent };
    setDraft((current) => ({ ...current, media: [...(current.media || []), item] }));
    setAiMessages((messages) => [...messages, { role: "assistant", text: `${file.type.startsWith("video/") ? "Video" : "Foto"} „${file.name}“ ist angehängt und wird in Szene und Vorschau verwendet.` }]);
    if (!persistent) onNotice?.("Große Videodatei ist für diese Prototyp-Sitzung eingebunden. Produktiv würde sie in den Medienspeicher hochgeladen.");
  }

  function addObject(id) {
    if (draft.objects.some((object) => (typeof object === "string" ? object : object.id) === id)) return;
    const count = draft.objects.length;
    setDraft({ ...draft, objects: [...normalizeObjects(draft.objects), { id, x: 24 + (count * 21) % 60, y: 42 + (count % 2) * 28 }] });
  }

  function dropObject(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/worklingo-object");
    if (!id) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(10, Math.min(90, ((event.clientY - rect.top) / rect.height) * 100));
    setDraft((current) => {
      const objects = normalizeObjects(current.objects);
      const exists = objects.some((object) => object.id === id);
      return { ...current, objects: exists ? objects.map((object) => object.id === id ? { ...object, x, y } : object) : [...objects, { id, x, y }] };
    });
  }

  async function saveDraft() {
    if (!draft.title.trim() || !draft.goal.trim()) {
      onNotice?.("Titel und Lernziel werden zum Speichern benötigt.");
      return;
    }
    setSaving(true);
    let finalDraft = draft;
    let usedFallback = false;
    if (draft.translationMode === "auto") {
      const translated = await translateAdminDraft(draft);
      finalDraft = { ...draft, translations: translated.translations };
      usedFallback = translated.usedFallback;
    }
    if (finalDraft.kind === "standard") {
      const original = ROLES.flatMap((role) => role.tasks).find((task) => task.id === draft.id);
      const current = contentState.overrides?.[draft.id] || {};
      const title = finalDraft.translationMode === "manual" && finalDraft.translations.title
        ? { ...original.title, ...finalDraft.translations.title, de: finalDraft.title }
        : localized(finalDraft.title, finalDraft.translations.title, "auto");
      const goal = finalDraft.translationMode === "manual" && finalDraft.translations.goal
        ? { ...original.goal, ...finalDraft.translations.goal, de: finalDraft.goal }
        : localized(finalDraft.goal, finalDraft.translations.goal, "auto");
      const task = { ...original, title, goal, minutes: Number(finalDraft.minutes) || original.minutes,
        builder: { scene: finalDraft.scene, objects: finalDraft.objects, animation: finalDraft.animation, storyboard: finalDraft.storyboard, media: finalDraft.media,
          translationMode: finalDraft.translationMode } };
      persist({ ...contentState, overrides: { ...contentState.overrides, [draft.id]: { ...current, active: draft.active, title, goal, task } } },
        usedFallback ? "Gespeichert. Übersetzungsdienst nicht verbunden – deutscher Fallback ist aktiv." : "Änderungen und Übersetzungen wurden im Lernbereich aktualisiert.");
    } else {
      const task = buildCustomTask(finalDraft);
      const exists = contentState.customTasks.some((item) => item.id === task.id);
      persist({ ...contentState, customTasks: exists
        ? contentState.customTasks.map((item) => item.id === task.id ? task : item)
        : [...contentState.customTasks, task] }, usedFallback ? "Veröffentlicht. Übersetzungsdienst nicht verbunden – deutscher Fallback ist aktiv." : "Eigener Lerninhalt wurde übersetzt und veröffentlicht.");
    }
    setSaving(false);
    setView("list");
  }

  if (view === "editor" && draft.kind === "custom" && creationMode === "auto") {
    return <>
      {previewOpen && <LessonPreview draft={draft} onClose={() => setPreviewOpen(false)} />}
      <AutoLessonCreator
        draft={draft} setDraft={setDraft} aiBrief={aiBrief} setAiBrief={setAiBrief}
        messages={aiMessages} generating={generating} onGenerate={generateFromBrief}
        onMedia={acceptMedia} mediaInputRef={mediaInputRef} onBack={() => setView("list")}
        onPreview={() => setPreviewOpen(true)} onSave={saveDraft} saving={saving}
        onManual={() => setCreationMode("manual")}
      />
    </>;
  }

  if (view === "editor") {
    return (
      <section className="content-editor">
        {previewOpen && <LessonPreview draft={draft} onClose={() => setPreviewOpen(false)} />}
        <header className="content-editor-head">
          <button type="button" className="content-back" onClick={() => setView("list")}><ArrowLeft size={18} /> Zurück</button>
          <div><span>{draft.kind === "standard" ? "Standardinhalt bearbeiten" : "Eigener Lerninhalt"}</span><h2>{draft.title || "Neuen Lerninhalt erstellen"}</h2></div>
          <div className="content-editor-actions"><button type="button" className="admin-secondary" onClick={() => setPreviewOpen(true)}><Eye size={16} /> Vorschau</button><button type="button" className="admin-primary" disabled={saving} onClick={saveDraft}><Save size={16} /> {saving ? "Übersetze …" : "Speichern"}</button></div>
        </header>

        {draft.kind === "standard" && <div className="content-protection"><BookOpen size={18} /><div><strong>Geschützter Standardinhalt</strong><span>Dieser Inhalt kann bearbeitet oder deaktiviert, aber nicht gelöscht werden. Änderungen gelten sofort für neue Lerndurchläufe.</span></div></div>}

        <nav className="content-editor-tabs">
          {EDITOR_STEPS.map(([id, label]) =>
            <button key={id} type="button" className={editorTab === id ? "active" : ""} onClick={() => setEditorTab(id)}>{label}</button>)}
        </nav>

        <div className="content-editor-body">
          {editorTab === "basis" && <div className="content-form-card">
            <div className="content-section-title"><span>01</span><div><h3>Grundlagen</h3><p>Worum geht es und für wen ist der Inhalt gedacht?</p></div></div>
            {draft.kind === "custom" && <div className="creation-mode-switch"><button type="button" className={creationMode === "auto" ? "active" : ""} onClick={() => setCreationMode("auto")}><Sparkles size={17} /><span><strong>Automatic Mode</strong><small>Beschreiben, KI baut alles</small></span></button><button type="button" className={creationMode === "manual" ? "active" : ""} onClick={() => setCreationMode("manual")}><Layers3 size={17} /><span><strong>Manuell erstellen</strong><small>Jeden Schritt selbst festlegen</small></span></button></div>}
            <div className="content-form-grid compact-basics">
              <label className="wide"><span>Titel {draft.kind === "custom" && creationMode === "auto" ? "(optional – wird sonst automatisch erstellt)" : "*"}</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="z. B. Kaffeemaschine reinigen" /></label>
              <label><span>Rolle</span><select value={draft.roleId} onChange={(e) => setDraft({ ...draft, roleId: e.target.value })}>{ROLES.map((role) => <option key={role.id} value={role.id}>{t(role.name, "de")}</option>)}</select></label>
              <label><span>Dauer</span><select value={draft.minutes} onChange={(e) => setDraft({ ...draft, minutes: e.target.value })}>{[3,4,5,6,8,10].map((n) => <option key={n} value={n}>{n} Minuten</option>)}</select></label>
            </div>
            {draft.kind === "custom" && creationMode === "auto" ? <div className="ai-lesson-builder ai-chat-builder">
              <div className="ai-builder-head"><span><Sparkles size={18} /></span><div><strong>WorkLingo AI</strong><p>Schreib frei, was die Lektion zeigen soll. Rückfragen und Änderungswünsche funktionieren genauso.</p></div><em>{aiGenerationEnabled ? "KI verbunden" : "Lokale Vorlage"}</em></div>
              <div className="ai-chat-log">{aiMessages.map((message, index) => <div key={index} className={message.role}><span>{message.role === "assistant" ? <Sparkles size={14} /> : "Du"}</span><p>{message.text}</p>{message.media?.length > 0 && <small>{message.media.map((item) => item.name).join(", ")}</small>}</div>)}{generating && <div className="assistant thinking"><span><Sparkles size={14} /></span><p>Ich erstelle Szene, Animation, Aufgabe und Übersetzungsgrundlage …</p></div>}</div>
              {draft.media?.length > 0 && <div className="ai-media-row">{draft.media.map((item) => <div key={item.id}>{item.type.startsWith("video/") ? <video src={item.url} muted /> : <img src={item.url} alt="" />}<span>{item.type.startsWith("video/") ? <Film size={12} /> : <ImageIcon size={12} />}{item.name}</span><button type="button" onClick={() => setDraft({ ...draft, media: draft.media.filter((media) => media.id !== item.id) })}><X size={12} /></button></div>)}</div>}
              <div className="ai-chat-composer"><textarea value={aiBrief} onChange={(e) => setAiBrief(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generateFromBrief(); } }} placeholder="z. B. Kaffeemaschine: zeigen, wie man sie ausschaltet, reinigt und am Ende kontrolliert …" /><input ref={mediaInputRef} type="file" accept="image/*,video/*" hidden onChange={(e) => { acceptMedia(e.target.files?.[0]); e.target.value = ""; }} /><button type="button" className="attach" aria-label="Foto oder Video anhängen" onClick={() => mediaInputRef.current?.click()} title="Foto oder Video anhängen"><Paperclip size={18} /></button><button type="button" className="send" aria-label="Nachricht senden und Lektion erstellen" disabled={generating} onClick={generateFromBrief}><Send size={17} /></button></div>
              <div className="ai-chat-help"><span><ImageIcon size={13} /> Fotos</span><span><Film size={13} /> Videos</span><small>Enter zum Erstellen · Shift + Enter für neue Zeile</small></div>
              {draft.goal && <div className="generated-summary"><Check size={16} /><div><strong>Entwurf bereit</strong><span>{draft.animation.length} Animationsschritte · {TASK_TYPES.find(([id]) => id === draft.taskType)?.[1]} · {draft.objects.length} Objekte</span></div><button type="button" onClick={() => setPreviewOpen(true)}>Vorschau öffnen</button></div>}
            </div> : <div className="content-form-grid manual-goal"><label className="wide"><span>Lernziel *</span><textarea value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })} placeholder="Nach dieser Lektion können Mitarbeitende …" /></label></div>}
            <button type="button" className="content-next" onClick={() => setEditorTab("translations")}>Weiter zu Übersetzungen <ChevronRight size={16} /></button>
          </div>}

          {editorTab === "translations" && <div className="content-form-card">
            <div className="content-section-title"><span>02</span><div><h3>Mehrsprachigkeit</h3><p>Wähle, wie die fünf Sprachversionen entstehen.</p></div></div>
            <div className="translation-choice">
              <button type="button" className={draft.translationMode === "auto" ? "active" : ""} onClick={() => setDraft({ ...draft, translationMode: "auto" })}><Sparkles size={21} /><strong>Automatisch übersetzen</strong><span>Deutsch eingeben – Englisch, Polnisch, Kroatisch und Serbisch werden beim Speichern erzeugt.</span><em>{automaticTranslationEnabled ? "KI verbunden" : "Fallback bereit"}</em></button>
              <button type="button" className={draft.translationMode === "manual" ? "active" : ""} onClick={() => setDraft({ ...draft, translationMode: "manual" })}><Languages size={21} /><strong>Eigene Übersetzungen</strong><span>Jede Sprachversion selbst eintragen oder bestehende Formulierungen prüfen.</span></button>
            </div>
            <div className="translation-notice"><Sparkles size={16} /><p><strong>Hinweis nur für Admins:</strong> {draft.translationMode === "auto"
              ? "Automatische Übersetzungen sollten vor der Veröffentlichung von einer sprachkundigen Person geprüft werden. Lernende sehen diesen Hinweis nicht."
              : "Eigene Übersetzungen werden exakt wie eingetragen veröffentlicht. Leere Felder verwenden bis zur Ergänzung den deutschen Ausgangstext."}</p></div>
            {draft.translationMode === "manual" && <div className="translation-fields">
              {[['en','Englisch'],['pl','Polnisch'],['hr','Kroatisch'],['sr','Serbisch']].map(([code, label]) => (
                <div className="translation-language" key={code}>
                  <strong>{label}</strong>
                  {[
                    ["title", "Titel", "input"], ["goal", "Lernziel", "textarea"],
                    ["question", "Aufgabenfrage", "input"], ["correctAnswer", "Richtige Antwort", "input"],
                    ["wrongAnswerOne", "Falsche Antwort 1", "input"], ["wrongAnswerTwo", "Falsche Antwort 2", "input"],
                    ["explanation", "Erklärung", "textarea"]
                  ].map(([field, fieldLabel, kind]) => (
                    <label key={field}><span>{fieldLabel}</span>
                      {kind === "textarea" ?
                        <textarea value={draft.translations?.[field]?.[code] || ""} onChange={(e) => setDraft({ ...draft, translations: { ...draft.translations, [field]: { ...draft.translations?.[field], [code]: e.target.value } } })} placeholder={`${fieldLabel} auf ${label}`} /> :
                        <input value={draft.translations?.[field]?.[code] || ""} onChange={(e) => setDraft({ ...draft, translations: { ...draft.translations, [field]: { ...draft.translations?.[field], [code]: e.target.value } } })} placeholder={`${fieldLabel} auf ${label}`} />}
                    </label>
                  ))}
                </div>
              ))}
            </div>}
            <button type="button" className="content-next" onClick={() => setEditorTab("scene")}>Weiter zum Baukasten <ChevronRight size={16} /></button>
          </div>}

          {editorTab === "scene" && <div className="builder-layout">
            <aside className="object-library">
              <div className="content-section-title compact"><Box size={18} /><div><h3>Objektbibliothek</h3><p>Anklicken oder in die Szene ziehen</p></div></div>
              <label className="object-search"><Search size={15} /><input value={objectQuery} onChange={(e) => setObjectQuery(e.target.value)} placeholder="Objekt suchen …" /></label>
              <div className="object-categories">{["Alle", ...new Set(OBJECTS.map((item) => item[3]))].map((category) => <button type="button" key={category} className={objectCategory === category ? "active" : ""} onClick={() => setObjectCategory(category)}>{category}</button>)}</div>
              <div className="object-grid">{OBJECTS.filter(([, name,, category]) => (objectCategory === "Alle" || category === objectCategory) && name.toLowerCase().includes(objectQuery.toLowerCase())).map(([id, name, emoji]) => <button type="button" draggable key={id} onDragStart={(e) => e.dataTransfer.setData("text/worklingo-object", id)} onClick={() => addObject(id)}><span>{emoji}</span><b>{name}</b><Plus size={13} /></button>)}</div>
            </aside>
            <div className="scene-builder">
              <div className="scene-picker">{SCENES.map(({ id, name, icon: Icon, color }) => <button type="button" key={id} className={`${draft.scene === id ? "active" : ""} ${color}`} onClick={() => setDraft({ ...draft, scene: id })}><Icon size={18} />{name}</button>)}</div>
              <div className={`scene-canvas actual-scene scene-${draft.scene}`} onDragOver={(e) => e.preventDefault()} onDrop={dropObject}>
                {draft.media?.[0] ? (draft.media[0].type.startsWith("video/")
                  ? <video className="scene-media" src={draft.media[0].url} controls muted playsInline />
                  : <img className="scene-media" src={draft.media[0].url} alt={draft.media[0].name} />)
                  : React.createElement(SCENE_COMPONENTS[draft.scene] || Scenes.RoomScene, { dim: true })}
                <div className="scene-canvas-label"><MonitorPlay size={17} /><span>Vorschau · Schritt {previewStep + 1}</span></div>
                {draft.objects.length === 0 && <div className="scene-empty"><Layers3 size={30} /><strong>Objekte hierher ziehen</strong><span>Oder links anklicken und danach frei verschieben.</span></div>}
                <div className="scene-objects">{normalizeObjects(draft.objects).map((object, i) => { const obj = OBJECTS.find((x) => x[0] === object.id); return <button type="button" draggable key={object.id} style={{ left: `${Math.min(94, object.x + previewStep * 3)}%`, top: `${Math.min(90, object.y + (previewStep % 2) * 3)}%` }} onDragStart={(e) => e.dataTransfer.setData("text/worklingo-object", object.id)} onClick={() => setDraft({ ...draft, objects: normalizeObjects(draft.objects).filter((x) => x.id !== object.id) })} title="Ziehen zum Verschieben · Klicken zum Entfernen"><span>{obj?.[2]}</span><small>{obj?.[1]}</small></button>; })}</div>
              </div>
              <div className="animation-timeline"><div className="timeline-head"><div><strong>Animation</strong><span>Schritt anklicken, um die Bewegung zu prüfen · {draft.animation.length} Schritte</span></div><button type="button" onClick={() => setDraft({ ...draft, animation: [...draft.animation, `Schritt ${draft.animation.length + 1}`] })}><Plus size={14} /> Schritt</button></div><div className="timeline-steps">{draft.animation.map((step, i) => <div key={i} className={previewStep === i ? "active" : ""} onClick={() => setPreviewStep(i)}><GripVertical size={15} /><b>{i + 1}</b><input value={step} onClick={(e) => e.stopPropagation()} onChange={(e) => setDraft({ ...draft, animation: draft.animation.map((x, index) => index === i ? e.target.value : x) })} /></div>)}</div></div>
            </div>
          </div>}

          {editorTab === "exercise" && <div className="content-form-card">
            <div className="content-section-title"><span>04</span><div><h3>Aufgabe bauen</h3><p>Wähle eine Vorlage und fülle nur die Inhalte aus.</p></div></div>
            <div className="task-type-grid">{TASK_TYPES.map(([id,name,desc,Icon]) => <button type="button" key={id} className={draft.taskType === id ? "active" : ""} onClick={() => setDraft({ ...draft, taskType: id })}><Icon size={20} /><strong>{name}</strong><span>{desc}</span></button>)}</div>
            <div className="content-form-grid exercise-fields">
              <label className="wide"><span>Frage</span><input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder="Was ist in dieser Situation richtig?" /></label>
              <label><span>Richtige Antwort</span><input value={draft.correctAnswer} onChange={(e) => setDraft({ ...draft, correctAnswer: e.target.value })} /></label>
              <label><span>Falsche Antwort</span><input value={draft.wrongAnswerOne} onChange={(e) => setDraft({ ...draft, wrongAnswerOne: e.target.value })} /></label>
              <label><span>Weitere falsche Antwort</span><input value={draft.wrongAnswerTwo} onChange={(e) => setDraft({ ...draft, wrongAnswerTwo: e.target.value })} /></label>
              <label><span>Erklärung nach der Antwort</span><input value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} /></label>
            </div>
            <div className="exercise-preview"><span>Vorschau</span><strong>{draft.question || "Deine Frage erscheint hier"}</strong>{[draft.wrongAnswerOne || "Antwort A", draft.correctAnswer || "Antwort B", draft.wrongAnswerTwo || "Antwort C"].map((x,i) => <div key={i}>{x}</div>)}</div>
          </div>}
        </div>
        <footer className="content-editor-footer">
          <div><span>Schritt {editorIndex + 1} von {EDITOR_STEPS.length}</span><i><b style={{ width: `${((editorIndex + 1) / EDITOR_STEPS.length) * 100}%` }} /></i></div>
          <div>{editorIndex > 0 && <button type="button" className="admin-secondary" onClick={() => setEditorTab(EDITOR_STEPS[editorIndex - 1][0])}>Zurück</button>}{editorIndex < EDITOR_STEPS.length - 1
            ? <button type="button" className="admin-primary" onClick={() => setEditorTab(EDITOR_STEPS[editorIndex + 1][0])}>Weiter <ChevronRight size={15} /></button>
            : <button type="button" className="admin-primary" disabled={saving} onClick={saveDraft}><Save size={15} /> {saving ? "Übersetze …" : "Prüfen & veröffentlichen"}</button>}</div>
        </footer>
      </section>
    );
  }

  return (
    <section className="admin-card content-studio-list">
      <div className="admin-table-toolbar content-toolbar">
        <div><h2>Lerninhalte</h2><p>Standardinhalte anpassen oder eigene interaktive Lektionen bauen</p></div>
        <button className="admin-primary" type="button" onClick={openNew}><Plus size={16} /> Neuer Lerninhalt</button>
      </div>
      <div className="content-filters">
        <label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Lerninhalt suchen …" /></label>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="all">Alle Rollen</option>{ROLES.map((role) => <option key={role.id} value={role.id}>{t(role.name, "de")}</option>)}</select>
        <div className="content-legend"><span><i className="standard" /> Standard</span><span><i className="custom" /> Eigener Inhalt</span></div>
      </div>
      <div className="content-list-head"><span>Inhalt</span><span>Rolle</span><span>Typ</span><span>Sichtbarkeit im Lernen</span><span /></div>
      <div className="content-list">{rows.map((item) => <article key={item.id} className={!item.active ? "inactive" : ""}>
        <span className={`content-kind-icon ${item.kind}`}><BookOpen size={19} /></span>
        <div className="content-title"><strong>{item.displayTitle}</strong><small>{item.displayGoal}</small></div>
        <span className="content-role">{item.roleName}</span>
        <span className={`content-kind ${item.kind}`}>{item.kind === "standard" ? <><Copy size={13} /> Standard</> : <><Sparkles size={13} /> Eigener Inhalt</>}</span>
        <AdminToggle active={item.active} onClick={() => toggle(item)} label={`${item.displayTitle} ${item.active ? "deaktivieren" : "aktivieren"}`} />
        <button type="button" className="content-edit" onClick={() => openEdit(item)}>Bearbeiten <ChevronRight size={15} /></button>
      </article>)}</div>
      {rows.length === 0 && <div className="admin-empty">Keine passenden Lerninhalte gefunden.</div>}
    </section>
  );
}
