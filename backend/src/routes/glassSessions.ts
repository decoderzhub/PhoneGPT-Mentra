import { Router, Request, Response } from 'express';
import { db } from '../database/init';
import { authenticateToken } from './auth';

const router = Router();

router.get('/', authenticateToken, (req: any, res: Response) => {
  try {
    const sessions = db.prepare(
      'SELECT * FROM glassSessions WHERE userId = ? ORDER BY updated_at DESC'
    ).all(req.user.userId);

    res.json(sessions || []);
  } catch (error) {
    console.error('Get glass sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionName, persona, wpm } = req.body;

    const result = db.prepare(
      'INSERT INTO glassSessions (userId, sessionName, persona, wpm) VALUES (?, ?, ?, ?)'
    ).run(req.user.userId, sessionName || `Glass Session ${Date.now()}`, persona || 'work', wpm || 180);

    res.status(201).json({
      id: result.lastInsertRowid,
      sessionName,
      persona,
      wpm
    });
  } catch (error) {
    console.error('Create glass session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:sessionId', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    db.prepare('DELETE FROM glassSessions WHERE id = ?').run(sessionId);
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete glass session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:sessionId/pause', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    db.prepare('UPDATE glassSessions SET is_paused = 1 WHERE id = ?').run(sessionId);
    res.json({ message: 'Session paused' });
  } catch (error) {
    console.error('Pause session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:sessionId/resume', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    db.prepare('UPDATE glassSessions SET is_paused = 0 WHERE id = ?').run(sessionId);
    res.json({ message: 'Session resumed' });
  } catch (error) {
    console.error('Resume session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:sessionId/start-conversation', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { conversationName } = req.body;

    const session: any = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    db.prepare(
      'UPDATE glassSessions SET conversation_state = ?, conversation_name = ? WHERE id = ?'
    ).run('recording', conversationName, sessionId);

    console.log(`✅ Conversation "${conversationName}" started for session ${sessionId}`);

    res.json({
      message: 'Conversation started',
      conversationName,
      conversation_state: 'recording'
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:sessionId/stop-conversation', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session: any = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    db.prepare(
      'UPDATE glassSessions SET conversation_state = ?, conversation_name = NULL WHERE id = ?'
    ).run('idle', sessionId);

    console.log(`✅ Conversation stopped for session ${sessionId}`);

    res.json({
      message: 'Conversation stopped',
      conversation_state: 'idle'
    });
  } catch (error) {
    console.error('Stop conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:sessionId/conversations', authenticateToken, (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session: any = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const conversations = db.prepare(
      'SELECT * FROM glassConversations WHERE sessionId = ? AND persona = ? ORDER BY timestamp DESC'
    ).all(sessionId, session.persona);

    res.json(conversations || []);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:sessionId/conversations', authenticateToken, async (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { query, response, responsePages, duration } = req.body;

    const session: any = db.prepare(
      'SELECT * FROM glassSessions WHERE id = ? AND userId = ?'
    ).get(sessionId, req.user.userId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = db.prepare(
      'INSERT INTO glassConversations (sessionId, query, response, responsePages, duration, persona) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      sessionId,
      query,
      response,
      responsePages ? JSON.stringify(responsePages) : null,
      duration,
      session.persona
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      query,
      response,
      responsePages,
      duration
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
