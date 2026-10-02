import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true, index: true },
  hospital: { type: String, required: true, index: true },
  hospitalLogo: { type: String, default: 'MED' },
  hospitalType: { type: String, default: 'Academic Medical Center (Magnet)' },
  department: { type: String, required: true, index: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['clinical-doctors', 'nursing', 'diagnostics', 'pharmacy', 'allied-health', 'hospital-admin'],
    index: true 
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'United States' },
    isRemoteOrHybrid: { type: Boolean, default: false }
  },
  shiftType: { 
    type: String, 
    enum: ['Day Shift (8h)', 'Night Shift (12h)', 'Rotational (Day/Night)', 'On-Call & Weekend', 'Flexible Schedule'],
    default: 'Day Shift (8h)'
  },
  employmentType: { 
    type: String, 
    enum: ['Full-Time', 'Part-Time', 'Locum Tenens', 'PRN / Per Diem'],
    default: 'Full-Time'
  },
  experienceLevel: { 
    type: String, 
    enum: ['Medical Resident / Fellow', 'Junior Attending', 'Mid-Career Specialist', 'Senior Consultant / Department Head'],
    default: 'Mid-Career Specialist'
  },
  salary: {
    min: { type: Number, required: true, index: true },
    max: { type: Number, required: true },
    period: { type: String, enum: ['year', 'hour'], default: 'year' },
    currency: { type: String, default: 'USD' }
  },
  signOnBonus: { type: String },
  urgent: { type: Boolean, default: false, index: true },
  verifiedHospital: { type: Boolean, default: true },
  tier: { type: String, enum: ['standard', 'featured', 'urgent'], default: 'standard', index: true },
  postedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  applicantCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  licensuresRequired: [{ type: String }],
  benefits: [{ type: String }],
  workingHours: { type: String },
  aboutHospital: { type: String },
  contactEmail: { type: String, required: true },
  visaSponsorship: { type: Boolean, default: true },
  malpracticeCoverage: { type: String, default: 'Lifetime Tail Included ($1M / $3M)' },
  cmeAllowance: { type: String, default: '$4,500/year' }
}, {
  timestamps: true
});

export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
