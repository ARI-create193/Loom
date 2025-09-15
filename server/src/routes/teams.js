import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create team
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const me = await User.findById(req.user.id);
    const existing = await Team.findOne({ name });
    if (existing) return res.status(409).json({ error: 'Team name exists' });
    const team = await Team.create({ name, description, ownerId: me._id, members: [me._id] });
    res.json({ team });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// List my teams
router.get('/me', requireAuth, async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user.id }).sort({ createdAt: -1 });
    res.json({ teams });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

export default router;


