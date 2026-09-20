import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BedDouble,
  BookOpen,
  BookOpenCheck,
  Bot,
  Building2,
  ConciergeBell,
  ChartNoAxesColumn,
  Check,
  ChevronRight,
  ChevronDown,
  CircleAlert,
  CircleCheckBig,
  ClipboardCheck,
  Clock3,
  Download,
  Flame,
  Gauge,
  Globe2,
  Home,
  LayoutDashboard,
  Lock,
  Monitor,
  MessageCircle,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Plus,
  Play,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  SprayCan,
  Star,
  Sun,
  Trophy,
  UserPlus,
  UserRoundCheck,
  Users,
  UtensilsCrossed,
  X
} from "lucide-react";
import LearnTab from "./learn/LearnTab.jsx";
import AdminContentStudio from "./admin/AdminContentStudio.jsx";
import { loadContentState } from "./admin/contentStore.js";
import { LEARNING_ASSETS } from "./admin/assetLibrary.js";
import { ROLES as LEARN_ROLES } from "./learn/tasks/index.js";
import * as learnStore from "./learn/store.js";
import * as LearningScenes from "./learn/scenes/index.js";
import SprachhilfeTab from "./sprachhilfe/SprachhilfeTab.jsx";
import { ROLES as LANGUAGE_ROLES } from "./sprachhilfe-inhalte/index.js";
import * as languageStore from "./sprachhilfe/store.js";
import { countWordsOfRole, WORD_LANGS } from "./sprachhilfe/vokabular.js";
import quickHelpKnowledge from "./data/quickHelpKnowledge.json";
import { isSupportedImage, readImageFile } from "./imageAnalysis";
import { APP_LANGUAGE_EVENT, APP_LANGUAGES, AppLanguageContext, appText, contentLanguage } from "./appLanguage.js";
import "./styles.css";

/* Bild je Bereich. Die vier Bereiche kommen aus den Lerninhalten selbst
   (src/learn/tasks/index.js) — hier steht nur, welches Foto dazugehoert. */
const roleImages = {
  housekeeping: "/assets/module-safety.png",
  reception: "/assets/module-process.png",
  breakfast: "/assets/module-team.png",
  cleaning: "/assets/module-welcome.png"
};

const roleIcons = { BedDouble, ConciergeBell, UtensilsCrossed, SprayCan };

/* Umfang der Inhalte — aus den Daten gezaehlt, nicht geschaetzt. */
const contentStats = {
  tasks: LEARN_ROLES.reduce((sum, role) => sum + role.tasks.length, 0),
  lessons: getLessonsFromRoles(LANGUAGE_ROLES).length,
  words: LANGUAGE_ROLES.reduce((sum, role) => sum + countWordsOfRole(role.id), 0),
  languages: WORD_LANGS.length + 1,
  answers: quickHelpKnowledge.length
};

const navItems = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: Home },
  { id: "lernen", labelKey: "nav.learn", icon: BookOpen },
  { id: "fortschritt", labelKey: "nav.progress", icon: ChartNoAxesColumn },
  { id: "quickhelp", labelKey: "nav.help", icon: MessageCircle },
  { id: "sprachhilfe", labelKey: "nav.language", icon: Globe2 },
  { id: "team", labelKey: "nav.team", icon: Users }
];

/* Alle vier Vorschlaege treffen einen Eintrag in quickHelpKnowledge.json. */
const quickHelpPrompts = [
  "Wie reinige ich Zimmer 203?",
  "Wie funktioniert das alte Buchungssystem?",
  "Was mache ich bei einer Gastbeschwerde?",
  "Wo finde ich die Wäschekammer?"
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

function Sidebar({ activeTab, onTabChange, language }) {
  const t = (key) => appText(language, key);
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
        {navItems.map(({ id, labelKey, icon: Icon }) => (
          <button
            className={activeTab === id ? "nav-item active" : "nav-item"}
            type="button"
            onClick={() => onTabChange(id)}
            key={id}
          >
            <Icon size={20} />
            <span>{t(labelKey)}</span>
          </button>
        ))}
      </nav>

      <div className="nav-divider" />

      <nav className="nav-list">
        <button className={activeTab === "unternehmen" ? "nav-item active" : "nav-item"}
          type="button" onClick={() => onTabChange("unternehmen")}>
          <Building2 size={20} />
          <span>{t("nav.company")}</span>
        </button>
        <button className={activeTab === "settings" ? "nav-item active" : "nav-item"}
          type="button" onClick={() => onTabChange("settings")}>
          <Settings size={20} />
          <span>{t("nav.settings")}</span>
        </button>
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

const adminEmployees = [
  { name: "Maria Yılmaz", initials: "MY", role: "Housekeeping", language: "Türkisch", progress: 72, status: "Aktiv", last: "Heute, 09:14" },
  { name: "Ivana Kovač", initials: "IK", role: "Housekeeping", language: "Kroatisch", progress: 88, status: "Aktiv", last: "Heute, 07:52" },
  { name: "Piotr Nowak", initials: "PN", role: "Frühstück", language: "Polnisch", progress: 46, status: "Aktiv", last: "Gestern, 18:20" },
  { name: "Amir Hadžić", initials: "AH", role: "Rezeption", language: "Bosnisch", progress: 31, status: "Einladung offen", last: "Noch nie" },
  { name: "Sofia Petrova", initials: "SP", role: "Reinigung", language: "Bulgarisch", progress: 100, status: "Abgeschlossen", last: "18. Sep., 16:05" }
];

function AdminPanel() {
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  const employees = adminEmployees.filter((item) =>
    `${item.name} ${item.role} ${item.language}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="admin-page">
      {notice && <div className="admin-toast"><CircleCheckBig size={18} />{notice}</div>}
      <header className="admin-hero">
        <div>
          <span className="admin-eyebrow"><ShieldCheck size={14} /> Admin-Bereich · Vorschau</span>
          <h1>Hotel Alpenblick verwalten</h1>
          <p>Mitarbeitende, Lerninhalte und Onboarding-Fortschritt an einem Ort.</p>
        </div>
        <div className="admin-hero-actions">
          <button className="admin-secondary" type="button" onClick={() => notify("Bericht wurde für den Export vorbereitet.")}>
            <Download size={17} /> Bericht exportieren
          </button>
          <button className="admin-primary" type="button" onClick={() => notify("Einladungsdialog ist im Prototyp vorgemerkt.")}>
            <UserPlus size={17} /> Mitarbeitende einladen
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Unternehmensbereiche">
        {[
          ["overview", "Übersicht", LayoutDashboard],
          ["people", "Mitarbeitende", Users],
          ["content", "Lerninhalte", BookOpenCheck]
        ].map(([id, label, Icon]) => (
          <button key={id} type="button" className={section === id ? "active" : ""} onClick={() => setSection(id)}>
            <Icon size={17} /> {label}
          </button>
        ))}
      </nav>

      {section === "overview" && (
        <>
          <section className="admin-metrics">
            {[
              [Users, "24", "Mitarbeitende", "+3 diesen Monat", "blue"],
              [UserRoundCheck, "79%", "Onboarding-Quote", "+8% seit August", "green"],
              [BookOpenCheck, "12", "Aktive Lerninhalte", "4 Rollen abgedeckt", "violet"],
              [CircleAlert, "3", "Brauchen Aufmerksamkeit", "2 überfällig", "orange"]
            ].map(([Icon, value, label, detail, tone]) => (
              <article className={`admin-metric ${tone}`} key={label}>
                <span><Icon size={20} /></span>
                <div><b>{value}</b><strong>{label}</strong><small>{detail}</small></div>
              </article>
            ))}
          </section>

          <section className="admin-overview-grid">
            <article className="admin-card admin-rollout">
              <div className="admin-card-head">
                <div><h2>Onboarding nach Bereich</h2><p>Fortschritt der aktuell zugewiesenen Lernpfade</p></div>
                <button type="button" onClick={() => setSection("people")}>Alle ansehen <ChevronRight size={15} /></button>
              </div>
              <div className="admin-bars">
                {[
                  ["Housekeeping", 12, 86, "#2468f2"],
                  ["Rezeption", 5, 71, "#8b5cf6"],
                  ["Frühstück & Buffet", 4, 64, "#f59e0b"],
                  ["Öffentliche Bereiche", 3, 48, "#18a78b"]
                ].map(([label, people, pct, color]) => (
                  <div className="admin-bar-row" key={label}>
                    <div><strong>{label}</strong><span>{people} Mitarbeitende</span></div>
                    <div className="admin-bar-track"><span style={{ width: `${pct}%`, background: color }} /></div>
                    <b>{pct}%</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-card admin-attention">
              <div className="admin-card-head"><div><h2>Aufmerksamkeit nötig</h2><p>Automatisch erkannte nächste Schritte</p></div></div>
              <div className="admin-alert-list">
                <button type="button" onClick={() => setSection("people")}>
                  <span className="warn"><Clock3 size={17} /></span><div><strong>2 Einladungen laufen bald ab</strong><small>Amir und Elena haben noch nicht gestartet.</small></div><ChevronRight size={16} />
                </button>
                <button type="button" onClick={() => setSection("content")}>
                  <span className="info"><ClipboardCheck size={17} /></span><div><strong>1 Inhalt wartet auf Freigabe</strong><small>Sicherheit im Nachtdienst · Entwurf</small></div><ChevronRight size={16} />
                </button>
                <button type="button" onClick={() => notify("Erinnerung für die Wiederholung vorbereitet.")}>
                  <span className="danger"><CircleAlert size={17} /></span><div><strong>4 Wiederholungen überfällig</strong><small>Vor allem im Bereich Reinigung.</small></div><ChevronRight size={16} />
                </button>
              </div>
            </article>
          </section>

          <section className="admin-card admin-activity">
            <div className="admin-card-head"><div><h2>Letzte Aktivitäten</h2><p>Was sich im Unternehmen zuletzt getan hat</p></div><span className="admin-live"><i /> Live</span></div>
            <div className="admin-activity-list">
              {[
                ["MY", "Maria Yılmaz", "hat „Bett beziehen“ mit 5 Sternen abgeschlossen.", "vor 12 Min."],
                ["AB", "Anna Berger", "hat den Inhalt „Zimmerkontrolle“ aktualisiert.", "vor 46 Min."],
                ["PN", "Piotr Nowak", "hat seinen Lernpfad „Frühstück“ begonnen.", "vor 2 Std."],
                ["LM", "Lena Maier", "hat Amir zur Rolle Rezeption eingeladen.", "gestern"]
              ].map(([initials, name, action, time]) => (
                <div key={name + time}><span className="admin-avatar">{initials}</span><p><strong>{name}</strong> {action}</p><time>{time}</time></div>
              ))}
            </div>
          </section>
        </>
      )}

      {section === "people" && (
        <section className="admin-card admin-table-card">
          <div className="admin-table-toolbar">
            <div><h2>Mitarbeitende</h2><p>24 Personen · 4 Bereiche · 7 Sprachen</p></div>
            <label><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, Rolle oder Sprache …" /></label>
          </div>
          <div className="admin-table-wrap"><table className="admin-table">
            <thead><tr><th>Person</th><th>Rolle</th><th>Sprache</th><th>Fortschritt</th><th>Status</th><th>Letzte Aktivität</th><th /></tr></thead>
            <tbody>{employees.map((item) => (
              <tr key={item.name}>
                <td><span className="admin-avatar">{item.initials}</span><strong>{item.name}</strong></td>
                <td>{item.role}</td><td>{item.language}</td>
                <td><div className="admin-inline-progress"><span><i style={{ width: `${item.progress}%` }} /></span><b>{item.progress}%</b></div></td>
                <td><em className={`admin-status ${item.status === "Aktiv" ? "active" : item.status === "Abgeschlossen" ? "done" : "pending"}`}>{item.status}</em></td>
                <td>{item.last}</td><td><button className="admin-more" type="button" aria-label={`${item.name} verwalten`} onClick={() => notify(`${item.name}: Detailansicht im Prototyp vorgemerkt.`)}><MoreHorizontal size={18} /></button></td>
              </tr>
            ))}</tbody>
          </table></div>
          {employees.length === 0 && <div className="admin-empty">Keine Mitarbeitenden für „{query}“ gefunden.</div>}
        </section>
      )}

      {section === "content" && (
        <AdminContentStudio onNotice={notify} />
      )}
    </div>
  );
}

function searchResultsFor(query) {
  const needle = normalizeText(query);
  if (needle.length < 2) return [];
  const tokens = needle.split(" ").filter(Boolean);
  const customTasks = loadContentState().customTasks || [];
  const entries = [
    ...navItems.map((item) => ({ id: `page-${item.id}`, type: "page", tab: item.id, title: item.label, detail: "Bereich öffnen", Icon: item.icon, text: item.label })),
    { id: "page-company", type: "page", tab: "unternehmen", title: "Unternehmen", detail: "Admin-Bereich", Icon: Building2, text: "unternehmen admin lerninhalte mitarbeitende" },
    { id: "page-settings", type: "page", tab: "settings", title: "Einstellungen", detail: "Darstellung und Sprache", Icon: Settings, text: "einstellungen hell dunkel system sprache" },
    ...LEARN_ROLES.flatMap((role) => role.tasks.map((task) => ({
      id: `task-${task.id}`, type: "learning", tab: "lernen", title: task.title.de, detail: `${role.name.de} · ${task.minutes} Min.`, Icon: BookOpenCheck,
      text: `${task.title.de} ${task.goal.de} ${role.name.de}`
    }))),
    ...customTasks.filter((task) => task.active !== false).map((task) => ({
      id: `custom-${task.id}`, type: "learning", tab: "lernen", title: task.title?.de || "Eigener Lerninhalt", detail: "Eigener Lerninhalt · Lernen öffnen", Icon: Sparkles,
      text: `${task.title?.de || ""} ${task.goal?.de || ""}`
    })),
    ...LEARNING_ASSETS.map((asset) => ({ id: `asset-${asset.id}`, type: "asset", tab: "unternehmen", title: asset.name, detail: "Objektbibliothek · Lerninhalt erstellen", Icon: Sparkles, text: `${asset.name} ${asset.keywords.join(" ")} ${asset.actions.join(" ")}` })),
    ...Object.values(learningAnimations).map((item) => ({ id: `animation-${item.title}`, type: "learning", tab: "lernen", title: item.title, detail: "Schritt-für-Schritt lernen", Icon: Play, text: `${item.title} ${item.keywords.join(" ")}` })),
    ...quickHelpKnowledge.map((item) => ({ id: `help-${item.id}`, type: "quickhelp", tab: "quickhelp", title: item.question, detail: "Antwort aus Unternehmenswissen", Icon: Bot, question: item.question, text: `${item.question} ${item.answer} ${item.keywords.join(" ")}` }))
  ];
  return entries.map((entry) => {
    const text = normalizeText(entry.text);
    const score = (text.includes(needle) ? 40 : 0) + tokens.reduce((sum, token) => sum + (text.includes(token) ? 8 : 0), 0) + (normalizeText(entry.title).startsWith(needle) ? 20 : 0);
    return { ...entry, score };
  }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
}

function Topbar({ onSearchSelect, language, setLanguage, onOpenProfile }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const results = searchResultsFor(query);
  const languageLabel = APP_LANGUAGES.find(([code]) => code === language)?.[1] || "Deutsch";
  const t = (key) => appText(language, key);

  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".global-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function select(result) {
    onSearchSelect(result);
    setQuery("");
    setOpen(false);
  }

  return (
    <header className="topbar">
      <div className="global-search-wrap">
      <label className="search">
        <Search size={18} />
        <input className="global-search-input" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) select(results[0]); if (event.key === "Escape") { setQuery(""); setOpen(false); } }} placeholder={t("search.placeholder")} />
        {query && <button type="button" className="search-clear" aria-label="Suche löschen" onClick={() => { setQuery(""); setOpen(false); }}><X size={15} /></button>}
        <kbd>⌘ K</kbd>
      </label>
      {open && query.trim().length >= 2 && <div className="global-search-results" role="listbox">
        {results.length ? results.map((result) => { const Icon = result.Icon; return <button type="button" role="option" key={result.id} onMouseDown={(event) => event.preventDefault()} onClick={() => select(result)}><span className={`search-result-icon ${result.type}`}><Icon size={16} /></span><span><strong>{result.title}</strong><small>{result.detail}</small></span><ChevronRight size={15} /></button>; }) : <div className="search-no-result"><Search size={17} /><span>{t("search.empty")}</span></div>}
      </div>}
      </div>
      <div className="top-actions">
        <div className="top-language-wrap">
        <button className="language" type="button" aria-expanded={languageOpen} onClick={() => setLanguageOpen((current) => !current)}>
          <Globe2 size={18} />
          {languageLabel}
          <ChevronDown size={14} />
        </button>
        {languageOpen && <div className="top-language-menu">{APP_LANGUAGES.map(([code, label]) => <button type="button" className={language === code ? "active" : ""} key={code} onClick={() => { setLanguage(code); setLanguageOpen(false); }}><span>{label}</span>{language === code && <Check size={14} />}</button>)}</div>}
        </div>
        <button type="button" className="profile profile-trigger" onClick={onOpenProfile} aria-haspopup="dialog">
          <div className="avatar">MY</div>
          <div>
            <strong>Maria Yılmaz</strong>
            <span>Housekeeping</span>
          </div>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------- Dashboard-Datenstand */

/**
 * Das Dashboard erfindet nichts: Bereiche, Taetigkeiten und Lektionen
 * kommen aus den Inhalten, der Fortschritt aus den beiden Speichern von
 * Lernen und Sprachhilfe.
 */
function createDashboardSnapshot(language = "de") {
  const contentLang = contentLanguage(language);
  const learnState = learnStore.load();
  const languageState = languageStore.load();

  const roles = LEARN_ROLES.map((role) => {
    const done = role.tasks.filter((task) => learnState.lessons[task.id]?.completed).length;
    const stars = role.tasks.reduce((sum, task) => sum + (learnState.lessons[task.id]?.stars || 0), 0);
    const next = role.tasks.find((task) => !learnState.lessons[task.id]?.completed) || null;
    return {
      id: role.id,
      title: role.name[contentLang] || role.name.de,
      text: role.tagline[contentLang] || role.tagline.de,
      image: roleImages[role.id],
      accent: role.accent,
      icon: role.icon,
      total: role.tasks.length,
      done,
      stars,
      percent: percent(done, role.tasks.length),
      nextTitle: next ? (next.title[contentLang] || next.title.de) : null,
      nextMinutes: next ? next.minutes : 0
    };
  });

  const totalTasks = roles.reduce((sum, role) => sum + role.total, 0);
  const doneTasks = roles.reduce((sum, role) => sum + role.done, 0);
  const finishedRoles = roles.filter((role) => role.total > 0 && role.done === role.total);

  const languageLessons = getLessonsFromRoles(LANGUAGE_ROLES);
  const languageDone = countCompleted(languageState.lessons);

  /* Die Rolle, die im Lern-Reiter zuletzt gewaehlt war, hat Vorrang. */
  const current = roles.find((role) => role.id === learnState.roleId && role.nextTitle);
  const next = current || roles.find((role) => role.nextTitle) || null;

  return {
    roles,
    totalTasks,
    doneTasks,
    percent: percent(doneTasks, totalTasks),
    stars: roles.reduce((sum, role) => sum + role.stars, 0),
    badges: finishedRoles.length + (languageLessons.length && languageDone === languageLessons.length ? 1 : 0),
    xp: (learnState.xp || 0) + (languageState.xp || 0),
    streak: Math.max(learnState.streak?.count || 0, languageState.streak?.count || 0),
    roleId: learnState.roleId,
    next,
    language: {
      done: languageDone,
      total: languageLessons.length,
      percent: percent(languageDone, languageLessons.length),
      roleId: languageState.roleId
    }
  };
}

function useDashboardSnapshot(language) {
  const [snapshot, setSnapshot] = useState(() => createDashboardSnapshot(language));

  useEffect(() => {
    const refresh = () => setSnapshot(createDashboardSnapshot(language));
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [language]);

  return snapshot;
}

function Hero({ data, onContinue, onOpenLanguage, language }) {
  const t = (key, values) => appText(language, key, values);
  const started = data.doneTasks > 0;
  const next = data.next;

  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>
          {t("hero.welcome")}
        </h1>
        <p>
          {next
            ? language === "en" ? `Next: ${next.nextTitle} — ${next.title}, about ${next.nextMinutes} minutes. Step by step in your language.` : `Als Nächstes: ${next.nextTitle} — ${next.title}, rund ${next.nextMinutes} Minuten. In deiner Sprache, Schritt für Schritt.`
            : language === "en" ? `All ${contentStats.tasks} tasks are complete. Repeat something or practice the related words.` : `Alle ${contentStats.tasks} Tätigkeiten sitzen. Wiederhole, was länger her ist, oder üb die Wörter dazu.`}
        </p>
        <div className="hero-actions">
          <button className="primary-btn" onClick={onContinue}>
            {next ? (started ? t("hero.continue") : t("hero.start")) : t("hero.repeat")}
            <span>→</span>
          </button>
          <button className="secondary-btn" onClick={onOpenLanguage}>
            <Play size={17} />
            {t("hero.words")}
          </button>
        </div>
      </div>
      <div className="hero-media">
        <img src="/assets/hero-worker.png" alt="" />
      </div>
    </section>
  );
}

function ProgressSummary({ data, language }) {
  const t = (key) => appText(language, key);
  return (
    <section className="summary-grid">
      <div className="progress-card">
        <div className="card-title">{t("progress.title")}</div>
        <div className="progress-row">
          <div className="progress-track">
            <span style={{ width: `${data.percent}%` }} />
          </div>
          <strong>{data.percent}%</strong>
        </div>
        <p>
          {data.doneTasks} {language === "en" ? "of" : "von"} {data.totalTasks} {t("modules.tasks")} · {language === "en" ? "Language help" : "Sprachhilfe"} {data.language.done}/{data.language.total} {t("modules.lessons")}
        </p>
      </div>
      <Metric icon={<Flame size={22} />} value={data.streak} label={t("progress.days")} tone="orange" />
      <Metric icon={<Star size={22} />} value={data.xp} label={t("progress.xp")} tone="gold" />
      <Metric icon={<Trophy size={22} />} value={data.badges} label={t("progress.finished")} tone="orange" />
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

function LearningModules({ data, onOpenRole, onOpenLanguage, onShowAll, language }) {
  const t = (key, values) => appText(language, key, values);
  return (
    <section className="modules-section">
      <div className="section-heading">
        <h2>{t("modules.title")}</h2>
        <button type="button" className="section-link" onClick={onShowAll}>
          {t("modules.all")}
          <span>→</span>
        </button>
      </div>
      <div className="module-grid">
        {data.roles.map((role) => {
          const done = role.done === role.total;
          const current = data.next?.id === role.id;
          const Icon = roleIcons[role.icon] || BedDouble;
          return (
            <button type="button" className={"module-card" + (current ? " current" : "")}
              key={role.id} onClick={() => onOpenRole(role.id)}>
              <div className="module-image">
                <img src={role.image} alt="" />
                {done ? (
                  <span className="state done">
                    <Check size={20} />
                  </span>
                ) : (
                  <span className="state play">
                    <Play size={18} fill="currentColor" />
                  </span>
                )}
                <span className="module-tag" style={{ background: role.accent }}>
                  <Icon size={13} />
                  {role.total} {t("modules.tasks")}
                </span>
              </div>
              <h3>{role.title}</h3>
              <p>{role.text}</p>
              <span className="module-next">
                {done ? t("modules.done") : t("modules.next", { title: role.nextTitle })}
              </span>
              <div className="module-progress">
                <div>
                  <span style={{ width: `${role.percent}%` }} />
                </div>
                <strong>{role.done}/{role.total}</strong>
              </div>
            </button>
          );
        })}
        <button type="button" className="module-card" onClick={onOpenLanguage}>
          <div className="module-image tile">
            <Globe2 size={30} />
            <span className="module-tag" style={{ background: "#0f9b8e" }}>
              <BookOpen size={13} />
              {contentStats.lessons} {t("modules.lessons")}
            </span>
          </div>
          <h3>{language === "en" ? "Language help" : "Sprachhilfe"}</h3>
          <p>{contentStats.words} {language === "en" ? "words from the hotel, in" : "Wörter aus dem Haus,"} {contentStats.languages} {language === "en" ? "languages" : "Sprachen"}</p>
          <span className="module-next">
            {data.language.done === data.language.total && data.language.total
              ? t("modules.done")
              : language === "en" ? "Words, sentences and flashcards" : "Wörter, Sätze und Karteikarten"}
          </span>
          <div className="module-progress">
            <div>
              <span style={{ width: `${data.language.percent}%` }} />
            </div>
            <strong>{data.language.done}/{data.language.total}</strong>
          </div>
        </button>
      </div>
    </section>
  );
}

function QuickAccess({ onNavigate, language }) {
  const t = (key) => appText(language, key);
  const quickCards = [
    ["quickhelp", t("quick.help"), language === "en" ? `${contentStats.answers} hotel answers, also in EN & TR` : `${contentStats.answers} Hausantworten, auch auf EN & TR`, MessageCircle],
    ["sprachhilfe", t("quick.words"), language === "en" ? `${contentStats.words} terms as flashcards` : `${contentStats.words} Begriffe als Karteikarten`, Globe2],
    ["fortschritt", t("quick.progress"), language === "en" ? "Stars, streak and XP at a glance" : "Sterne, Serie und XP im Überblick", ChartNoAxesColumn],
    ["team", t("quick.team"), language === "en" ? "Housekeeping, reception, internal 100" : "Hausdame, Rezeption, interne 100", Users]
  ];

  return (
    <section className="quick-section">
      <h2>{t("quick.title")}</h2>
      <div className="quick-grid">
        {quickCards.map(([tab, title, text, Icon]) => (
          <button type="button" className="quick-card" key={tab} onClick={() => onNavigate(tab)}>
            <div className="quick-icon">
              <Icon size={24} />
            </div>
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Encouragement({ data, onProgress, language }) {
  const t = (key) => appText(language, key);
  const open = data.totalTasks - data.doneTasks;
  return (
    <section className="encouragement">
      <div className="plant">
        <Sparkles size={36} />
      </div>
      <div>
        <h3>{t("enc.title")}</h3>
        <p>
          {data.doneTasks === 0
            ? language === "en" ? `${data.totalTasks} tasks are waiting for you. The first takes just a few minutes.` : `${data.totalTasks} Tätigkeiten warten auf dich. Die erste dauert nur wenige Minuten.`
            : open === 0
              ? language === "en" ? `All ${data.totalTasks} tasks done — ${data.stars} stars collected.` : `Alle ${data.totalTasks} Tätigkeiten geschafft — ${data.stars} Sterne gesammelt.`
              : language === "en" ? `${data.doneTasks} done, ${open} still open. ${data.stars} stars so far.` : `${data.doneTasks} geschafft, noch ${open} offen. ${data.stars} Sterne bisher.`}
        </p>
      </div>
      <button className="secondary-btn" onClick={onProgress}>
        {t("enc.progress")}
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

  async function askQuickHelp(rawQuestion, { requireAi = true } = {}) {
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
            <p>
              {contentStats.words} Wörter aus dem Haus in {contentStats.languages} Sprachen — als Karteikarten
              und in {contentStats.lessons} Lektionen.
            </p>
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

function QuickHelpWorkspace({ threads, setThreads, activeThreadId, setActiveThreadId, onOpenLanguageHelp, searchCommand }) {
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

  async function askQuickHelp(rawQuestion, { requireAi = true } = {}) {
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
        requireAi
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

  useEffect(() => {
    if (searchCommand?.question) askQuickHelp(searchCommand.question, { requireAi: false });
  }, [searchCommand?.id]);

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

function ProfilePopup({ onClose }) {
  return <div className="profile-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="profile-modal" role="dialog" aria-modal="true" aria-label="Profilvorschau" onMouseDown={(event) => event.stopPropagation()}>
      <header><span>Profilvorschau</span><button type="button" aria-label="Profil schließen" onClick={onClose}><X size={18} /></button></header>
      <div className="profile-modal-person"><div className="avatar">MY</div><div><h2>Maria Yılmaz</h2><p>Housekeeping · Hotel Alpenblick</p></div></div>
      <dl><div><dt>Mitarbeiter-ID</dt><dd>MA-2048</dd></div><div><dt>E-Mail</dt><dd>maria.yilmaz@alpenblick.demo</dd></div><div><dt>Startdatum</dt><dd>03. September 2025</dd></div></dl>
    </section>
  </div>;
}

function SettingsPage({ theme, setTheme, language, setLanguage, reducedMotion, setReducedMotion }) {
  const t = (key) => appText(language, key);
  const themeOptions = [
    ["light", "Hell", "Helle Oberfläche", Sun],
    ["dark", "Dunkel", "Dunkle Oberfläche", Moon],
    ["system", "System", "Geräteeinstellung", Monitor]
  ];
  const languages = APP_LANGUAGES;

  return (
    <div className="content-grid tab-grid settings-grid">
      <section className="tab-page settings-page">
        <div className="tab-heading"><h1>{t("settings.title")}</h1><p>{t("settings.text")}</p></div>
        <section className="settings-card">
          <div className="settings-card-head"><div className="settings-icon"><Sun size={19} /></div><div><h2>Darstellung</h2><p>Wähle, wie WorkLingo aussehen soll.</p></div></div>
          <div className="theme-choice" role="radiogroup" aria-label="Darstellung auswählen">
            {themeOptions.map(([id, label, description, Icon]) => <button type="button" key={id} role="radio" aria-checked={theme === id} className={theme === id ? "active" : ""} onClick={() => setTheme(id)}><Icon size={19} /><strong>{label}</strong><span>{description}</span>{theme === id && <i><Check size={12} /></i>}</button>)}
          </div>
        </section>
        <section className="settings-card">
          <div className="settings-card-head"><div className="settings-icon"><Globe2 size={19} /></div><div><h2>{t("settings.language")}</h2><p>{t("settings.languageText")}</p></div></div>
          <label className="settings-select"><span>{t("settings.appLanguage")}</span><select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
        </section>
        <section className="settings-card settings-row"><div><h2>Weniger Bewegung</h2><p>Reduziert Animationen in der Oberfläche.</p></div><button type="button" className={`settings-switch ${reducedMotion ? "on" : ""}`} role="switch" aria-checked={reducedMotion} onClick={() => setReducedMotion(!reducedMotion)}><i /><span>{reducedMotion ? "An" : "Aus"}</span></button></section>
      </section>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("worklingo-theme") || "system");
  const [language, setLanguage] = useState(() => localStorage.getItem("worklingo-language") || "de");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("worklingo-reduced-motion") === "true");
  const [quickHelpMessages, setQuickHelpMessages] = useState([]);
  const [quickHelpThreads, setQuickHelpThreads] = useState([]);
  const [activeQuickHelpThreadId, setActiveQuickHelpThreadId] = useState(null);
  const [searchCommand, setSearchCommand] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    localStorage.setItem("worklingo-theme", theme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    const lang = contentLanguage(language);
    document.documentElement.lang = lang;
    localStorage.setItem("worklingo-language", language);
    window.dispatchEvent(new CustomEvent(APP_LANGUAGE_EVENT, { detail: lang }));
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
    localStorage.setItem("worklingo-reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  function handleSearchSelect(result) {
    setActiveTab(result.tab);
    if (result.type === "quickhelp") setSearchCommand({ id: crypto.randomUUID(), question: result.question });
  }

  const languageValue = { language, contentLanguage: contentLanguage(language), t: (key, values) => appText(language, key, values) };

  return (
    <AppLanguageContext.Provider value={languageValue}>
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} language={language} />
      <main className="main">
        <Topbar onSearchSelect={handleSearchSelect} language={language} setLanguage={setLanguage} onOpenProfile={() => setProfileOpen(true)} />
        <TabContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          quickHelpMessages={quickHelpMessages}
          setQuickHelpMessages={setQuickHelpMessages}
          quickHelpThreads={quickHelpThreads}
          setQuickHelpThreads={setQuickHelpThreads}
          activeQuickHelpThreadId={activeQuickHelpThreadId}
          setActiveQuickHelpThreadId={setActiveQuickHelpThreadId}
          searchCommand={searchCommand}
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
          reducedMotion={reducedMotion}
          setReducedMotion={setReducedMotion}
        />
      </main>
      {profileOpen && <ProfilePopup onClose={() => setProfileOpen(false)} />}
    </div>
    </AppLanguageContext.Provider>
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
  setActiveQuickHelpThreadId,
  searchCommand,
  theme,
  setTheme,
  language,
  setLanguage,
  reducedMotion,
  setReducedMotion
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
            searchCommand={searchCommand}
          />
        </section>
      </div>
    );
  }

  if (activeTab === "lernen") {
    return <LearnTab />;
  }

  if (activeTab === "unternehmen") {
    return <AdminPanel />;
  }

  if (activeTab === "settings") {
    return <SettingsPage theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} reducedMotion={reducedMotion} setReducedMotion={setReducedMotion} />;
  }

  if (activeTab === "fortschritt") {
    return (
      <div className="content-grid tab-grid">
        <section className="tab-page">
          <div className="tab-heading">
            <h1>{appText(language, "page.progress")}</h1>
            <p>{appText(language, "page.progressText")}</p>
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
            <h1>{appText(language, "page.team")}</h1>
            <p>{appText(language, "page.teamText")}</p>
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
      <Dashboard setActiveTab={setActiveTab} language={language} />
      <ChatPanel
        messages={quickHelpMessages}
        setMessages={setQuickHelpMessages}
        onOpenLanguageHelp={() => setActiveTab("sprachhilfe")}
      />
    </div>
  );
}

function Dashboard({ setActiveTab, language }) {
  const data = useDashboardSnapshot(language);

  /* Ein Klick aufs Modul waehlt die Rolle im Lern-Reiter vor — derselbe
     Speicher, den LearnTab beim Oeffnen liest. */
  const openRole = (roleId) => {
    learnStore.save({ ...learnStore.load(), roleId });
    setActiveTab("lernen");
  };

  return (
    <div className="dashboard">
      <Hero
        data={data}
        language={language}
        onContinue={() => (data.next ? openRole(data.next.id) : setActiveTab("lernen"))}
        onOpenLanguage={() => setActiveTab("sprachhilfe")}
      />
      <ProgressSummary data={data} language={language} />
      <LearningModules
        data={data}
        onOpenRole={openRole}
        onOpenLanguage={() => setActiveTab("sprachhilfe")}
        onShowAll={() => setActiveTab("lernen")}
        language={language}
      />
      <QuickAccess onNavigate={setActiveTab} language={language} />
      <Encouragement data={data} onProgress={() => setActiveTab("fortschritt")} language={language} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
