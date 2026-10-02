import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  recruiterEmail: { type: String, required: true },
  organizationName: { type: String, default: 'Hospital Partner' },
  planType: { type: String, default: 'Recruiter Pro Membership ($199/month)' },
  amount: { type: Number, default: 199 },
  status: { type: String, enum: ['active', 'canceled', 'trial'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  renewDate: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  }
}, {
  timestamps: true
});

export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
