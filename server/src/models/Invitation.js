import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  inviterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inviteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  inviteeEmail: { type: String, required: true, index: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  message: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Invitation', invitationSchema);


