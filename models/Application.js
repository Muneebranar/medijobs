import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  jobId: { type: String, required: true, index: true },
  jobTitle: { type: String, required: true },
  hospital: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  medicalLicenseId: { type: String, required: true, index: true },
  yearsExperience: { type: Number, default: 5 },
  currentInstitution: { type: String },
  resumeFileName: { type: String, default: 'Medical_CV.pdf' },
  coverNote: { type: String },
  appliedAt: { type: String, default: () => new Date().toISOString() },
  status: { 
    type: String, 
    enum: ['Under Review', 'MEC Screening', 'Interview Scheduled', 'Offer Extended', 'Archived'],
    default: 'Under Review',
    index: true
  },
  notes: { type: String }
}, {
  timestamps: true
});

export const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
