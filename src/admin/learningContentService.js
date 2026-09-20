/**
 * Learning Content Service - Verwaltung von Lerninhalten mit MISTRAL Integration
 */
import { generateLearningContent, generateTopicContent, generateContentTopics } from "./contentGenerator.js";
import { mistralEnabled } from "./mistralClient.js";

// Lokaler Speicher für generierte Inhalte
const contentCache = new Map();

/**
 * Prüft, ob die MISTRAL API integriert ist
 * @returns {boolean} True wenn MISTRAL API aktiv ist
 */
export function isMistralIntegrationAvailable() {
  return mistralEnabled;
}

/**
 * Erstellt einen neuen Lerninhalt basierend auf einem Prompt
 * @param {string} prompt - Das Prompt für die Inhaltserstellung
 * @returns {Promise<Object>} Das generierte Lernmodul
 */
export async function createLearningContent(prompt) {
  if (!mistralEnabled) {
    throw new Error("MISTRAL API Integration ist nicht verfügbar. Bitte setzen Sie den VITE_MISTRAL_API_KEY in der .env Datei.");
  }

  // Prüfen, ob wir den Inhalt bereits im Cache haben
  const cacheKey = `prompt_${prompt.substring(0, 50)}`;
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey);
  }

  try {
    const content = await generateLearningContent(prompt);
    contentCache.set(cacheKey, content);
    return content;
  } catch (error) {
    console.error("Fehler bei der Erstellung von Lerninhalten:", error);
    throw new Error(`Erstellung des Lerninhalts fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Erstellt Lerninhalte für ein spezifisches Thema
 * @param {string} topic - Das Thema für die Inhalte
 * @returns {Promise<Object>} Die generierten Lerninhalte
 */
export async function createContentForTopic(topic) {
  if (!mistralEnabled) {
    throw new Error("MISTRAL API Integration ist nicht verfügbar. Bitte setzen Sie den VITE_MISTRAL_API_KEY in der .env Datei.");
  }

  const cacheKey = `topic_${topic.substring(0, 50)}`;
  if (contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey);
  }

  try {
    const content = await generateTopicContent(topic);
    contentCache.set(cacheKey, content);
    return content;
  } catch (error) {
    console.error("Fehler bei der Themen-Inhaltserstellung:", error);
    throw new Error(`Erstellung des Themeninhalts fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Generiert eine Liste von Themen für Lerninhalte
 * @returns {Promise<Array>} Liste von Themen
 */
export async function generateContentTopicList() {
  if (!mistralEnabled) {
    throw new Error("MISTRAL API Integration ist nicht verfügbar. Bitte setzen Sie den VITE_MISTRAL_API_KEY in der .env Datei.");
  }

  try {
    const topics = await generateContentTopics();
    return topics;
  } catch (error) {
    console.error("Fehler bei der Themen-Generierung:", error);
    throw new Error(`Themen-Generierung fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Lädt existierende Lerninhalte aus dem Cache
 * @param {string} cacheKey - Der Schlüssel für den Cache
 * @returns {Object|null} Die gecachten Inhalte oder null
 */
export function getCachedContent(cacheKey) {
  return contentCache.get(cacheKey) || null;
}

/**
 * Speichert Inhalte im Cache
 * @param {string} cacheKey - Der Schlüssel für den Cache
 * @param {Object} content - Die Inhalte zum Cachen
 */
export function setCachedContent(cacheKey, content) {
  contentCache.set(cacheKey, content);
}