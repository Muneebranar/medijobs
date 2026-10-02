import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  avatar: { type: String },
  specialty: { type: String, required: true, index: true },
  credentials: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseStatus: { type: String, enum: ['Verified Active', 'Pending Renewal'], default: 'Verified Active' },
  yearsExperience: { type: Number, required: true },
  currentLocation: { type: String },
  availability: { type: String, default: 'Immediate (2 weeks)' },
  desiredSalary: { type: String },
  skills: [{ type: String }],
  education: { type: String },
  blurred: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
