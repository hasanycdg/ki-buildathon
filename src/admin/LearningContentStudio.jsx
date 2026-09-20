import React, { useState, useEffect } from 'react';
import { isMistralIntegrationAvailable, createLearningContent, createContentForTopic, generateContentTopicList } from './learningContentService.js';

const LearningContentStudio = () => {
  const [isMistralAvailable, setIsMistralAvailable] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');

  useEffect(() => {
    // Prüfe, ob MISTRAL Integration verfügbar ist
    setIsMistralAvailable(isMistralIntegrationAvailable());
    
    // Lade Themenliste
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const topicList = await generateContentTopicList();
      setTopics(topicList);
    } catch (err) {
      console.error('Fehler beim Laden der Themen:', err);
      setError('Konnte Themenliste nicht laden');
    }
  };

  const handleCreateContent = async () => {
    if (!prompt.trim()) {
      setError('Bitte geben Sie einen Prompt ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await createLearningContent(prompt);
      setGeneratedContent(content);
    } catch (err) {
      console.error('Fehler bei der Inhaltserstellung:', err);
      setError(`Fehler bei der Erstellung: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopicContent = async () => {
    if (!topic.trim()) {
      setError('Bitte geben Sie ein Thema ein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const content = await createContentForTopic(topic);
      setGeneratedContent(content);
    } catch (err) {
      console.error('Fehler bei der Themen-Inhaltserstellung:', err);
      setError(`Fehler bei der Erstellung des Themeninhalts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContent = () => {
    if (!generatedContent) return;
    
    const blob = new Blob([JSON.stringify(generatedContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning-content-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="learning-content-studio">
      <h2>Lerninhalte Generator</h2>
      
      {!isMistralAvailable ? (
        <div className="error-message">
          <p>
            MISTRAL API Integration ist nicht verfügbar. 
            Bitte setzen Sie den <code>VITE_MISTRAL_API_KEY</code> in Ihrer .env Datei.
          </p>
        </div>
      ) : (
        <>
          <div className="tabs">
            <button 
              className={activeTab === 'generator' ? 'active' : ''}
              onClick={() => setActiveTab('generator')}
            >
              Inhalt Generator
            </button>
            <button 
              className={activeTab === 'topics' ? 'active' : ''}
              onClick={() => setActiveTab('topics')}
            >
              Themen Liste
            </button>
          </div>

          {activeTab === 'generator' && (
            <div className="content-generator">
              <h3>Erstelle Lerninhalte mit MISTRAL</h3>
              
              <div className="input-section">
                <label htmlFor="prompt">Prompt für Inhaltserstellung:</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Beschreiben Sie den gewünschten Lerninhalt..."
                  rows="4"
                />
                <button onClick={handleCreateContent} disabled={loading}>
                  {loading ? 'Erstelle Inhalt...' : 'Inhalt erstellen'}
                </button>
              </div>

              <div className="input-section">
                <label htmlFor="topic">Thema für Inhaltserstellung:</label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Geben Sie ein Thema ein (z.B. 'Hotelreinigung', 'Kundenbetreuung')..."
                />
                <button onClick={handleCreateTopicContent} disabled={loading}>
                  {loading ? 'Erstelle Themeninhalt...' : 'Themeninhalt erstellen'}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}

              {generatedContent && (
                <div className="generated-content">
                  <h3>Erstellter Inhalt</h3>
                  <pre>{JSON.stringify(generatedContent, null, 2)}</pre>
                  <button onClick={handleDownloadContent}>
                    Inhalt herunterladen
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="topics-list">
              <h3>Mögliche Themen für Lerninhalte</h3>
              <ul>
                {topics.map((t, index) => (
                  <li key={index}>{t}</li>
                ))}
              </ul>
              <button onClick={loadTopics} disabled={loading}>
                {loading ? 'Lade Themen...' : 'Themen aktualisieren'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LearningContentStudio;