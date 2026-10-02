import { Candidate } from '../models/Candidate.js';
import { Subscription } from '../models/Subscription.js';
import { seedCandidates } from '../seed/seedData.js';
import { getDBStatus } from '../config/db.js';

let inMemoryCandidates = [...seedCandidates];
let isSubscriptionActive = false;

export const getCandidates = async (req, res) => {
  const dbStatus = getDBStatus();
  const { specialty, search } = req.query;

  try {
    if (dbStatus.connected) {
      const filter = {};
      if (specialty) filter.specialty = new RegExp(specialty, 'i');
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ name: regex }, { title: regex }, { skills: regex }];
      }

      let candidates = await Candidate.find(filter).exec();
      if (candidates.length > 0) {
        // If subscription is active, un-blur
        if (isSubscriptionActive) {
          candidates = candidates.map(c => ({ ...c.toObject(), blurred: false }));
        }
        return res.json({ success: true, count: candidates.length, data: candidates });
      }
    }
  } catch (err) {
    console.warn('[Candidate API] MongoDB error:', err.message);
  }

  let filtered = inMemoryCandidates.map(c => ({
    ...c,
    blurred: !isSubscriptionActive
  }));

  if (specialty) {
    filtered = filtered.filter(c => c.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }

  res.json({ success: true, count: filtered.length, data: filtered });
};

export const subscribeRecruiter = async (req, res) => {
  try {
    const { recruiterEmail, organizationName } = req.body;
    isSubscriptionActive = true;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const sub = new Subscription({
        id: `SUB-${Date.now()}`,
        recruiterEmail: recruiterEmail || 'recruiter@healthsystem.org',
        organizationName: organizationName || 'Accredited Hospital Network',
        status: 'active',
        amount: 199
      });
      await sub.save();
    }

    res.json({
      success: true,
      message: 'Recruiter Pro Membership activated successfully ($199/month).',
      unlocked: true
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Subscription activation failed', error: error.message });
  }
};
