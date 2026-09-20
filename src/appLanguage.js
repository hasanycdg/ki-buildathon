import { createContext, useContext } from "react";

// A single source of truth for the language selected in the top bar. New
// screens can use `useAppLanguage().t("key")` instead of keeping local copy.
export const APP_LANGUAGE_EVENT = "worklingo:language-change";
export const APP_LANGUAGES = [
  ["de", "Deutsch"],
  ["de-simple", "Deutsch – einfache Sprache"],
  ["en", "Englisch"]
];

export function contentLanguage(language) {
  return language === "de-simple" ? "de" : language;
}

const copy = {
  de: {
    "nav.dashboard": "Dashboard", "nav.learn": "Lernen", "nav.progress": "Mein Fortschritt", "nav.help": "Quick Help (KI-Chat)", "nav.language": "Sprachhilfe", "nav.team": "Team & Kontakte", "nav.company": "Unternehmen", "nav.settings": "Einstellungen",
    "search.placeholder": "Suche nach Thema, Aufgabe oder Antwort ...", "search.empty": "Keine passende Antwort oder Aufgabe gefunden.",
    "hero.welcome": "Willkommen im Hotel Alpenblick, Maria!", "hero.continue": "Weiter lernen", "hero.start": "Jetzt starten", "hero.repeat": "Tätigkeit wiederholen", "hero.words": "Wörter üben",
    "progress.title": "Dein Onboarding-Fortschritt", "progress.days": "Tage in Folge", "progress.xp": "XP Punkte", "progress.finished": "Bereiche fertig",
    "modules.title": "Deine Lernmodule", "modules.all": "Alle Module anzeigen", "modules.tasks": "Tätigkeiten", "modules.lessons": "Lektionen", "modules.done": "Alles geschafft — wiederholen", "modules.next": "Als Nächstes: {title}",
    "quick.title": "Schnellzugriff", "quick.help": "Quick Help fragen", "quick.words": "Wörter & Sätze üben", "quick.progress": "Mein Fortschritt", "quick.team": "Team & Kontakte",
    "enc.title": "Kleine Schritte. Große Fortschritte.", "enc.progress": "Mein Fortschritt",
    "page.progress": "Mein Fortschritt", "page.progressText": "Deine Übungen aus Lernen und Sprachhilfe auf einen Blick.", "page.team": "Team & Kontakte", "page.teamText": "Die wichtigsten Ansprechpartner:innen für deine Schicht.",
    "settings.title": "Einstellungen", "settings.text": "Darstellung und Sprache für deinen Arbeitsplatz.", "settings.language": "Sprache", "settings.languageText": "Für Menüs und Hinweise in WorkLingo.", "settings.appLanguage": "App-Sprache"
  },
  "de-simple": {
    "nav.dashboard": "Start", "nav.learn": "Lernen", "nav.progress": "Mein Fortschritt", "nav.help": "Quick Help", "nav.language": "Sprachhilfe", "nav.team": "Team", "nav.company": "Unternehmen", "nav.settings": "Einstellungen",
    "search.placeholder": "Thema, Aufgabe oder Antwort suchen ...", "search.empty": "Nichts Passendes gefunden.",
    "hero.welcome": "Willkommen, Maria!", "hero.continue": "Weiter lernen", "hero.start": "Jetzt starten", "hero.repeat": "Noch einmal üben", "hero.words": "Wörter üben",
    "progress.title": "Dein Fortschritt", "progress.days": "Tage nacheinander", "progress.xp": "XP Punkte", "progress.finished": "Bereiche fertig",
    "modules.title": "Deine Lerninhalte", "modules.all": "Alle zeigen", "modules.tasks": "Aufgaben", "modules.lessons": "Lektionen", "modules.done": "Fertig — noch einmal üben", "modules.next": "Als Nächstes: {title}",
    "quick.title": "Schnell starten", "quick.help": "Quick Help fragen", "quick.words": "Wörter üben", "quick.progress": "Mein Fortschritt", "quick.team": "Team", "enc.title": "Kleine Schritte. Große Fortschritte.", "enc.progress": "Mein Fortschritt",
    "page.progress": "Mein Fortschritt", "page.progressText": "Deine Übungen auf einen Blick.", "page.team": "Team", "page.teamText": "Wichtige Kontakte für deine Schicht.",
    "settings.title": "Einstellungen", "settings.text": "Aussehen und Sprache einstellen.", "settings.language": "Sprache", "settings.languageText": "Für Menüs und Hinweise.", "settings.appLanguage": "App-Sprache"
  },
  en: {
    "nav.dashboard": "Dashboard", "nav.learn": "Learn", "nav.progress": "My progress", "nav.help": "Quick Help (AI chat)", "nav.language": "Language help", "nav.team": "Team & contacts", "nav.company": "Company", "nav.settings": "Settings",
    "search.placeholder": "Search topics, tasks or answers ...", "search.empty": "No matching answer or task found.",
    "hero.welcome": "Welcome to Hotel Alpenblick, Maria!", "hero.continue": "Continue learning", "hero.start": "Start now", "hero.repeat": "Practice again", "hero.words": "Practice words",
    "progress.title": "Your onboarding progress", "progress.days": "days in a row", "progress.xp": "XP points", "progress.finished": "areas completed",
    "modules.title": "Your learning modules", "modules.all": "Show all modules", "modules.tasks": "tasks", "modules.lessons": "lessons", "modules.done": "All done — practice again", "modules.next": "Next: {title}",
    "quick.title": "Quick access", "quick.help": "Ask Quick Help", "quick.words": "Practice words & sentences", "quick.progress": "My progress", "quick.team": "Team & contacts",
    "enc.title": "Small steps. Great progress.", "enc.progress": "My progress",
    "page.progress": "My progress", "page.progressText": "Your exercises from Learn and Language help at a glance.", "page.team": "Team & contacts", "page.teamText": "The most important contacts for your shift.",
    "settings.title": "Settings", "settings.text": "Appearance and language for your workspace.", "settings.language": "Language", "settings.languageText": "For menus and guidance in WorkLingo.", "settings.appLanguage": "App language"
  }
};

export function appText(language, key, values = {}) {
  let text = copy[language]?.[key] ?? copy.de[key] ?? key;
  Object.entries(values).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, value); });
  return text;
}

export const AppLanguageContext = createContext({
  language: "de",
  contentLanguage: "de",
  t: (key, values) => appText("de", key, values)
});

export function useAppLanguage() {
  return useContext(AppLanguageContext);
}
