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
import { ROLES as LEARN_ROLES } from "./learn/tasks/index.js";
import * as learnStore from "./learn/store.js";
import * as LearningScenes from "./learn/scenes/index.js";
import SprachhilfeTab from "./sprachhilfe/SprachhilfeTab.jsx";
import { ROLES as LANGUAGE_ROLES } from "./sprachhilfe-inhalte/index.js";
import * as languageStore from "./sprachhilfe/store.js";
import quickHelpKnowledge from "./data/quickHelpKnowledge.json";
import { isSupportedImage, readImageFile } from "./imageAnalysis";
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
  openai: "WorkLingo AI",
  setup: "WorkLingo AI Setup",
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

const learningAnimations = {
  "bed-making": {
    title: "Bett beziehen",
    Scene: LearningScenes.BedScene,
    captions: [
      "Matratze prüfen",
      "Leintuch auflegen",
      "Ecken fest spannen",
      "Decke glatt ziehen",
      "Polster aufschütteln",
      "Kontrollblick"
    ],
    keywords: [
      "bett beziehen", "bett machen", "bettwaesche wechseln", "bettwasche wechseln",
      "bett neu beziehen", "bettdecke beziehen", "leintuch spannen", "making the bed",
      "make the bed", "change bed linen", "bed linen", "yatak yapmak", "nevresim",
      "carsafi", "posteľ", "postel", "posteljina", "ścielić"
    ]
  },
  "room-check": {
    title: "Zimmer kontrollieren",
    Scene: LearningScenes.RoomScene,
    captions: [
      "Tür und Überblick",
      "Bett und Nachttisch",
      "Fenster und Vorhänge",
      "Schrank und Spiegel",
      "Papierkorb und Minibar"
    ],
    keywords: [
      "zimmer kontrollieren", "zimmer checken", "zimmer pruefen", "zimmer prüfen",
      "zimmer reinigen", "reinige ich zimmer", "zimmer putzen", "abreisezimmer",
      "kontrollblick", "zimmer freigeben", "zimmer fertig", "room check", "inspect room",
      "check room", "minibar pruefen", "minibar prüfen", "unter dem bett", "hotelzimmer"
    ]
  },
  "bath-cleaning": {
    title: "Bad reinigen",
    Scene: LearningScenes.BathScene,
    captions: [
      "Spiegel reinigen",
      "Waschbecken reinigen",
      "Dusche prüfen",
      "WC zuletzt reinigen",
      "Kontrollblick"
    ],
    keywords: [
      "bad reinigen", "badezimmer reinigen", "wc reinigen", "toilette reinigen",
      "reinige ich das bad", "das bad reinigen", "bad putzen", "badezimmer putzen",
      "dusche reinigen", "waschbecken", "spiegel reinigen", "bathroom clean",
      "clean bathroom", "clean toilet", "duş", "banyo", "lavabo", "tuvalet"
    ]
  },
  "reception-checkin": {
    title: "Check-in an der Rezeption",
    Scene: LearningScenes.ReceptionScene,
    captions: [
      "Gast begrüßen",
      "Buchung im System suchen",
      "Daten prüfen",
      "Besonderheiten notieren",
      "Zimmerkarte ausgeben",
      "Übergabe sichern"
    ],
    keywords: [
      "check in", "check-in", "gast einchecken", "rezeption", "zimmerkarte",
      "checkin machen", "gast aufnehmen", "gast empfangen", "an der rezeption",
      "buchungssystem", "buchung suchen", "meldezettel", "ortstaxe", "reception",
      "front office", "alpinres", "guest checkin"
    ]
  },
  "breakfast-buffet": {
    title: "Frühstücksbuffet",
    Scene: LearningScenes.BuffetScene,
    captions: [
      "Niesschutz prüfen",
      "Temperatur messen",
      "Warmhalten sichern",
      "Kühlung kontrollieren",
      "Buffet freigeben"
    ],
    keywords: [
      "fruehstueck", "frühstück", "buffet", "fruehstuecksbuffet", "frühstücksbuffet",
      "buffet aufbauen", "fruehstueck aufbauen", "frühstück aufbauen",
      "kaffeemaschine", "glutenfrei", "laktosefrei", "breakfast", "buffet setup",
      "haccp", "temperatur messen", "milch kuehlen", "milch kühlen"
    ]
  },
  "lobby-cleaning": {
    title: "Lobby und Gang sichern",
    Scene: LearningScenes.LobbyScene,
    captions: [
      "Bereich prüfen",
      "Nasse Stelle erkennen",
      "Warnschild aufstellen",
      "Sicher fertig melden"
    ],
    keywords: [
      "lobby reinigen", "gang reinigen", "aufzug reinigen", "nasser boden",
      "lobby putzen", "gang putzen", "stiegenhaus reinigen", "boden nass",
      "warnschild", "stiegenhaus", "oeffentliche bereiche", "öffentliche bereiche",
      "public area", "wet floor", "corridor", "elevator", "glas tuer", "glastuer"
    ]
  }
};

function detectLearningAnimation(question = "") {
  const normalized = normalizeText(question);
  const match = Object.entries(learningAnimations).find(([, animation]) => (
    animation.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))
  ));
  return match?.[0];
}

function createOpenAiSetupMessage(language) {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    text: language === "en"
      ? "WorkLingo AI is not configured yet. Add OPENAI_API_KEY to the local .env file and restart the dev server."
      : language === "tr"
        ? "WorkLingo AI henüz yapılandırılmadı. Yerel .env dosyasına OPENAI_API_KEY ekle ve dev server'ı yeniden başlat."
        : "WorkLingo AI ist noch nicht konfiguriert. Trage OPENAI_API_KEY in die lokale .env ein und starte den Dev-Server neu.",
    steps: language === "en"
      ? ["Create or open .env", "Set OPENAI_API_KEY", "Restart npm run dev"]
      : language === "tr"
        ? [".env dosyasını aç veya oluştur", "OPENAI_API_KEY değerini ekle", "npm run dev komutunu yeniden başlat"]
        : [".env öffnen oder erstellen", "OPENAI_API_KEY eintragen", "npm run dev neu starten"],
    linkLabel: "WorkLingo AI Setup",
    source: "setup",
    time: "jetzt"
  };
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
    time: "jetzt",
    animation: detectLearningAnimation(localizedEntry.question)
  };
}

async function buildAnswerMessage({ question, attachment, language, history = [], requireAi = false }) {
  try {
    const response = await fetch("/api/quick-help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        attachment,
        language,
        history: history.map((message) => ({
          role: message.role,
          text: message.text
        }))
      })
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const error = new Error(errorPayload.error || `Quick Help API ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const result = await response.json();
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: result.answer,
      steps: result.steps ?? [],
      linkLabel: result.linkLabel,
      source: result.source ?? "openai",
      time: "jetzt",
      animation: detectLearningAnimation(question)
    };
  } catch (error) {
    if (requireAi) {
      return createOpenAiSetupMessage(language);
    }

    if (!attachment) {
      return createAssistantMessage(findQuickHelpAnswer(question), language);
    }

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: language === "en"
        ? "I cannot check the image with AI right now. Please take a photo and ask the housekeeper or reception on internal 100."
        : language === "tr"
          ? "Görseli şu anda KI ile kontrol edemiyorum. Lütfen fotoğraf çek ve kat şefine veya dahili 100'den resepsiyona sor."
          : "Ich kann das Bild gerade nicht per KI prüfen. Mach bitte ein Foto und frag die Hausdame oder die Rezeption intern 100.",
      steps: language === "en"
        ? ["Keep the photo", "Do not repair anything yourself", "Ask the housekeeper or call internal 100"]
        : language === "tr"
          ? ["Fotoğrafı sakla", "Kendin tamir etme", "Kat şefine sor veya dahili 100'ü ara"]
          : ["Foto behalten", "Nichts selbst reparieren", "Hausdame fragen oder intern 100 anrufen"],
      linkLabel: language === "en" ? "Report issue" : language === "tr" ? "Sorun bildir" : "Problem melden",
      source: "fallback",
      time: "jetzt",
      animation: detectLearningAnimation(question)
    };
  }
}

function createQuickHelpThread(question = "Neuer Chat") {
  return {
    id: crypto.randomUUID(),
    title: question.length > 48 ? `${question.slice(0, 45)}...` : question,
    updatedAt: "jetzt",
    messages: []
  };
}

function ChatLearningAnimation({ type }) {
  const animation = learningAnimations[type];
  const [frame, setFrame] = useState(0);
  const lastFrame = (animation?.captions.length ?? 1) - 1;

  useEffect(() => {
    if (!animation || lastFrame <= 0) return undefined;
    setFrame(0);
    const timer = window.setInterval(() => {
      setFrame((currentFrame) => (currentFrame >= lastFrame ? 0 : currentFrame + 1));
    }, 1400);
    return () => window.clearInterval(timer);
  }, [animation, lastFrame, type]);

  if (!animation) return null;

  const { Scene, captions, title } = animation;

  return (
    <div className="chat-learning-card">
      <div className="chat-learning-header">
        <span>Lernanimation</span>
        <strong>{title}</strong>
      </div>
      <div className="chat-learning-stage">
        <Scene frame={frame} />
      </div>
      <div className="chat-learning-caption">
        <span>Schritt {frame + 1} von {lastFrame + 1}</span>
        <strong>{captions[frame]}</strong>
      </div>
      <div className="chat-learning-dots">
        {captions.map((caption, index) => (
          <button
            type="button"
            aria-label={caption}
            className={index === frame ? "active" : ""}
            key={caption}
            onClick={() => setFrame(index)}
          />
        ))}
      </div>
    </div>
  );
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

function getLessonsFromRoles(roles) {
  return roles.flatMap((role) =>
    role.tasks || (role.units || role.modules || []).flatMap((unit) => unit.lessons || unit.modules || [])
  );
}

function dayKeyFromTimestamp(timestamp) {
  if (!timestamp) return null;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function collectActivity(lessonMap = {}, type) {
  return Object.values(lessonMap)
    .filter((lesson) => lesson?.lastDone)
    .map((lesson) => ({
      type,
      timestamp: lesson.lastDone,
      day: dayKeyFromTimestamp(lesson.lastDone),
      hour: new Date(lesson.lastDone).getHours(),
      count: Math.max(1, lesson.timesDone || 1)
    }))
    .filter((entry) => entry.day);
}

function countCompleted(lessonMap = {}) {
  return Object.values(lessonMap).filter((lesson) => lesson?.completed).length;
}

function countAttempts(lessonMap = {}) {
  return Object.values(lessonMap).reduce((sum, lesson) => sum + (lesson?.timesDone || 0), 0);
}

function countAnswersInRange(items = {}, since) {
  return Object.values(items).filter((item) => !since || (item?.lastReview && item.lastReview >= since)).length;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function createProgressSnapshot(range = "all", area = "all") {
  const learnState = learnStore.load();
  const languageState = languageStore.load();
  const learnLessons = getLessonsFromRoles(LEARN_ROLES);
  const languageLessons = getLessonsFromRoles(LANGUAGE_ROLES);
  const learnCompleted = countCompleted(learnState.lessons);
  const languageCompleted = countCompleted(languageState.lessons);
  const activities = [
    ...collectActivity(learnState.lessons, "Lernen"),
    ...collectActivity(languageState.lessons, "Sprachhilfe")
  ];
  const now = Date.now();
  const since = range === "all" ? null : now - Number(range) * 86400000;
  const rangeLabel = range === "all" ? "Alle" : range === "30" ? "30 Tage" : "7 Tage";
  const visibleActivities = activities.filter((entry) => {
    const inRange = !since || entry.timestamp >= since;
    const inArea = area === "all" || entry.type === area;
    return inRange && inArea;
  });
  const days = [...new Set(visibleActivities.map((entry) => entry.day))];
  const hours = visibleActivities.reduce((map, entry) => {
    map[entry.hour] = (map[entry.hour] || 0) + entry.count;
    return map;
  }, {});
  const peakHour = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0];
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const day = date.toISOString().slice(0, 10);
    const learning = visibleActivities
      .filter((entry) => entry.day === day && entry.type === "Lernen")
      .reduce((sum, entry) => sum + entry.count, 0);
    const language = visibleActivities
      .filter((entry) => entry.day === day && entry.type === "Sprachhilfe")
      .reduce((sum, entry) => sum + entry.count, 0);
    return {
      label: date.toLocaleDateString("de-AT", { weekday: "short" }),
      learning,
      language,
      total: learning + language
    };
  });
  const heatmapLength = range === "7" ? 49 : range === "30" ? 70 : 175;
  const heatmap = Array.from({ length: heatmapLength }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (heatmapLength - 1 - index));
    const day = date.toISOString().slice(0, 10);
    const value = visibleActivities
      .filter((entry) => entry.day === day)
      .reduce((sum, entry) => sum + entry.count, 0);
    return { day, value };
  });
  const totalCompleted = learnCompleted + languageCompleted;
  const totalLessons = learnLessons.length + languageLessons.length;
  const visibleLearnAttempts = area === "Sprachhilfe"
    ? 0
    : visibleActivities.filter((entry) => entry.type === "Lernen").reduce((sum, entry) => sum + entry.count, 0);
  const visibleLanguageAttempts = area === "Lernen"
    ? 0
    : visibleActivities.filter((entry) => entry.type === "Sprachhilfe").reduce((sum, entry) => sum + entry.count, 0);
  const totalAttempts = visibleLearnAttempts + visibleLanguageAttempts;
  const totalAnswers = (area === "Sprachhilfe" ? 0 : countAnswersInRange(learnState.items, since))
    + (area === "Lernen" ? 0 : countAnswersInRange(languageState.items, since));

  return {
    range,
    area,
    rangeLabel,
    totalCompleted,
    totalLessons,
    totalAttempts,
    totalAnswers,
    totalXp: (learnState.xp || 0) + (languageState.xp || 0),
    activeDays: days.length,
    streak: Math.max(learnState.streak?.count || 0, languageState.streak?.count || 0),
    peakHour: peakHour ? `${peakHour} Uhr` : "Noch offen",
    strongestArea: visibleLearnAttempts >= visibleLanguageAttempts ? "Lernen" : "Sprachhilfe",
    overallPercent: percent(totalCompleted, totalLessons),
    learning: {
      completed: learnCompleted,
      total: learnLessons.length,
      attempts: visibleLearnAttempts,
      xp: learnState.xp || 0,
      percent: percent(learnCompleted, learnLessons.length)
    },
    language: {
      completed: languageCompleted,
      total: languageLessons.length,
      attempts: visibleLanguageAttempts,
      xp: languageState.xp || 0,
      percent: percent(languageCompleted, languageLessons.length)
    },
    weekDays,
    heatmap
  };
}

function useProgressSnapshot(range, area) {
  const [snapshot, setSnapshot] = useState(() => createProgressSnapshot(range, area));

  useEffect(() => {
    const refresh = () => setSnapshot(createProgressSnapshot(range, area));
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [range, area]);

  return snapshot;
}

function ProgressDashboard() {
  const [range, setRange] = useState("all");
  const [area, setArea] = useState("all");
  const data = useProgressSnapshot(range, area);
  const maxWeek = Math.max(1, ...data.weekDays.map((day) => day.total));
  const areaTabs = [
    ["all", "Übersicht"],
    ["Lernen", "Lernen"],
    ["Sprachhilfe", "Sprachhilfe"]
  ];
  const rangeTabs = [
    ["all", "Alle"],
    ["30", "30T"],
    ["7", "7T"]
  ];

  return (
    <section className="progress-dashboard">
      <div className="progress-board">
        <div className="progress-board-top">
          <div className="progress-tabs" aria-label="Fortschritt Bereiche">
            {areaTabs.map(([id, label]) => (
              <button
                key={id}
                className={area === id ? "active" : ""}
                type="button"
                aria-pressed={area === id}
                onClick={() => setArea(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="progress-range" aria-label="Zeitraum">
            {rangeTabs.map(([id, label]) => (
              <button
                key={id}
                className={range === id ? "active" : ""}
                type="button"
                aria-pressed={range === id}
                onClick={() => setRange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="progress-stat-grid">
          <ProgressStat label="Übungen" value={data.totalAttempts} />
          <ProgressStat label="Antworten" value={data.totalAnswers} />
          <ProgressStat label="XP gesamt" value={data.totalXp} />
          <ProgressStat label="Aktive Tage" value={data.activeDays} />
          <ProgressStat label="Streak" value={`${data.streak} Tage`} />
          <ProgressStat label="Spitzenstunde" value={data.peakHour} />
        </div>

        <div className="activity-heatmap" aria-label={`Aktivität: ${data.rangeLabel}`}>
          {data.heatmap.map((cell) => (
            <span
              key={cell.day}
              className={`heat-cell level-${Math.min(4, cell.value)}`}
              title={`${cell.day}: ${cell.value} Übungen`}
            />
          ))}
        </div>

        <p className="progress-board-note">
          Zeitraum: {data.rangeLabel}. Du hast {data.totalCompleted} von {data.totalLessons} Lektionen abgeschlossen.
          Stärkster Bereich: {data.strongestArea}.
        </p>
      </div>

      <div className="progress-analytics-grid">
        <article className="progress-panel progress-panel-main">
          <div className="panel-heading-row">
            <div>
              <span>Gesamtfortschritt</span>
              <h2>{data.overallPercent}%</h2>
            </div>
            <Gauge size={28} />
          </div>
          <div className="large-progress-track">
            <span style={{ width: `${data.overallPercent}%` }} />
          </div>
          <div className="area-bars">
            <AreaProgress label="Lernen" done={data.learning.completed} total={data.learning.total} percent={data.learning.percent} />
            <AreaProgress
              label="Sprachhilfe"
              done={data.language.completed}
              total={data.language.total}
              percent={data.language.percent}
            />
          </div>
        </article>

        <article className="progress-panel">
          <div className="panel-heading-row compact">
            <div>
              <span>Letzte 7 Tage</span>
              <h2>Übungsrhythmus</h2>
            </div>
            <ChartNoAxesColumn size={26} />
          </div>
          <div className="weekly-chart">
            {data.weekDays.map((day) => (
              <div className="week-column" key={day.label}>
                <div className="week-stack">
                  <span className="week-language" style={{ height: `${(day.language / maxWeek) * 100}%` }} />
                  <span className="week-learning" style={{ height: `${(day.learning / maxWeek) * 100}%` }} />
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span><i className="legend-learning" /> Lernen</span>
            <span><i className="legend-language" /> Sprachhilfe</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function ProgressStat({ label, value }) {
  return (
    <div className="progress-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AreaProgress({ label, done, total, percent }) {
  return (
    <div className="area-progress">
      <div>
        <strong>{label}</strong>
        <span>
          {done}/{total} Lektionen
        </span>
      </div>
      <div className="area-track">
        <span style={{ width: `${percent}%` }} />
      </div>
      <b>{percent}%</b>
    </div>
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
            <span>WorkLingo AI prüft Problem und nächste Schritte</span>
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
      buildAnswerMessage({ question: trimmed, attachment: image, language: answerLanguage, history: messages }),
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
                  <ChatLearningAnimation type={message.animation} />
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
      buildAnswerMessage({
        question: trimmed,
        attachment: image,
        language: answerLanguage,
        history: messages,
        requireAi: true
      }),
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
                  <ChatLearningAnimation type={message.animation} />
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
            <p>Deine Übungen aus Lernen und Sprachhilfe auf einen Blick.</p>
          </div>
          <ProgressDashboard />
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
