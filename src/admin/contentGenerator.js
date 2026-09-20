/**
 * Content Generator - Automatische Erstellung von Lerninhalten mit MISTRAL API
 */
import { mistralJson } from "./mistralClient.js";

// System prompt für die generierung von Lerninhalten
const systemPrompt = `
Du bist ein.expert for creating educational content. Your task is to create comprehensive, well-structured learning materials based on user requests.

When generating content:
1. Make sure your response is in valid JSON format
2. Create clear, structured content that follows the existing patterns in this project
3. Follow the established structure like housekeeping tasks with stages and steps
4. Include all necessary language translations (de, en, pl, hr, sr)
5. Keep content educational and practical

The learning content should follow these guidelines:
- Use a clear, step-by-step approach
- Include visual elements descriptions in structured format
- Provide explanations for why certain actions are important
- Ensure the content aligns with standard practices in the relevant field
- Make it suitable for training purposes
`;

/**
 * Erstellt ein neues Lernmodul basierend auf einem Prompt
 * @param {string} prompt - Der Prompt für die Inhaltserstellung
 * @returns {Promise<Object>} Das generierte Lernmodul
 */
export async function generateLearningContent(prompt) {
  try {
    const result = await mistralJson({
      system: systemPrompt,
      prompt: `Erstelle ein neues Lernmodul basierend auf folgendem Prompt: ${prompt}
      
      Das Modul sollte folgende Struktur haben:
      - Eine ID für das Modul (z.B. "module-xy")
      - Ein sprechender Name in mehreren Sprachen
      - Ein Tagline in mehreren Sprachen
      - Eine Akzentfarbe
      - Ein Icon 
      - Einen kurzen Beschreibungstext (blurb)
      - Eine Liste von Tasks mit:
        * ID für das Task
        * Titel in mehreren Sprachen  
        * Ziel in mehreren Sprachen
        * Dauer in Minuten
        * Stages mit:
          - ID für die Stage
          - Ziel in mehreren Sprachen
          - Steps mit:
            - Typ des Steps (demo, sequence, decide, checklist, hotspot)
            - Bei demo: scene, title, intro und frames mit captions und details
            - Bei sequence: prompt und steps mit Liste der Schritte
            - Bei decide: prompt, options mit Auswahlmöglichkeiten, answer (Index der richtigen Antwort) und explain
            - Bei checklist: prompt, items mit Label und correct Werte, explain  
            - Bei hotspot: scene, prompt, hint, spots mit id, x, y, r, label und why
            
      Achte darauf dass der Inhalt in deutscher Sprache generiert wird. 
      
      Gib nur valide JSON zurück!`,
      temperature: 0.7
    });
    
    return result;
  } catch (error) {
    console.error("Fehler bei der Inhaltserstellung:", error);
    throw new Error(`Inhaltserstellung fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Erstellt ein Lernmodul für ein spezifisches Thema
 * @param {string} topic - Das Thema des Lernmoduls
 * @returns {Promise<Object>} Das generierte Lernmodul
 */
export async function generateTopicContent(topic) {
  try {
    const result = await mistralJson({
      system: systemPrompt,
      prompt: `Erstelle ein detailliertes Lernmodul für das Thema: ${topic}
      
      Folge den gleichen Strukturen wie die bestehenden Module (z.B. housekeeping).
      
      Das Modul sollte folgende Inhalte enthalten:
      - Eine strukturierte Einführung in das Thema
      - Mehrere praktische Anwendungsfälle
      - Schritt-für-Schritt-Anleitungen
      - Interaktive Elemente (quiz, checklisten)
      - Sprachversionen: de, en, pl, hr, sr
      
      Gib nur valide JSON zurück!`,
      temperature: 0.8
    });
    
    return result;
  } catch (error) {
    console.error("Fehler bei der Topic-Inhaltserstellung:", error);
    throw new Error(`Topic-Inhaltserstellung fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Generiert eine Liste von Themen für Lerninhalte
 * @returns {Promise<Array>} Liste von Themen
 */
export async function generateContentTopics() {
  try {
    const result = await mistralJson({
      system: systemPrompt,
      prompt: `Generiere eine Liste von 10 relevanten Themen für Lerninhalte in der Hotelbranche. 
      
      Die Themen sollten praxisorientiert sein und verschiedene Bereiche abdecken wie:
      - Housekeeping
      - Kundenbetreuung  
      - Sicherheit
      - Reinigung
      - Servicequalität
      - Kommunikation
      
      Gib nur valide JSON zurück in folgendem Format:
      {
        topics: ["Thema 1", "Thema 2", ...]
      }`,
      temperature: 0.9
    });
    
    return result.topics;
  } catch (error) {
    console.error("Fehler bei der Themen-Generierung:", error);
    throw new Error(`Themen-Generierung fehlgeschlagen: ${error.message}`);
  }
}