import TranscriptionNotes from './TranscriptionNotes';
import React, { useState, useEffect, useRef } from 'react';

// Import modular components
import MobileMetroGrid from './components/MobileMetroGrid';
import MobileSessionsList from './components/MobileSessionsList';
import MobileDocumentsList from './components/MobileDocumentsList';
import ConversationList from './components/ConversationList';
import StatsDisplay from './components/StatsDisplay';
import EmptySessionState from './components/EmptySessionState';
import UploadModal from './components/UploadModal';
import SettingsModal from './components/SettingsModal';
import ConversationModal from './components/ConversationModal';
import DocumentModal from './components/DocumentModal';
// NOTE: Header component available but not yet integrated
import DesktopSessionsSidebar from './components/DesktopSessionsSidebar';
import DesktopDocumentsSidebar from './components/DesktopDocumentsSidebar';
import {
  Glasses,
  Mic,
  MicOff,
  Play,
  Pause,
  Upload,
  User,
  Briefcase,
  Home,
  Gamepad2,
  Settings,
  LogOut,
  Moon,
  Sun,
  MessageCircle,
  Zap,
  Volume2,
  Menu
} from 'lucide-react';
import axios from 'axios';

// ============================================================================
// Type Definitions
// ============================================================================

interface User {
  id: number;
  email: string;
}

interface Persona {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  documentCount: number;
}

interface GlassSession {
  id: number;
  userId: number;
  sessionName: string;
  deviceId?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_paused: boolean;
  wpm: number;
  persona: string;
  conversation_state?: string;
  conversation_name?: string;
}

interface GlassConversation {
  id: number;
  sessionId: number;
  query: string;
  response: string;
  timestamp: string;
  responsePages?: string[];
  currentPage?: number;
  duration?: number;
}

interface Document {
  id: number;
  fileName: string;
  content: string;
  persona: string;
  type?: string;
  created_at: string;
}

// ============================================================================
// Main Component
// ============================================================================

export default function PhoneGPTControl({ token, onLogout }: {
  user?: User;
  token?: string;
  onLogout?: () => void;
}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8112';

  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [activePersona, setActivePersona] = useState('work');
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<GlassConversation | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Glass Session State
  const [glassSessions, setGlassSessions] = useState<GlassSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<GlassConversation[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [wpm, setWpm] = useState(180);
  const [currentDisplay] = useState<string>(''); // For display state
  const [pageDisplayDuration, setPageDisplayDuration] = useState(5000); // Add this
  const [autoAdvancePages, setAutoAdvancePages] = useState(true); // Add this

  // Document State
  const [documents, setDocuments] = useState<Document[]>([]);
  // uploadFile state moved to UploadModal component

  // Modal page state (reserved for future use)
  const [] = useState(0);
  
  // Transcription Notes
  const [showTranscription, setShowTranscription] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalConversations: 0,
    averageResponseTime: 0,
    activeGlassConnections: 0
  });

  const conversationEndRef = useRef<HTMLDivElement>(null);

  const axiosConfig = token ? {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  } : {};

  // ============================================================================
  // Personas Configuration
  // ============================================================================

  const personas: Persona[] = [
    { id: 'work', name: 'Work', icon: <Briefcase className="w-4 h-4" />, color: 'blue', documentCount: 0 },
    { id: 'home', name: 'Home', icon: <Home className="w-4 h-4" />, color: 'green', documentCount: 0 },
    { id: 'hobbies', name: 'Hobbies', icon: <Gamepad2 className="w-4 h-4" />, color: 'purple', documentCount: 0 }
  ];

  // ============================================================================
  // API Functions
  // ============================================================================

  const fetchGlassSessions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/glass-sessions`, axiosConfig);
      setGlassSessions(response.data || []);
      
      // Auto-select active session if none selected
      if (!activeSessionId && response.data.length > 0) {
        const activeSessions = response.data.filter((s: GlassSession) => s.is_active);
        if (activeSessions.length > 0) {
          setActiveSessionId(activeSessions[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch glass sessions:', error);
    }
  };

  const createGlassSession = async () => {
    try {
      // First, mark current session as inactive if exists
      if (activeSessionId) {
        await axios.post(
          `${API_URL}/api/glass-sessions/${activeSessionId}/deactivate`,
          {},
          axiosConfig
        ).catch(() => {}); // Ignore error if endpoint doesn't exist
      }

      const response = await axios.post(
        `${API_URL}/api/glass-sessions`,
        { 
          sessionName: `Glass Session - ${new Date().toLocaleString()}`,
          persona: activePersona,
          wpm: wpm
        },
        axiosConfig
      );
      
      // Clear conversations for new session
      setConversations([]);
      
      // Set new session as active
      setActiveSessionId(response.data.id);
      
      // Refresh sessions list
      await fetchGlassSessions();
      
      // Close mobile menu if open
      setShowSessions(false);
    } catch (error) {
      console.error('Failed to create glass session:', error);
    }
  };

  const fetchConversations = async (sessionId?: number) => {
    const targetSessionId = sessionId || activeSessionId;
    if (!targetSessionId) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/glass-sessions/${targetSessionId}/conversations`,
        axiosConfig
      );

      // Sort by timestamp DESC (newest first)
      const sorted = (response.data || []).sort((a: GlassConversation, b: GlassConversation) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setConversations(sorted);

      // Calculate stats
      setStats({
        totalConversations: sorted.length,
        averageResponseTime: sorted.reduce((acc: number, c: GlassConversation) =>
          acc + (c.duration || 0), 0) / (sorted.length || 1),
        activeGlassConnections: glassSessions.filter(s => s.is_active).length
      });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const startConversation = async () => {
    if (!activeSessionId) return;

    try {
      const conversationName = prompt('Enter conversation name:') || `Conversation ${new Date().toLocaleString()}`;
      await axios.post(
        `${API_URL}/api/glass-sessions/${activeSessionId}/start-conversation`,
        { conversationName },
        axiosConfig
      );
      await fetchGlassSessions();
      console.log('✅ Conversation started');
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
      console.log('✅ Conversation stopped');
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

  // Utility function for auto-scroll (available for future use)
  // const scrollToBottom = () => {
  //   conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  // };

  const updateWPM = async (newWpm: number) => {
    if (!activeSessionId) return;
    
    try {
      await axios.post(
        `${API_URL}/api/glass-sessions/${activeSessionId}/settings`,
        { wpm: newWpm },
        axiosConfig
      );
      setWpm(newWpm);
    } catch (error) {
      console.error('Failed to update WPM:', error);
    }
  };

  // uploadDocument function moved to UploadModal component

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/documents`, axiosConfig);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  // Switch to a different session and load all its data
  const switchToSession = async (sessionId: number) => {
    try {
      // Find the session
      const session = glassSessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('Session not found:', sessionId);
        return;
      }

      console.log(`🔄 Switching to session ${sessionId} (${session.persona} persona)`);

      // Update active session
      setActiveSessionId(sessionId);

      // Update persona to match session
      setActivePersona(session.persona);

      // Update WPM
      setWpm(session.wpm || 180);

      // Update listening state
      setIsListening(!session.is_paused);

      // Fetch conversations for this specific session
      await fetchConversations(sessionId);

      // Refresh documents for the new persona
      await fetchDocuments();

      console.log(`✅ Switched to session ${sessionId} (${session.persona} persona)`);
    } catch (error) {
      console.error('Failed to switch session:', error);
    }
  };

  const deleteGlassSession = async (sessionId: number) => {
    try {
      await axios.delete(`${API_URL}/api/glass-sessions/${sessionId}`, axiosConfig);

      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setConversations([]);
      }
      
      await fetchGlassSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    fetchGlassSessions();
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 2000);
      return () => clearInterval(interval);
    }
  }, [activeSessionId]);

  // ============================================================================
  // Render
  // ============================================================================

  const activeSession = glassSessions.find(s => s.id === activeSessionId);

// Complete PhoneGPTControl return() with Metro Grid Integration
// Replace your entire return statement with this:

return (
  <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
    {/* ========== HEADER ========== */}
    <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-40`}>
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <Glasses className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PhoneGPT
            </h1>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {personas.map(persona => (
                <button
                  key={persona.id}
                  onClick={async () => {
                    setActivePersona(persona.id);
                    // Update the active session's persona
                    if (activeSessionId) {
                      try {
                        await axios.post(
                          `${API_URL}/api/glass-sessions/${activeSessionId}/switch-persona`,
                          { persona: persona.id },
                          axiosConfig
                        );
                        // Refresh documents for new persona
                        await fetchDocuments();
                        console.log(`✅ Switched to ${persona.id} persona`);
                      } catch (error) {
                        console.error('Failed to switch persona:', error);
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-all ${
                    activePersona === persona.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {persona.icon}
                  <span className="text-sm">{persona.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Persona Selector */}
        <div className="md:hidden mt-3 flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {personas.map(persona => (
            <button
              key={persona.id}
              onClick={async () => {
                setActivePersona(persona.id);
                // Update the active session's persona
                if (activeSessionId) {
                  try {
                    await axios.post(
                      `${API_URL}/api/glass-sessions/${activeSessionId}/switch-persona`,
                      { persona: persona.id },
                      axiosConfig
                    );
                    // Refresh documents for new persona
                    await fetchDocuments();
                    console.log(`✅ Switched to ${persona.id} persona`);
                  } catch (error) {
                    console.error('Failed to switch persona:', error);
                  }
                }
              }}
              className={`flex-1 px-2 py-1 rounded-md flex items-center justify-center gap-1 transition-all ${
                activePersona === persona.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {persona.icon}
              <span className="text-xs">{persona.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 space-y-2">
            <button
              onClick={() => {
                setShowSettingsModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="w-4 h-4 inline mr-2" /> : <Moon className="w-4 h-4 inline mr-2" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>

    {/* ========== MAIN CONTENT ========== */}
    <div className="px-4 py-4">
      
      {/* ========== MOBILE VIEW WITH METRO GRID ========== */}
      <div className="md:hidden space-y-4">
        
        {/* METRO FEATURE GRID - Using Component */}
        <MobileMetroGrid
          darkMode={darkMode}
          activePersona={activePersona}
          activeSessionId={activeSessionId}
          glassSessions={glassSessions}
          documents={documents}
          wpm={wpm}
          isListening={isListening}
          onTranscribeClick={async () => {
            if (activeSessionId) {
              try {
                await axios.post(
                  `${API_URL}/api/glass-sessions/${activeSessionId}/pause-for-transcribe`,
                  {},
                  axiosConfig
                );
                console.log('✅ Session paused for transcription');
              } catch (error) {
                console.error('Failed to pause session:', error);
              }
            }
            setShowTranscription(true);
          }}
          onSessionsToggle={() => setShowSessions(!showSessions)}
          onDocumentsToggle={() => setShowDocuments(!showDocuments)}
          onUploadClick={() => setShowUploadModal(true)}
          onSettingsClick={() => setShowSettingsModal(true)}
          onToggleListening={toggleListening}
        />

        {/* Sessions Dropdown (triggered by tile) - Using Component */}
        {showSessions && (
          <MobileSessionsList
            darkMode={darkMode}
            glassSessions={glassSessions}
            activeSessionId={activeSessionId}
            onCreateSession={createGlassSession}
            onSwitchSession={async (sessionId) => {
              await switchToSession(sessionId);
              setShowSessions(false);
            }}
            onDeleteSession={deleteGlassSession}
            onClose={() => setShowSessions(false)}
          />
        )}

        {/* Documents Dropdown (triggered by tile) - Using Component */}
        {showDocuments && (
          <MobileDocumentsList
            darkMode={darkMode}
            documents={documents}
            activePersona={activePersona}
            onDocumentClick={async (docId) => {
              try {
                const response = await axios.get(
                  `${API_URL}/api/documents/${docId}`,
                  axiosConfig
                );
                setSelectedDocument(response.data);
                setShowDocumentModal(true);
              } catch (error) {
                console.error('Failed to load document:', error);
              }
            }}
            onDeleteDocument={async (docId) => {
              try {
                await axios.delete(
                  `${API_URL}/api/documents/${docId}`,
                  axiosConfig
                );
                await fetchDocuments();
              } catch (error) {
                console.error('Failed to delete document:', error);
              }
            }}
          />
        )}

        {/* Main Conversation Area */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4`}>
          {activeSession ? (
            <>
              {/* Current Display */}
              {currentDisplay && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                  <div className="text-base">{currentDisplay}</div>
                </div>
              )}

              {/* Conversation History - Using Component */}
              <div className="relative">
                <ConversationList
                  conversations={conversations}
                  onConversationClick={(conv) => {
                    setSelectedConversation(conv);
                    setShowConversationModal(true);
                  }}
                />
              </div>

              {/* Statistics Dashboard - Using Component */}
              <StatsDisplay
                totalConversations={stats.totalConversations}
                averageResponseTime={stats.averageResponseTime}
                activeGlassConnections={stats.activeGlassConnections}
                darkMode={darkMode}
              />
            </>
          ) : (
            <EmptySessionState onCreateSession={createGlassSession} />
          )}
        </div>
      </div>

      {/* ========== DESKTOP VIEW ========== */}
      <div className="hidden md:grid md:grid-cols-12 gap-6">
        {/* Left Sidebar - Sessions - Using Component */}
        <DesktopSessionsSidebar
          darkMode={darkMode}
          glassSessions={glassSessions}
          activeSessionId={activeSessionId}
          stats={stats}
          onCreateSession={createGlassSession}
          onSwitchSession={switchToSession}
          onDeleteSession={deleteGlassSession}
          onTranscribeClick={() => setShowTranscription(true)}
        />

        {/* Main Content */}
        <div className="col-span-6">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 h-[calc(100vh-200px)]`}>
            {activeSession ? (
              <>
                {/* Controls */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    {/* Start/Stop Conversation Buttons */}
                    {activeSession.conversation_state === 'idle' ? (
                      <button
                        onClick={startConversation}
                        className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Play className="w-4 h-4" />
                        Start Conversation
                      </button>
                    ) : activeSession.conversation_state === 'recording' ? (
                      <button
                        onClick={stopConversation}
                        className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all bg-red-500 text-white hover:bg-red-600"
                      >
                        <Pause className="w-4 h-4" />
                        Stop Conversation
                      </button>
                    ) : null}

                    <button
                      onClick={toggleListening}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        isListening
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      {isListening ? 'Listening' : 'Muted'}
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm">{wpm} WPM</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500 text-white hover:bg-purple-600 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Doc
                  </button>
                </div>

                {/* Conversation Status */}
                {activeSession.conversation_state === 'recording' && activeSession.conversation_name && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-sm">Recording:</span>
                      <span className="text-sm">{activeSession.conversation_name}</span>
                    </div>
                  </div>
                )}

                {/* Current Display */}
                {currentDisplay && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                    <div className="text-lg font-medium">{currentDisplay}</div>
                  </div>
                )}

                {/* Conversation History */}
                <div className="relative">
                  <div className="overflow-y-auto h-[calc(100%-120px)] space-y-3">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setSelectedConversation(conv);
                          setShowConversationModal(true);
                        }}
                        className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Q: {conv.query.substring(0, 50)}...</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(conv.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            A: {conv.response.substring(0, 100)}...
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={conversationEndRef} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Glasses className="w-16 h-16 mb-4" />
                <p>Select or create a glass session to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Documents - Using Component */}
        <DesktopDocumentsSidebar
          darkMode={darkMode}
          documents={documents}
          activePersona={activePersona}
          onUploadClick={() => setShowUploadModal(true)}
          onDeleteDocument={async (docId) => {
            try {
              await axios.delete(
                `${API_URL}/api/documents/${docId}`,
                axiosConfig
              );
              await fetchDocuments();
            } catch (error) {
              console.error('Failed to delete document:', error);
            }
          }}
        />
      </div>
    </div>

    {/* ========== MODALS ========== */}
    
    {/* Transcription Notes Modal */}
    {showTranscription && (
      <div className="fixed inset-0 z-50 bg-black/50">
        <div className={`absolute inset-0 md:inset-8 rounded-2xl overflow-hidden ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <TranscriptionNotes
            persona={activePersona}
            darkMode={darkMode}
            sessionId={activeSessionId}
            onDocumentSaved={fetchDocuments}
            onBack={async () => {
              if (activeSessionId) {
                try {
                  await axios.post(
                    `${API_URL}/api/glass-sessions/${activeSessionId}/resume-from-transcribe`,
                    {},
                    axiosConfig
                  );
                  console.log('✅ Session resumed from transcription');
                } catch (error) {
                  console.error('Failed to resume session:', error);
                }
              }
              setShowTranscription(false);
            }}
          />
        </div>
      </div>
    )}

    {/* Conversation Modal - Using Component */}
    {showConversationModal && selectedConversation && (
      <ConversationModal
        conversation={selectedConversation}
        darkMode={darkMode}
        onClose={() => setShowConversationModal(false)}
      />
    )}

    {/* Upload Modal - Using Component */}
    {showUploadModal && (
      <UploadModal
        darkMode={darkMode}
        personas={personas}
        defaultPersona={activePersona}
        onClose={() => setShowUploadModal(false)}
        onUpload={async (file, persona) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('persona', persona);

          await axios.post(
            `${API_URL}/api/documents`,
            formData,
            {
              ...axiosConfig,
              headers: {
                ...axiosConfig.headers,
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          await fetchDocuments();
        }}
      />
    )}

    {/* Settings Modal - Using Component */}
    {showSettingsModal && (
      <SettingsModal
        darkMode={darkMode}
        wpm={wpm}
        pageDisplayDuration={pageDisplayDuration}
        autoAdvancePages={autoAdvancePages}
        onClose={() => setShowSettingsModal(false)}
        onWpmChange={updateWPM}
        onPageDurationChange={async (duration) => {
          setPageDisplayDuration(duration);
          if (activeSessionId) {
            try {
              await axios.post(
                `${API_URL}/api/glass-sessions/${activeSessionId}/page-settings`,
                { pageDisplayDuration: duration },
                axiosConfig
              );
            } catch (error) {
              console.error('Failed to update page duration:', error);
            }
          }
        }}
        onAutoAdvanceChange={async (enabled) => {
          setAutoAdvancePages(enabled);
          if (activeSessionId) {
            try {
              await axios.post(
                `${API_URL}/api/glass-sessions/${activeSessionId}/page-settings`,
                { autoAdvance: enabled },
                axiosConfig
              );
            } catch (error) {
              console.error('Failed to update auto-advance:', error);
            }
          }
        }}
      />
    )}

    {/* Document Viewer Modal - Using Component */}
    {showDocumentModal && selectedDocument && (
      <DocumentModal
        document={selectedDocument}
        darkMode={darkMode}
        onClose={() => {
          setShowDocumentModal(false);
          setSelectedDocument(null);
        }}
      />
    )}
  </div>
);
}