import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { Application } from '../models/Application.js';
import { Subscription } from '../models/Subscription.js';
import { connectDB } from '../config/db.js';

async function main() {
  const action = process.argv[2] || 'status';
  console.log(`\n=======================================================`);
  console.log(`🏥 MediJobs Database Manager: [Action: ${action.toUpperCase()}]`);
  console.log(`=======================================================`);

  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Failed to connect to MongoDB Atlas!');
    process.exit(1);
  }

  if (action === 'status') {
    const jobCount = await Job.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    const appCount = await Application.countDocuments();
    const subCount = await Subscription.countDocuments();

    console.log(`\n📊 DATABASE SUMMARY:`);
    console.log(`   - Jobs:          ${jobCount} records`);
    console.log(`   - Candidates:    ${candidateCount} records`);
    console.log(`   - Applications:  ${appCount} records`);
    console.log(`   - Subscriptions: ${subCount} records`);

    if (appCount > 0) {
      const apps = await Application.find().lean();
      console.log(`\n📋 APPLICATIONS IN DB:`);
      apps.forEach((a, i) => {
        console.log(`   ${i + 1}. [${a.id}] ${a.fullName} (${a.email}) -> Job: "${a.jobTitle}" [Status: ${a.status}]`);
      });
    }

    const jobs = await Job.find().lean();
    console.log(`\n🏥 INSTITUTIONAL JOBS:`);
    jobs.forEach((j, i) => {
      console.log(`   ${i + 1}. [${j.id}] ${j.title} @ ${j.hospital} (${j.location?.city}, ${j.location?.state}) [${j.category}]`);
    });
  } else if (action === 'clean-dummy') {
    console.log('\n🧹 Cleaning test/dummy applications from MongoDB...');
    const result = await Application.deleteMany({
      $or: [
        { email: /@medtest\.com/i },
        { jobId: 'test-job-001' },
        { fullName: /test/i },
        { email: /test/i }
      ]
    });
    console.log(`✅ Removed ${result.deletedCount} dummy test application(s) from MongoDB.`);

    // Also check if any job applicantCount needs sync
    const jobs = await Job.find();
    for (const job of jobs) {
      const count = await Application.countDocuments({ jobId: job.id });
      if (job.applicantCount !== count) {
        job.applicantCount = count;
        await job.save();
      }
    }
    console.log('✅ Synchronized job applicant counts.');
  } else if (action === 'clear-applications') {
    console.log('\n🧹 Clearing all applications to prepare clean production state...');
    const result = await Application.deleteMany({});
    console.log(`✅ Purged ${result.deletedCount} application(s). Database applications collection is now pristine.`);
    await Job.updateMany({}, { applicantCount: 0 });
    console.log('✅ Reset all applicant counts on jobs to 0.');
  }

  await mongoose.disconnect();
  console.log('\n✅ Disconnected cleanly from MongoDB Atlas.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error running dbManager:', err);
  process.exit(1);
});
