import express from 'express';
import { getAllJobs, getJobById, createJob } from '../controllers/jobController.js';
import { getApplications, submitApplication, updateApplicationStatus, deleteApplication } from '../controllers/applicationController.js';
import { getCandidates, subscribeRecruiter } from '../controllers/candidateController.js';
import { getPlatformStats } from '../controllers/statsController.js';
import { verifyMedicalLicense } from '../controllers/licenseController.js';

const router = express.Router();

// Jobs Endpoints
router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJobById);
router.post('/jobs', createJob);

// Applications Endpoints
router.get('/applications', getApplications);
router.post('/applications', submitApplication);
router.patch('/applications/:id/status', updateApplicationStatus);
router.delete('/applications/:id', deleteApplication);

// Candidates & Subscriptions
router.get('/candidates', getCandidates);
router.post('/candidates/subscribe', subscribeRecruiter);

// Real-Time Medical License & NPI Registry Verification
router.get('/license/verify', verifyMedicalLicense);

// Platform & Database Health
router.get('/stats', getPlatformStats);

export default router;
