import { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassSession, GlassConversation } from '../types';

export function useGlassSessions(apiUrl: string, token: string | undefined, activePersona: string) {
  const [glassSessions, setGlassSessions] = useState<GlassSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<GlassConversation[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [wpm, setWpm] = useState(180);
  const [currentDisplay, setCurrentDisplay] = useState('');

  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchGlassSessions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/glass-sessions`, axiosConfig);
      const sessions = response.data.filter((s: GlassSession) => s.persona === activePersona);
      setGlassSessions(sessions);

      if (!activeSessionId && sessions.length > 0) {
        const activeSessions = sessions.filter((s: GlassSession) => s.is_active);
        if (activeSessions.length > 0) {
          setActiveSessionId(activeSessions[0].id);
          setWpm(activeSessions[0].wpm || 180);
        }
      }
    } catch (error) {
      console.error('Failed to fetch glass sessions:', error);
    }
  };

  const fetchConversations = async (sessionId?: number) => {
    try {
      const targetSessionId = sessionId || activeSessionId;
      if (!targetSessionId) return;

      const response = await axios.get(
        `${apiUrl}/api/glass-sessions/${targetSessionId}/conversations`,
        axiosConfig
      );
      setConversations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const startConversation = async () => {
    if (!activeSessionId) return;

    try {
      const conversationName = prompt('Enter conversation name:') || `Conversation ${new Date().toLocaleString()}`;
      await axios.post(
        `${apiUrl}/api/glass-sessions/${activeSessionId}/start-conversation`,
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
        `${apiUrl}/api/glass-sessions/${activeSessionId}/stop-conversation`,
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
      await axios.post(`${apiUrl}/api/glass-sessions/${activeSessionId}/${endpoint}`, {}, axiosConfig);
      setIsListening(!isListening);
    } catch (error) {
      console.error('Failed to toggle listening:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGlassSessions();
    }
  }, [token, activePersona]);

  useEffect(() => {
    if (activeSessionId) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 2000);
      return () => clearInterval(interval);
    }
  }, [activeSessionId]);

  return {
    glassSessions,
    activeSessionId,
    setActiveSessionId,
    conversations,
    isListening,
    wpm,
    setWpm,
    currentDisplay,
    setCurrentDisplay,
    fetchGlassSessions,
    fetchConversations,
    startConversation,
    stopConversation,
    toggleListening,
  };
}
