import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { getDBStatus } from '../config/db.js';

// Production in-memory buffer: starts empty (no dummy data)
let inMemoryApplications = [];

export const getApplications = async (req, res) => {
  const dbStatus = getDBStatus();

  try {
    if (dbStatus.connected) {
      const filter = {};
      if (req.query.jobId) {
        filter.jobId = req.query.jobId;
      }
      const apps = await Application.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: apps.length, source: 'mongodb', data: apps });
    }
  } catch (err) {
    console.warn('[Applications API] MongoDB fetch warning:', err.message);
  }

  let filtered = [...inMemoryApplications];
  if (req.query.jobId) {
    filtered = filtered.filter(a => a.jobId === req.query.jobId);
  }
  res.json({ success: true, count: filtered.length, source: 'in-memory', data: filtered });
};

export const submitApplication = async (req, res) => {
  try {
    const appData = { ...req.body };
    if (!appData.id) {
      appData.id = `MED-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!appData.appliedAt) {
      appData.appliedAt = new Date().toISOString();
    }
    if (!appData.status) {
      appData.status = 'Under Review';
    }

    // Resilient fallback for jobTitle and hospital if not explicitly provided
    if (!appData.jobTitle || !appData.hospital) {
      try {
        const targetJob = await Job.findOne({ id: appData.jobId });
        if (targetJob) {
          if (!appData.jobTitle) appData.jobTitle = targetJob.title;
          if (!appData.hospital) appData.hospital = targetJob.hospital;
        } else {
          if (!appData.jobTitle) appData.jobTitle = 'Clinical Specialist Position';
          if (!appData.hospital) appData.hospital = 'Partner Healthcare System';
        }
      } catch (e) {
        if (!appData.jobTitle) appData.jobTitle = 'Clinical Specialist Position';
        if (!appData.hospital) appData.hospital = 'Partner Healthcare System';
      }
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const newApp = new Application(appData);
      await newApp.save();

      // Increment applicantCount on Job
      await Job.findOneAndUpdate(
        { id: appData.jobId },
        { $inc: { applicantCount: 1 } }
      );
      console.log(`[MongoDB] Registered application ${newApp.id} for job ${appData.jobId}`);
      inMemoryApplications.unshift(newApp.toObject());
      return res.status(201).json({
        success: true,
        message: 'Medical dossier transmitted successfully',
        data: newApp
      });
    }

    inMemoryApplications.unshift(appData);
    res.status(201).json({
      success: true,
      message: 'Medical dossier transmitted successfully (in-memory buffer)',
      data: appData
    });
  } catch (error) {
    console.error('[Application Submission Error]:', error);
    res.status(500).json({ success: false, message: 'Application transmission failed', error: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ id }, { _id: id }] } : { id };
      const updated = await Application.findOneAndUpdate(
        query,
        { $set: { status, ...(notes && { notes }) } },
        { new: true }
      );
      if (updated) {
        return res.json({ success: true, message: 'Status updated', data: updated });
      }
    }

    const appIndex = inMemoryApplications.findIndex(a => a.id === id || a._id === id);
    if (appIndex !== -1) {
      inMemoryApplications[appIndex].status = status;
      if (notes) inMemoryApplications[appIndex].notes = notes;
      return res.json({ success: true, message: 'Status updated', data: inMemoryApplications[appIndex] });
    }

    res.status(404).json({ success: false, message: 'Application not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ id }, { _id: id }] } : { id };
      const deleted = await Application.findOneAndDelete(query);
      if (deleted) {
        await Job.findOneAndUpdate({ id: deleted.jobId }, { $inc: { applicantCount: -1 } });
        return res.json({ success: true, message: 'Application deleted', data: deleted });
      }
    }

    const idx = inMemoryApplications.findIndex(a => a.id === id || a._id === id);
    if (idx !== -1) {
      const removed = inMemoryApplications.splice(idx, 1)[0];
      return res.json({ success: true, message: 'Application deleted', data: removed });
    }

    res.status(404).json({ success: false, message: 'Application not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete application', error: error.message });
  }
};

