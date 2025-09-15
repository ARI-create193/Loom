import express from 'express';
import Message from '../models/Message.js';
import Team from '../models/Team.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// List messages for a team
router.get('/:teamId', requireAuth, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!team.members.some(m => m.toString() === req.user.id)) return res.status(403).json({ error: 'Not a team member' });
    const msgs = await Message.find({ teamId }).sort({ createdAt: 1 });
    res.json({ messages: msgs });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post message to a team
router.post('/:teamId', requireAuth, async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!team.members.some(m => m.toString() === req.user.id)) return res.status(403).json({ error: 'Not a team member' });
    const msg = await Message.create({ teamId, senderId: req.user.id, text });
    res.json({ message: msg });
  } catch (e) {
    res.status(500).json({ error: 'Failed to post message' });
  }
});

export default router;


