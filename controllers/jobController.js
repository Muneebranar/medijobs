import { Job } from '../models/Job.js';
import { seedJobs } from '../seed/seedData.js';
import { getDBStatus } from '../config/db.js';

// In-memory persistent cache fallback if MongoDB is offline
let inMemoryJobs = [...seedJobs];

export const getAllJobs = async (req, res) => {
  const dbStatus = getDBStatus();

  try {
    if (dbStatus.connected) {
      const { 
        search, 
        category, 
        department, 
        shiftType, 
        employmentType, 
        minSalary, 
        urgent, 
        verified, 
        sort 
      } = req.query;

      const filter = {};

      if (category) filter.category = category;
      if (department) filter.department = department;
      if (shiftType) filter.shiftType = shiftType;
      if (employmentType) filter.employmentType = employmentType;
      if (urgent === 'true') filter.urgent = true;
      if (verified === 'true') filter.verifiedHospital = true;
      if (minSalary && Number(minSalary) > 0) {
        filter['salary.min'] = { $gte: Number(minSalary) };
      }

      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { title: regex },
          { hospital: regex },
          { department: regex },
          { description: regex },
          { licensuresRequired: regex }
        ];
      }

      let query = Job.find(filter);

      if (sort === 'highest-salary') query = query.sort({ 'salary.min': -1 });
      else if (sort === 'urgent-first') query = query.sort({ urgent: -1, postedDate: -1 });
      else if (sort === 'most-popular') query = query.sort({ applicantCount: -1 });
      else query = query.sort({ postedDate: -1 });

      const jobs = await query.exec();
      return res.json({ success: true, count: jobs.length, source: 'mongodb', data: jobs });
    }
  } catch (error) {
    console.warn('[Jobs API] MongoDB query failed, falling back to memory cache:', error.message);
  }

  // Resilient Fallback to in-memory store
  let filtered = [...inMemoryJobs];
  const { search, category, shiftType, minSalary, urgent, sort } = req.query;

  if (category) filtered = filtered.filter(j => j.category === category);
  if (shiftType) filtered = filtered.filter(j => j.shiftType === shiftType);
  if (urgent === 'true') filtered = filtered.filter(j => j.urgent);
  if (minSalary && Number(minSalary) > 0) {
    filtered = filtered.filter(j => (j.salary.period === 'hour' ? j.salary.min * 2080 : j.salary.min) >= Number(minSalary));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(q) ||
      j.hospital.toLowerCase().includes(q) ||
      j.department.toLowerCase().includes(q)
    );
  }

  if (sort === 'highest-salary') filtered.sort((a, b) => b.salary.min - a.salary.min);
  else if (sort === 'urgent-first') filtered.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  else filtered.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

  res.json({ success: true, count: filtered.length, source: 'in-memory-fallback', data: filtered });
};

export const getJobById = async (req, res) => {
  const { id } = req.params;
  const dbStatus = getDBStatus();

  try {
    if (dbStatus.connected) {
      const job = await Job.findOne({ id });
      if (job) {
        return res.json({ success: true, data: job });
      }
    }
  } catch (err) {
    console.warn('[Job Detail API] MongoDB fetch error:', err.message);
  }

  const job = inMemoryJobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ success: false, message: 'Medical vacancy not found' });
  }
  res.json({ success: true, source: 'in-memory', data: job });
};

export const createJob = async (req, res) => {
  try {
    const jobData = req.body;
    if (!jobData.id) {
      jobData.id = `med-job-${Date.now()}`;
    }

    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const newJob = new Job(jobData);
      await newJob.save();
      console.log(`[MongoDB] Created new job listing in MongoDB: ${newJob.title}`);
    }

    // Always keep memory fallback synced
    inMemoryJobs.unshift(jobData);

    res.status(201).json({
      success: true,
      message: 'Medical vacancy published successfully',
      data: jobData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create medical vacancy', error: error.message });
  }
};
