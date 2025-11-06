import { Router, Request, Response } from 'express';
import { db } from '../database/init';
import { authenticateToken } from './auth';

const router = Router();

router.get('/', authenticateToken, (req: any, res: Response) => {
  try {
    const { persona } = req.query;

    let documents;
    if (persona) {
      documents = db.prepare(
        'SELECT * FROM documents WHERE userId = ? AND persona = ? ORDER BY created_at DESC'
      ).all(req.user.userId, persona);
    } else {
      documents = db.prepare(
        'SELECT * FROM documents WHERE userId = ? ORDER BY created_at DESC'
      ).all(req.user.userId);
    }

    res.json(documents || []);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, (req: any, res: Response) => {
  try {
    const { fileName, content, persona, type } = req.body;

    if (!fileName || !content) {
      return res.status(400).json({ error: 'File name and content required' });
    }

    const result = db.prepare(
      'INSERT INTO documents (userId, fileName, content, persona, type) VALUES (?, ?, ?, ?, ?)'
    ).run(
      req.user.userId,
      fileName,
      content,
      persona || 'work',
      type || 'upload'
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      fileName,
      persona,
      type
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:docId', authenticateToken, (req: any, res: Response) => {
  try {
    const { docId } = req.params;

    const doc = db.prepare(
      'SELECT * FROM documents WHERE id = ? AND userId = ?'
    ).get(docId, req.user.userId);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
