import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Search users for invitation
router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (q.length < 2) return res.json({ results: [] });
    // Search by text index with privacy rules (exclude requester)
    const me = req.user.id;
    const meDoc = await User.findById(me);
    const results = await User.find({
      _id: { $ne: me },
      isActive: true,
      $text: { $search: q }
    }).select('name email avatar role skills').limit(10);
    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;


