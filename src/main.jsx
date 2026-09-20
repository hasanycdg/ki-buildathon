import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  BookOpen,
  Bot,
  Building2,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Flame,
  Gauge,
  Globe2,
  Home,
  Link as LinkIcon,
  Lock,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Plus,
  Play,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  X
} from "lucide-react";
import LearnTab from "./learn/LearnTab.jsx";
import SprachhilfeTab from "./sprachhilfe/SprachhilfeTab.jsx";
import quickHelpKnowledge from "./data/quickHelpKnowledge.json";
import { analyzeImage, isSupportedImage, readImageFile, visionEnabled } from "./imageAnalysis";
import "./styles.css";

const modules = [
  {
    image: "/assets/module-welcome.png",
    title: "1. Willkommen im Haus",
    text: "Hotel, Team und Wege kennenlernen",
    progress: 100,
    status: "done"
  },
  {
    image: "/assets/module-safety.png",
    title: "2. Zimmer & Hygiene",
    text: "Hausstandard Schritt für Schritt",
    progress: 60
  },
  {
    image: "/assets/module-machine.png",
    title: "3. Wäsche & Geräte",
    text: "Abläufe sicher bedienen",
    progress: 0,
    status: "play"
  },
  {
    image: "/assets/module-process.png",
    title: "4. Rezeption & Systeme",
    text: "Buchungen und Übergaben",
    progress: 0,
    status: "locked"
  },
  {
    image: "/assets/module-team.png",
    title: "5. Team & Gäste",
    text: "Sätze, Kontakte und Notfälle",
    progress: 0,
    status: "locked"
  }
];

const quickCards = [
  ["Dokumente", "Anleitungen, Formulare, Richtlinien", FileText],
  ["Team & Kontakte", "Wer ist wofür zuständig?", Users],
  ["Wichtige Links", "Interne Tools und Systeme", LinkIcon],
  ["Feedback geben", "Hilf uns, WorkLingo zu verbessern", MessageCircle]
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "lernen", label: "Lernen", icon: BookOpen },
  { id: "fortschritt", label: "Mein Fortschritt", icon: ChartNoAxesColumn },
  { id: "quickhelp", label: "Quick Help (KI-Chat)", icon: MessageCircle },
  { id: "sprachhilfe", label: "Sprachhilfe", icon: Globe2 },
  { id: "team", label: "Team & Kontakte", icon: Users }
];

const quickHelpPrompts = [
  "Wie reinige ich Zimmer 203?",
  "Was mache ich bei einer Gastbeschwerde?",
  "Wo finde ich die Wäschekammer?",
  "Wer ist heute an der Rezeption?"
];

const visualAnswerIds = new Set(["laundry-room", "guest-complaint", "reception-today"]);

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const languageSignals = {
  en: [
    "what", "where", "when", "who", "how", "which", "why", "room", "rooms", "clean", "cleaning",
    "laundry", "reception", "guest", "complaint", "sick", "break", "breakfast",
    "emergency", "damage", "lost", "card", "language", "german", "supervisor",
    "uniform", "towel", "towels", "cart", "shift", "handover", "i", "my", "the", "do", "does",
    "is", "are", "can", "should", "need", "help", "please", "with", "for", "and"
  ],
  // Türkisch ist agglutinierend: Stämme, die als Wortanfang matchen (ab 3 Zeichen).
  tr: [
    "nasıl", "nere", "zaman", "kim", "hangi", "kaç", "yapmal", "yapar", "yapay", "bulur",
    "temizl", "bildir", "verir", "işaret", "kullan", "istiyor", "alabilir", "talimat", "kendi",
    "oda", "çamaşır", "havlu", "nevresim", "misafir", "şikayet", "resepsiyon", "hasta", "mola",
    "kahvaltı", "anahtar", "acil", "kayıp", "eşya", "hasar", "vardiya", "kat", "şef",
    "dil", "türkçe", "almanca", "eğitim", "bilgi", "bilmiyorum", "anlamıyorum", "için", "benim",
    "lütfen", "ne", "bu", "var", "yok", "bir", "mi", "mı", "miyim", "mıyım"
  ]
};

const normalizedEnglishSignals = new Set(languageSignals.en.map(normalizeText));
const normalizedTurkishStems = languageSignals.tr.map(normalizeText);

const thinkingLabels = {
  de: "Antwort erstellen",
  en: "Creating answer",
  tr: "Cevap hazırlanıyor"
};

const imageThinkingLabels = {
  de: "Bild wird geprüft",
  en: "Checking image",
  tr: "Görsel kontrol ediliyor"
};

const answerSourceLabels = {
  vision: "KI-Bildanalyse",
  catalog: "Bekanntes Hausbeispiel",
  fallback: "Allgemeine Hausregel"
};

function thinkingLabel(mode, language) {
  const labels = mode === "image" ? imageThinkingLabels : thinkingLabels;
  return labels[language] ?? labels.de;
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function detectQuestionLanguage(question) {
  const tokens = normalizeText(question).split(" ").filter(Boolean);
  const matchesTurkish = (token) => normalizedTurkishStems.some(
    (stem) => token === stem || (stem.length >= 3 && token.startsWith(stem))
  );
  const turkishScore = tokens.filter(matchesTurkish).length;
  const englishScore = tokens.filter((token) => normalizedEnglishSignals.has(token)).length;

  if (turkishScore > 0 && turkishScore >= englishScore) return "tr";
  if (englishScore > 0) return "en";
  return "de";
}

function localizeEntry(entry, language) {
  const translated = entry.translations?.[language];
  if (!translated) return entry;

  return {
    ...entry,
    question: translated.question ?? entry.question,
    answer: translated.answer ?? entry.answer,
    steps: translated.steps ?? entry.steps,
    linkLabel: translated.linkLabel ?? entry.linkLabel
  };
}

function findQuickHelpAnswer(question) {
  const normalizedQuestion = normalizeText(question);
  const questionTokens = new Set(normalizedQuestion.split(" ").filter((token) => token.length > 2));

  const ranked = quickHelpKnowledge
    .map((entry) => {
      const normalizedEntryQuestion = normalizeText(entry.question);
      const normalizedKeywords = entry.keywords.map(normalizeText);
      let score = 0;

      if (normalizedEntryQuestion === normalizedQuestion) score += 120;
      if (normalizedEntryQuestion.includes(normalizedQuestion) || normalizedQuestion.includes(normalizedEntryQuestion)) {
        score += 45;
      }

      normalizedKeywords.forEach((keyword) => {
        if (normalizedQuestion.includes(keyword)) score += 24;
        keyword.split(" ").forEach((token) => {
          if (questionTokens.has(token)) score += 7;
        });
      });

      normalizedEntryQuestion.split(" ").forEach((token) => {
        if (token.length > 2 && questionTokens.has(token)) score += 4;
      });

      return { entry, score };
    })
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score > 11) return ranked[0].entry;

  return {
    id: "fallback",
    question,
    answer: "Dazu habe ich noch keine genaue Unternehmensantwort. Ich kann dir aber bei Zimmerreinigung, Wäschekammer, Rezeption, Gastbeschwerden, Krankmeldung, Fundsachen und Notfällen helfen.",
    steps: [
      "Formuliere die Frage mit einem konkreten Stichwort",
      "Oder wähle eine der vorgeschlagenen Fragen unten",
      "Bei dringenden Gästeanliegen: Rezeption intern 100"
    ],
    linkLabel: "Teamkontakte",
    translations: {
      en: {
        answer: "I do not have an exact company answer for that yet. I can help with room cleaning, laundry room, reception, guest complaints, sick leave, lost property, and emergencies.",
        steps: [
          "Ask with a concrete keyword",
          "Or choose one of the suggested questions",
          "For urgent guest issues: call reception on internal 100"
        ],
        linkLabel: "Team contacts"
      },
      tr: {
        answer: "Bunun için henüz kesin bir otel cevabım yok. Oda temizliği, çamaşırhane, resepsiyon, misafir şikayetleri, hastalık bildirimi, kayıp eşya ve acil durumlarda yardımcı olabilirim.",
        steps: [
          "Soruyu somut bir anahtar kelimeyle sor",
          "Ya da aşağıdaki önerilen sorulardan birini seç",
          "Acil misafir konularında: dahili 100'ü ara"
        ],
        linkLabel: "Ekip iletişim listesi"
      }
    }
  };
}

function createUserMessage(text, attachment) {
  return {
    id: crypto.randomUUID(),
    role: "user",
    text,
    attachment,
    time: "jetzt"
  };
}

function createAssistantMessage(entry, language) {
  const localizedEntry = localizeEntry(entry, language);
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: localizedEntry.answer,
    steps: localizedEntry.steps ?? [],
    linkLabel: localizedEntry.linkLabel,
    image: visualAnswerIds.has(localizedEntry.id) ? localizedEntry.image : undefined,
    time: "jetzt"
  };
}

async function buildAnswerMessage({ question, attachment, language }) {
  if (!attachment) {
    return createAssistantMessage(findQuickHelpAnswer(question), language);
  }

  const result = await analyzeImage({
    dataUrl: attachment.dataUrl,
    fileName: attachment.name,
    language,
    question
  });

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: result.answer,
    steps: result.steps ?? [],
    linkLabel: result.linkLabel,
    source: result.source,
    time: "jetzt"
  };
}

function createQuickHelpThread(question = "Neuer Chat") {
  return {
    id: crypto.randomUUID(),
    title: question.length > 48 ? `${question.slice(0, 45)}...` : question,
    updatedAt: "jetzt",
    messages: []
  };
}

function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">W</div>
        <div>
          <strong>WorkLingo</strong>
          <span>Learn. Work. Belong.</span>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            className={activeTab === id ? "nav-item active" : "nav-item"}
            type="button"
            onClick={() => onTabChange(id)}
            key={id}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="nav-divider" />

      <nav className="nav-list">
        <a className="nav-item" href="#">
          <Building2 size={20} />
          <span>Unternehmen</span>
        </a>
        <a className="nav-item" href="#">
          <Settings size={20} />
          <span>Einstellungen</span>
        </a>
      </nav>

      <div className="company">
        <div className="company-icon">
          <Building2 size={24} />
        </div>
        <div>
          <strong>Hotel Alpenblick</strong>
          <span>Wissen bleibt im Haus.</span>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <label className="search">
        <Search size={18} />
        <input placeholder="Frage etwas oder suche nach einem Thema ..." />
        <kbd>⌘ K</kbd>
      </label>
      <div className="top-actions">
        <button className="language">
          <Globe2 size={18} />
          Deutsch
          <ChevronDown size={14} />
        </button>
        <button className="icon-button notify" aria-label="Benachrichtigungen">
          <Bell size={20} />
        </button>
        <div className="profile">
          <div className="avatar">MY</div>
          <div>
            <strong>Maria Yılmaz</strong>
            <span>Housekeeping</span>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>
          Willkommen bei <br />
          Hotel Alpenblick, <span>Maria!</span>
        </h1>
        <p>Lerne Zimmerstandards, Rezeption und Teamwege. In deiner Sprache. Schritt für Schritt.</p>
        <div className="hero-actions">
          <button className="primary-btn">
            Weiter lernen
            <span>→</span>
          </button>
          <button className="secondary-btn">
            <Play size={17} />
            Hausstandard anschauen
          </button>
        </div>
      </div>
      <div className="hero-media">
        <img src="/assets/hero-worker.png" alt="" />
      </div>
    </section>
  );
}

function ProgressSummary() {
  return (
    <section className="summary-grid">
      <div className="progress-card">
        <div className="card-title">Dein Onboarding-Fortschritt</div>
        <div className="progress-row">
          <div className="progress-track">
            <span style={{ width: "27%" }} />
          </div>
          <strong>25%</strong>
        </div>
        <p>3 von 12 Modulen abgeschlossen</p>
      </div>
      <Metric icon={<Flame size={22} />} value="7" label="Tage in Folge" tone="orange" />
      <Metric icon={<Star size={22} />} value="120" label="XP Punkte" tone="gold" />
      <Metric icon={<Trophy size={22} />} value="2" label="Abzeichen" tone="orange" />
    </section>
  );
}

function Metric({ icon, value, label, tone }) {
  return (
    <div className={`metric ${tone}`}>
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function LearningModules() {
  return (
    <section className="modules-section">
      <div className="section-heading">
        <h2>Deine Lernmodule</h2>
        <a href="#">
          Alle Module anzeigen
          <span>→</span>
        </a>
      </div>
      <div className="module-grid">
        {modules.map((item) => (
          <article className="module-card" key={item.title}>
            <div className="module-image">
              <img src={item.image} alt="" />
              {item.status === "done" && (
                <span className="state done">
                  <Check size={20} />
                </span>
              )}
              {item.status === "play" && (
                <span className="state play">
                  <Play size={18} fill="currentColor" />
                </span>
              )}
              {item.status === "locked" && (
                <span className="state locked">
                  <Lock size={17} />
                </span>
              )}
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <div className="module-progress">
              <div>
                <span style={{ width: `${item.progress}%` }} />
              </div>
              <strong>{item.progress}%</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function QuickAccess() {
  return (
    <section className="quick-section">
      <h2>Schnellzugriff</h2>
      <div className="quick-grid">
        {quickCards.map(([title, text, Icon]) => (
          <a className="quick-card" href="#" key={title}>
            <div className="quick-icon">
              <Icon size={24} />
            </div>
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Encouragement() {
  return (
    <section className="encouragement">
      <div className="plant">
        <Sparkles size={36} />
      </div>
      <div>
        <h3>Kleine Schritte. Große Fortschritte.</h3>
        <p>Du machst das großartig! Lerne weiter und werde Teil des Teams.</p>
      </div>
      <button className="secondary-btn">
        Mein Fortschritt
        <span>→</span>
      </button>
    </section>
  );
}

function ChatComposer({ className = "", question, setQuestion, attachment, setAttachment, isThinking, onSubmit }) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  async function acceptFile(file) {
    if (!file) return;
    if (!isSupportedImage(file)) {
      setUploadError("Nur Bilddateien bis 12 MB.");
      return;
    }
    setUploadError("");
    setAttachment(await readImageFile(file));
  }

  function handleDrop(event) {
    event.preventDefault();
    acceptFile(event.dataTransfer.files?.[0]);
  }

  function handlePaste(event) {
    const file = [...event.clipboardData.files][0];
    if (file) acceptFile(file);
  }

  return (
    <div className="composer">
      {attachment && (
        <div className="attachment-chip">
          <img src={attachment.dataUrl} alt="" />
          <div>
            <strong>{attachment.name}</strong>
            <span>{visionEnabled ? "Wird per KI-Bildanalyse geprüft" : "Wird mit dem Hauswissen abgeglichen"}</span>
          </div>
          <button type="button" aria-label="Anhang entfernen" onClick={() => setAttachment(null)}>
            <X size={16} />
          </button>
        </div>
      )}
      {uploadError && <p className="attachment-error">{uploadError}</p>}
      <form
        className={className ? `chat-input ${className}` : "chat-input"}
        onSubmit={onSubmit}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onPaste={handlePaste}
      >
        <input
          placeholder={attachment ? "Frage zum Bild (optional) ..." : "Stelle eine Frage oder hänge ein Foto an ..."}
          value={question}
          disabled={isThinking}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={(event) => {
            acceptFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className="attach-btn"
          aria-label="Bild anhängen"
          disabled={isThinking}
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={20} />
        </button>
        <button type="submit" aria-label="Senden" disabled={isThinking}>
          <Send size={20} fill="currentColor" />
        </button>
      </form>
    </div>
  );
}

function ChatPanel({ mode = "side", messages, setMessages, onOpenLanguageHelp }) {
  const [question, setQuestion] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLanguage, setThinkingLanguage] = useState("de");
  const [thinkingMode, setThinkingMode] = useState("text");
  const conversationRef = useRef(null);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  async function askQuickHelp(rawQuestion) {
    const trimmed = rawQuestion.trim();
    if ((!trimmed && !attachment) || isThinking) return;

    const answerLanguage = detectQuestionLanguage(trimmed);
    const image = attachment;

    setThinkingLanguage(answerLanguage);
    setThinkingMode(image ? "image" : "text");
    setMessages((currentMessages) => [...currentMessages, createUserMessage(trimmed, image)]);
    setQuestion("");
    setAttachment(null);
    setIsThinking(true);

    const [answerMessage] = await Promise.all([
      buildAnswerMessage({ question: trimmed, attachment: image, language: answerLanguage }),
      wait(image ? 0 : 900)
    ]);

    setMessages((currentMessages) => [...currentMessages, answerMessage]);
    setIsThinking(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    askQuickHelp(question);
  }

  return (
    <aside className={mode === "wide" ? "rightbar quickhelp-wide" : "rightbar"}>
      <section className="chat-card">
        <div className="chat-header">
          <div className="bot-avatar">
            <Bot size={25} />
          </div>
          <div>
            <h2>KI-Quick Help</h2>
            <span><i /> Online</span>
          </div>
          <button className="ghost-icon" aria-label="Mehr">
            <MoreVertical size={20} />
          </button>
        </div>
        <p className="chat-intro">Frage alles rund um Zimmerstandards, Rezeption, Gäste oder deine Aufgaben.</p>
        <div className="conversation" ref={conversationRef}>
          {messages.length === 0 && !isThinking && (
            <div className="empty-chat">
              <Bot size={22} />
              <strong>Stelle deine erste Frage.</strong>
              <span>Quick Help antwortet mit gespeicherten Unternehmensstandards aus eurem MVP-Katalog.</span>
              <div className="empty-question-list">
                {quickHelpPrompts.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => askQuickHelp(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => (
            message.role === "user" ? (
              <div className="message outgoing" key={message.id}>
                {message.attachment && (
                  <img className="message-image" src={message.attachment.dataUrl} alt={message.attachment.name} />
                )}
                {message.text || <span className="message-muted">Foto gesendet</span>}
                <time>{message.time}</time>
              </div>
            ) : (
              <div className="answer-row" key={message.id}>
                <div className="mini-bot">
                  <Bot size={18} />
                </div>
                <div className="message incoming">
                  {message.source && (
                    <span className={`answer-source ${message.source}`}>{answerSourceLabels[message.source]}</span>
                  )}
                  <p>{message.text}</p>
                  {message.steps?.length > 0 && (
                    <ol className="answer-steps">
                      {message.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {message.image && (
                    <img className="answer-image" src={message.image} alt="" />
                  )}
                  {message.linkLabel && (
                    <a className="document-link" href="#">
                      <FileText size={18} />
                      {message.linkLabel}
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <time>{message.time}</time>
                </div>
              </div>
            )
          ))}
          {isThinking && (
            <div className="answer-row thinking-row">
              <div className="mini-bot">
                <Bot size={18} />
              </div>
              <div className="message incoming thinking-message">
                <span>{thinkingLabel(thinkingMode, thinkingLanguage)}</span>
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
        </div>
        {mode !== "wide" && (
          <div className="prompt-list">
            {quickHelpPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => askQuickHelp(prompt)} disabled={isThinking}>{prompt}</button>
            ))}
          </div>
        )}
        <ChatComposer
          question={question}
          setQuestion={setQuestion}
          attachment={attachment}
          setAttachment={setAttachment}
          isThinking={isThinking}
          onSubmit={handleSubmit}
        />
        <div className="chat-footer">
          <span>Antworten basieren auf internen Unternehmensdaten.</span>
          <button type="button" onClick={onOpenLanguageHelp}>
            Zur Sprachhilfe
            <span>→</span>
          </button>
        </div>
      </section>

      {mode !== "wide" && (
        <section className="language-card">
          <div className="translate-icon">
            <Globe2 size={28} />
          </div>
          <div className="language-copy">
            <h3>Sprachhilfe</h3>
            <p>Bereich ist vorbereitet und aktuell ohne Einträge.</p>
            <button className="secondary-btn" onClick={onOpenLanguageHelp}>
              Zu den Sprachübungen
              <span>→</span>
            </button>
          </div>
        </section>
      )}
    </aside>
  );
}

function QuickHelpWorkspace({ threads, setThreads, activeThreadId, setActiveThreadId, onOpenLanguageHelp }) {
  const [question, setQuestion] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingLanguage, setThinkingLanguage] = useState("de");
  const [thinkingMode, setThinkingMode] = useState("text");
  const conversationRef = useRef(null);
  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const messages = activeThread?.messages ?? [];

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  function updateThread(threadId, updater) {
    setThreads((currentThreads) => currentThreads.map((thread) => (
      thread.id === threadId ? updater(thread) : thread
    )));
  }

  function startNewChat() {
    setQuestion("");
    setAttachment(null);
    setActiveThreadId(null);
  }

  async function askQuickHelp(rawQuestion) {
    const trimmed = rawQuestion.trim();
    if ((!trimmed && !attachment) || isThinking) return;

    const image = attachment;
    const answerLanguage = detectQuestionLanguage(trimmed);
    const userMessage = createUserMessage(trimmed, image);
    const targetThreadId = activeThread?.id ?? crypto.randomUUID();
    const threadTitle = trimmed || (image ? `Foto: ${image.name}` : "Neuer Chat");

    setThinkingLanguage(answerLanguage);
    setThinkingMode(image ? "image" : "text");
    setQuestion("");
    setAttachment(null);
    setIsThinking(true);

    if (activeThread) {
      updateThread(targetThreadId, (thread) => ({
        ...thread,
        updatedAt: "jetzt",
        messages: [...thread.messages, userMessage]
      }));
    } else {
      setThreads((currentThreads) => [
        {
          ...createQuickHelpThread(threadTitle),
          id: targetThreadId,
          messages: [userMessage]
        },
        ...currentThreads
      ]);
      setActiveThreadId(targetThreadId);
    }

    const [answerMessage] = await Promise.all([
      buildAnswerMessage({ question: trimmed, attachment: image, language: answerLanguage }),
      wait(image ? 0 : 900)
    ]);

    updateThread(targetThreadId, (thread) => ({
      ...thread,
      updatedAt: "jetzt",
      messages: [...thread.messages, answerMessage]
    }));
    setIsThinking(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    askQuickHelp(question);
  }

  return (
    <section className="quickhelp-workspace">
      <aside className="chat-history-panel">
        <div className="history-header">
          <div>
            <span>Verlauf</span>
            <strong>Alte Chats</strong>
          </div>
          <button type="button" aria-label="Neuer Chat" onClick={startNewChat}>
            <Plus size={17} />
          </button>
        </div>
        <div className="history-list">
          {threads.length === 0 && (
            <div className="history-empty">
              <MessageCircle size={18} />
              <span>Noch keine Chats in dieser Session.</span>
            </div>
          )}
          {threads.map((thread) => {
            const lastAssistant = [...thread.messages].reverse().find((message) => message.role === "assistant");
            return (
              <button
                type="button"
                className={thread.id === activeThreadId ? "history-item active" : "history-item"}
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
              >
                <MessageCircle size={17} />
                <span>
                  <strong>{thread.title}</strong>
                  <small>{lastAssistant?.text ?? "Antwort wird vorbereitet"}</small>
                </span>
                <time>{thread.updatedAt}</time>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="chat-page-panel">
        <div className="chat-page-header">
          <div className="bot-avatar">
            <Bot size={24} />
          </div>
          <div>
            <h2>{activeThread?.title ?? "KI-Quick Help"}</h2>
            <span><i /> Online · Unternehmenswissen</span>
          </div>
          <button className="ghost-icon" aria-label="Mehr">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="conversation fullpage-conversation" ref={conversationRef}>
          {messages.length === 0 && !isThinking && (
            <div className="empty-chat fullpage-empty-chat">
              <Bot size={24} />
              <strong>Wähle eine Frage oder starte einen neuen Chat.</strong>
              <span>Deine Chats erscheinen links im Verlauf und können jederzeit wieder geöffnet werden.</span>
              <div className="empty-question-list">
                {quickHelpPrompts.map((prompt) => (
                  <button type="button" key={prompt} onClick={() => askQuickHelp(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((message) => (
            message.role === "user" ? (
              <div className="message outgoing" key={message.id}>
                {message.attachment && (
                  <img className="message-image" src={message.attachment.dataUrl} alt={message.attachment.name} />
                )}
                {message.text || <span className="message-muted">Foto gesendet</span>}
                <time>{message.time}</time>
              </div>
            ) : (
              <div className="answer-row" key={message.id}>
                <div className="mini-bot">
                  <Bot size={18} />
                </div>
                <div className="message incoming">
                  {message.source && (
                    <span className={`answer-source ${message.source}`}>{answerSourceLabels[message.source]}</span>
                  )}
                  <p>{message.text}</p>
                  {message.steps?.length > 0 && (
                    <ol className="answer-steps">
                      {message.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {message.image && (
                    <img className="answer-image" src={message.image} alt="" />
                  )}
                  {message.linkLabel && (
                    <a className="document-link" href="#">
                      <FileText size={18} />
                      {message.linkLabel}
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <time>{message.time}</time>
                </div>
              </div>
            )
          ))}
          {isThinking && (
            <div className="answer-row thinking-row">
              <div className="mini-bot">
                <Bot size={18} />
              </div>
              <div className="message incoming thinking-message">
                <span>{thinkingLabel(thinkingMode, thinkingLanguage)}</span>
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
        </div>

        <ChatComposer
          className="fullpage-chat-input"
          question={question}
          setQuestion={setQuestion}
          attachment={attachment}
          setAttachment={setAttachment}
          isThinking={isThinking}
          onSubmit={handleSubmit}
        />
        <div className="chat-footer fullpage-chat-footer">
          <span>Antworten basieren auf internen Unternehmensdaten.</span>
          <button type="button" onClick={onOpenLanguageHelp}>
            Zur Sprachhilfe
            <span>→</span>
          </button>
        </div>
      </section>
    </section>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [quickHelpMessages, setQuickHelpMessages] = useState([]);
  const [quickHelpThreads, setQuickHelpThreads] = useState([]);
  const [activeQuickHelpThreadId, setActiveQuickHelpThreadId] = useState(null);

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main">
        <Topbar />
        <TabContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          quickHelpMessages={quickHelpMessages}
          setQuickHelpMessages={setQuickHelpMessages}
          quickHelpThreads={quickHelpThreads}
          setQuickHelpThreads={setQuickHelpThreads}
          activeQuickHelpThreadId={activeQuickHelpThreadId}
          setActiveQuickHelpThreadId={setActiveQuickHelpThreadId}
        />
      </main>
    </div>
  );
}

function TabContent({
  activeTab,
  setActiveTab,
  quickHelpMessages,
  setQuickHelpMessages,
  quickHelpThreads,
  setQuickHelpThreads,
  activeQuickHelpThreadId,
  setActiveQuickHelpThreadId
}) {
  if (activeTab === "quickhelp") {
    return (
      <div className="content-grid tab-grid quickhelp-tab-grid">
        <section className="tab-page quickhelp-page">
          <div className="tab-heading">
            <h1>Quick Help</h1>
            <p>30 gespeicherte Unternehmensantworten für Zimmer, Wäsche, Rezeption, Gäste und Notfälle.</p>
          </div>
          <QuickHelpWorkspace
            threads={quickHelpThreads}
            setThreads={setQuickHelpThreads}
            activeThreadId={activeQuickHelpThreadId}
            setActiveThreadId={setActiveQuickHelpThreadId}
            onOpenLanguageHelp={() => setActiveTab("sprachhilfe")}
          />
        </section>
      </div>
    );
  }

  if (activeTab === "lernen") {
    return <LearnTab />;
  }

  if (activeTab === "fortschritt") {
    return (
      <div className="content-grid tab-grid">
        <section className="tab-page">
          <div className="tab-heading">
            <h1>Mein Fortschritt</h1>
            <p>Dein aktueller Stand im Onboarding und die nächsten Schritte.</p>
          </div>
          <ProgressSummary />
          <Encouragement />
        </section>
      </div>
    );
  }

  if (activeTab === "sprachhilfe") {
    return <SprachhilfeTab />;
  }

  if (activeTab === "team") {
    return (
      <div className="content-grid tab-grid">
        <section className="tab-page">
          <div className="tab-heading">
            <h1>Team & Kontakte</h1>
            <p>Die wichtigsten Ansprechpartner:innen für deine Schicht.</p>
          </div>
          <div className="team-grid">
            {[
              ["Anna Berger", "Hausdame", "Housekeeping, Zimmerstandards, Wäsche"],
              ["Lena Maier", "Rezeption Frühdienst", "Gästeanliegen, Zimmerstatus, Fundsachen"],
              ["Markus Hofer", "Rezeption Spätdienst", "Buchungssystem, Late Check-out, Notfälle"]
            ].map(([name, role, details]) => (
              <article className="team-card" key={name}>
                <div className="avatar">{name.split(" ").map((part) => part[0]).join("")}</div>
                <div>
                  <strong>{name}</strong>
                  <span>{role}</span>
                  <p>{details}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="content-grid">
      <div className="dashboard">
        <Hero />
        <ProgressSummary />
        <LearningModules />
        <QuickAccess />
        <Encouragement />
      </div>
      <ChatPanel
        messages={quickHelpMessages}
        setMessages={setQuickHelpMessages}
        onOpenLanguageHelp={() => setActiveTab("sprachhilfe")}
      />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
