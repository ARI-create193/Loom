import express from 'express';
import Invitation from '../models/Invitation.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Send invitation
router.post('/', requireAuth, async (req, res) => {
  try {
    const { teamId, inviteeEmail, message } = req.body;
    if (!teamId || !inviteeEmail) return res.status(400).json({ error: 'Missing fields' });
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.ownerId.toString() !== req.user.id && !team.members.some(m => m.toString() === req.user.id)) {
      return res.status(403).json({ error: 'Not a team member' });
    }
    const invitee = await User.findOne({ email: inviteeEmail, isActive: true });
    if (!invitee) return res.status(404).json({ error: 'User not found' });
    if (team.members.some(m => m.toString() === invitee._id.toString())) {
      return res.status(400).json({ error: 'User already a member' });
    }
    const existing = await Invitation.findOne({ teamId, inviteeEmail, status: 'pending' });
    if (existing) return res.status(400).json({ error: 'Invitation already sent' });
    const inv = await Invitation.create({ teamId, inviterId: req.user.id, inviteeId: invitee._id, inviteeEmail, message });
    res.json({ invitation: inv });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// List invitations for current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id);
    const invs = await Invitation.find({ inviteeEmail: me.email }).sort({ createdAt: -1 });
    res.json({ invitations: invs });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Respond to invitation
router.post('/:id/respond', requireAuth, async (req, res) => {
  try {
    const { action } = req.body; // 'accepted' | 'declined'
    const inv = await Invitation.findById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });
    const me = await User.findById(req.user.id);
    if (inv.inviteeEmail !== me.email) return res.status(403).json({ error: 'Not your invitation' });
    if (inv.status !== 'pending') return res.status(400).json({ error: 'Already responded' });
    inv.status = action === 'accepted' ? 'accepted' : 'declined';
    await inv.save();
    if (inv.status === 'accepted') {
      const team = await Team.findById(inv.teamId);
      if (team && !team.members.some(m => m.toString() === me._id.toString())) {
        team.members.push(me._id);
        await team.save();
      }
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
});

export default router;


