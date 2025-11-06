import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Moon, Sun, X, Upload, Menu } from 'lucide-react';
import axios from 'axios';
import TranscriptionNotes from './TranscriptionNotes';
import ConversationControls from './components/ConversationControls';
import SessionsList from './components/SessionsList';
import ConversationHistory from './components/ConversationHistory';
import DocumentsPanel from './components/DocumentsPanel';
import PersonaSelector from './components/PersonaSelector';
import RecordingStatus from './components/RecordingStatus';
import { GlassSession, GlassConversation, Document, Persona } from './types';

interface User {
  id: number;
  email: string;
}

export default function PhoneGPTControl({
  user,
  token,
  onLogout
}: {
  user?: User;
  token?: string;
  onLogout?: () => void;
}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8112';

  const [darkMode, setDarkMode] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>('work');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [glassSessions, setGlassSessions] = useState<GlassSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<GlassConversation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [wpm, setWpm] = useState(180);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const activeSession = glassSessions.find(s => s.id === activeSessionId);

  const fetchGlassSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/glass-sessions`, axiosConfig);
      const filtered = response.data.filter((s: GlassSession) => s.persona === activePersona);
      setGlassSessions(filtered);

      if (!activeSessionId && filtered.length > 0) {
        const active = filtered.find((s: GlassSession) => s.is_active);
        if (active) {
          setActiveSessionId(active.id);
          setWpm(active.wpm || 180);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchConversations = async () => {
    if (!activeSessionId) return;
    try {
      const response = await axios.get(
        `${API_URL}/api/glass-sessions/${activeSessionId}/conversations`,
        axiosConfig
      );
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/documents?persona=${activePersona}`,
        axiosConfig
      );
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const createGlassSession = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/glass-sessions`,
        {
          sessionName: `Glass Session - ${new Date().toLocaleString()}`,
          persona: activePersona,
          wpm: 180
        },
        axiosConfig
      );
      await fetchGlassSessions();
      setActiveSessionId(response.data.id);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const deleteGlassSession = async (sessionId: number) => {
    if (!confirm('Delete this session?')) return;
    try {
      await axios.delete(`${API_URL}/api/glass-sessions/${sessionId}`, axiosConfig);
      if (activeSessionId === sessionId) setActiveSessionId(null);
      await fetchGlassSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const startConversation = async () => {
    if (!activeSessionId) return;
    const name = prompt('Enter conversation name:') || `Conversation ${new Date().toLocaleString()}`;
    try {
      await axios.post(
        `${API_URL}/api/glass-sessions/${activeSessionId}/start-conversation`,
        { conversationName: name },
        axiosConfig
      );
      await fetchGlassSessions();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const stopConversation = async () => {
    if (!activeSessionId) return;
    try {
      await axios.post(
        `${API_URL}/api/glass-sessions/${activeSessionId}/stop-conversation`,
        {},
        axiosConfig
      );
      await fetchGlassSessions();
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  };

  const toggleListening = async () => {
    if (!activeSessionId) return;
    try {
      const endpoint = isListening ? 'pause' : 'resume';
      await axios.post(`${API_URL}/api/glass-sessions/${activeSessionId}/${endpoint}`, {}, axiosConfig);
      setIsListening(!isListening);
    } catch (error) {
      console.error('Failed to toggle listening:', error);
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadFile) return;
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        await axios.post(
          `${API_URL}/api/documents`,
          { fileName: uploadFile.name, content, persona: activePersona },
          axiosConfig
        );
        setShowUploadModal(false);
        setUploadFile(null);
        await fetchDocuments();
      };
      reader.readAsText(uploadFile);
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const deleteDocument = async (docId: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await axios.delete(`${API_URL}/api/documents/${docId}`, axiosConfig);
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleNavigatePage = (conversationId: number, direction: 'prev' | 'next') => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId || !conv.responsePages) return conv;
      const currentPage = conv.currentPage || 0;
      const newPage = direction === 'prev'
        ? Math.max(0, currentPage - 1)
        : Math.min(conv.responsePages.length - 1, currentPage + 1);
      return { ...conv, currentPage: newPage };
    }));
  };

  useEffect(() => {
    if (token) {
      fetchGlassSessions();
      fetchDocuments();
    }
  }, [token, activePersona]);

  useEffect(() => {
    if (activeSessionId) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 2000);
      return () => clearInterval(interval);
    }
  }, [activeSessionId]);

  if (showTranscription) {
    return (
      <TranscriptionNotes
        onBack={() => setShowTranscription(false)}
        token={token}
        activePersona={activePersona}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">PhoneGPT Control</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTranscription(true)}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
            >
              Notes
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <PersonaSelector
            activePersona={activePersona}
            onSelectPersona={setActivePersona}
          />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <SessionsList
              sessions={glassSessions}
              activeSessionId={activeSessionId}
              darkMode={darkMode}
              onCreateSession={createGlassSession}
              onSwitchSession={setActiveSessionId}
              onDeleteSession={deleteGlassSession}
            />

            <div className="mt-4">
              <DocumentsPanel
                documents={documents}
                darkMode={darkMode}
                onDeleteDocument={deleteDocument}
              />
            </div>
          </div>

          <div className="col-span-9">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              {activeSession ? (
                <>
                  {activeSession.conversation_state === 'recording' && (
                    <RecordingStatus session={activeSession} />
                  )}

                  <ConversationControls
                    activeSession={activeSession}
                    isListening={isListening}
                    wpm={wpm}
                    onStartConversation={startConversation}
                    onStopConversation={stopConversation}
                    onToggleListening={toggleListening}
                    onShowUploadModal={() => setShowUploadModal(true)}
                  />

                  <ConversationHistory
                    conversations={conversations}
                    onNavigatePage={handleNavigatePage}
                  />
                </>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <p className="mb-4">No active session</p>
                  <button
                    onClick={createGlassSession}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create New Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="file"
              accept=".txt,.md,.pdf"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              onClick={handleUploadDocument}
              disabled={!uploadFile}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Upload
            </button>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl max-w-md w-full`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Settings</h3>
              <button onClick={() => setShowSettingsModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">WPM (Words Per Minute)</label>
                <input
                  type="number"
                  value={wpm}
                  onChange={(e) => setWpm(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="60"
                  max="300"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
