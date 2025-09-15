import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, default: 'Developer' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.index({ name: 'text', email: 'text', role: 'text', skills: 'text' });

export default mongoose.model('User', userSchema);


