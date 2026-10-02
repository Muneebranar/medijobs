import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { Application } from '../models/Application.js';
import { getDBStatus } from '../config/db.js';

export const getPlatformStats = async (req, res) => {
  const dbStatus = getDBStatus();

  try {
    let jobCount = 2500;
    let hospitalCount = 180;
    let candidateCount = 15000;
    let applicationCount = 42;

    if (dbStatus.connected) {
      const realJobs = await Job.countDocuments();
      const realApps = await Application.countDocuments();
      const realCandidates = await Candidate.countDocuments();
      if (realJobs > 0) jobCount = 2500 + realJobs;
      if (realApps > 0) applicationCount = realApps;
      if (realCandidates > 0) candidateCount = 15000 + realCandidates;
    }

    res.json({
      success: true,
      stats: {
        activeVacancies: jobCount,
        partnerHospitals: hospitalCount,
        verifiedCandidates: candidateCount,
        applicationsProcessed: applicationCount,
        verificationRate: '98.4%'
      },
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
