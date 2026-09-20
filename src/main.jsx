import React, { useState } from "react";
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
  Play,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap
} from "lucide-react";
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
  ["Dashboard", Home, true],
  ["Lernen", BookOpen],
  ["Mein Fortschritt", ChartNoAxesColumn],
  ["Quick Help (KI-Chat)", MessageCircle],
  ["Sprachhilfe", Globe2],
  ["Team & Kontakte", Users]
];

function Sidebar() {
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
        {navItems.map(([label, Icon, active]) => (
          <a className={active ? "nav-item active" : "nav-item"} href="#" key={label}>
            <Icon size={20} />
            <span>{label}</span>
          </a>
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

function ChatPanel() {
  const [question, setQuestion] = useState("");
  const [quickReply, setQuickReply] = useState("");
  const prompts = [
    "Wie reinige ich Zimmer 203?",
    "Was mache ich bei einer Gastbeschwerde?",
    "Wo finde ich die Wäschekammer?",
    "Wer ist heute an der Rezeption?"
  ];

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    setQuickReply(trimmed);
    setQuestion("");
  }

  return (
    <aside className="rightbar">
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
        <div className="conversation">
          <div className="message outgoing">
            Wie bereite ich ein Zimmer nach Abreise vor?
            <time>10:24</time>
          </div>
          <div className="answer-row">
            <div className="mini-bot">
              <Bot size={18} />
            </div>
            <div className="message incoming">
              <p>Öffne das Modul "Zimmer & Hygiene". Dort findest du die Checkliste für Abreisezimmer: lüften, Bad prüfen, Bettwäsche wechseln und Minibar melden.</p>
              <p>Hier ist der direkte Ablauf:</p>
              <a className="document-link" href="#">
                <FileText size={18} />
                Abreisezimmer-Checkliste
                <ExternalLink size={15} />
              </a>
              <p>Ich kann dir jeden Schritt auch auf Slowakisch, Türkisch oder Englisch erklären.</p>
              <time>10:24</time>
            </div>
          </div>
          {quickReply && (
            <div className="message outgoing live">
              {quickReply}
              <time>jetzt</time>
            </div>
          )}
        </div>
        <div className="prompt-list">
          {prompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>
          ))}
        </div>
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            placeholder="Stelle eine Frage ..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <Paperclip size={20} />
          <button type="submit" aria-label="Senden">
            <Send size={20} fill="currentColor" />
          </button>
        </form>
        <small>Antworten basieren auf internen Unternehmensdaten.</small>
      </section>

      <section className="language-card">
        <div className="translate-icon">
          <Globe2 size={28} />
        </div>
        <div className="language-copy">
          <h3>Sprachhilfe</h3>
          <p>Lerne wichtige Wörter und Sätze für deinen Arbeitsalltag.</p>
          <button className="secondary-btn">
            Zu den Sprachübungen
            <span>→</span>
          </button>
        </div>
        <div className="terms">
          <div><b>DE</b><span>das Zimmer</span></div>
          <div><b>SK</b><span>izba</span></div>
          <div><b>EN</b><span>room</span></div>
          <Zap size={15} fill="currentColor" />
        </div>
      </section>
    </aside>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="content-grid">
          <div className="dashboard">
            <Hero />
            <ProgressSummary />
            <LearningModules />
            <QuickAccess />
            <Encouragement />
          </div>
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
