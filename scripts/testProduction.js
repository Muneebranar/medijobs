const fetchFn = fetch;

async function runProductionTests() {
  const BASE_URL = 'http://localhost:5000';
  const results = { passed: [], failed: [] };

  function record(title, condition, detail = '') {
    if (condition) {
      results.passed.push(title);
      console.log(`  ✅ [PASS] ${title}`);
    } else {
      results.failed.push({ title, detail });
      console.error(`  ❌ [FAIL] ${title} -> ${detail}`);
    }
  }

  console.log(`\n=======================================================`);
  console.log(`🚀 RUNNING MEDIJOBS PRODUCTION & DATABASE TEST SUITE`);
  console.log(`=======================================================\n`);

  // 1. Health check & MongoDB Atlas connection
  try {
    const res = await fetchFn(`${BASE_URL}/api/health`);
    const health = await res.json();
    record('1. Server responds to /api/health (200 OK)', res.status === 200);
    record('2. MongoDB Atlas status is connected (ReadyState: 1)', health.database?.connected === true && health.database?.readyState === 1);
    record('3. Connected to target database "medijobs"', health.database?.dbName === 'medijobs');
    record('4. Connected to live MongoDB Atlas shard cluster', health.database?.host?.includes('mongodb.net'));
  } catch (e) {
    record('1. Server responds to /api/health', false, e.message);
  }

  // 2. Jobs API verification
  try {
    const res = await fetchFn(`${BASE_URL}/api/jobs`);
    const data = await res.json();
    record('5. Jobs endpoint /api/jobs returns HTTP 200', res.status === 200);
    record('6. Jobs data source is MongoDB Atlas', data.source === 'mongodb');
    record('7. Institutional jobs loaded from database (count >= 6)', data.count >= 6 && Array.isArray(data.data));
    record('8. Job record contains required institutional schema', !!data.data[0]?.title && !!data.data[0]?.hospital && !!data.data[0]?.salary);
  } catch (e) {
    record('5. Jobs endpoint verification', false, e.message);
  }

  // 3. Candidates API verification
  try {
    const res = await fetchFn(`${BASE_URL}/api/candidates`);
    const data = await res.json();
    record('9. Candidates endpoint /api/candidates returns HTTP 200', res.status === 200);
    record('10. Pre-screened candidates returned from database', data.count >= 3 && Array.isArray(data.data));
    record('11. Candidate record contains clinical profile & license', !!data.data[0]?.name && !!data.data[0]?.specialty && !!data.data[0]?.licenseNumber);
  } catch (e) {
    record('9. Candidates endpoint verification', false, e.message);
  }

  // 4. Applications API verification (Clean state check)
  try {
    const res = await fetchFn(`${BASE_URL}/api/applications`);
    const data = await res.json();
    record('12. Applications endpoint /api/applications returns HTTP 200', res.status === 200);
    record('13. Applications source is MongoDB Atlas', data.source === 'mongodb');
    record('14. Applications list is an array (clean production start)', Array.isArray(data.data));
  } catch (e) {
    record('12. Applications endpoint verification', false, e.message);
  }

  // 5. Test Live Application Submission into MongoDB Atlas
  let testAppId = null;
  try {
    const postRes = await fetchFn(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: 'med-job-101',
        jobTitle: 'Chief Interventional Cardiologist',
        hospital: 'Johns Hopkins Medicine',
        fullName: 'Dr. Automated Verification Specialist',
        email: 'automated.verify@medijobs.io',
        phone: '+1 (555) 902-8172',
        medicalLicenseId: 'PMC-MD-892401',
        yearsExperience: 12,
        currentInstitution: 'Massachusetts General Hospital',
        coverNote: 'Automated end-to-end integration test dossier.',
        resumeFileName: 'Automated_Verification_CV.pdf'
      })
    });
    const postData = await postRes.json();
    record('15. Submitting application persists to MongoDB (HTTP 201)', postRes.status === 201 && postData.success === true);
    testAppId = postData.data?.id || postData.data?._id;
    record('16. Application received unique clinical ID', !!testAppId);

    // Verify it now exists in database
    const verifyRes = await fetchFn(`${BASE_URL}/api/applications`);
    const verifyData = await verifyRes.json();
    const found = verifyData.data?.find(a => a.id === testAppId || a._id === testAppId);
    record('17. Newly submitted application retrieved from MongoDB Atlas', !!found && found.fullName === 'Dr. Automated Verification Specialist');

    // Test Status Update in MongoDB
    if (found) {
      const patchRes = await fetchFn(`${BASE_URL}/api/applications/${found.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'MEC Screening', notes: 'Verified credentials automatically.' })
      });
      const patchData = await patchRes.json();
      record('18. Updating candidate status in MongoDB (HTTP 200)', patchRes.status === 200 && patchData.data?.status === 'MEC Screening');
    }
  } catch (e) {
    record('15. Application submission test', false, e.message);
  }

  // 6. Clean up the automated test application from MongoDB via DELETE endpoint
  try {
    if (testAppId) {
      const delRes = await fetchFn(`${BASE_URL}/api/applications/${testAppId}`, { method: 'DELETE' });
      const delData = await delRes.json();
      record('19. Automated test application cleaned up from database', delRes.status === 200 && delData.success === true);
    }
  } catch (e) {
    record('19. Clean up test application', false, e.message);
  }

  // 7. Verify Live Medical License Verification Engine
  try {
    // CMS NPPES Live NPI
    const npiRes = await fetchFn(`${BASE_URL}/api/license/verify?query=1821161191`);
    const npiData = await npiRes.json();
    record('20. Live US CMS NPPES NPI 1821161191 returns real physician', npiData.isLiveRealData === true && npiData.providerName?.includes('SMITH'));

    // State License Suffix Pattern (e.g. 13242-S)
    const suffixRes = await fetchFn(`${BASE_URL}/api/license/verify?query=13242-S`);
    const suffixData = await suffixRes.json();
    record('21. State Suffix License (13242-S) recognized as Surgeon', suffixData.primarySpecialty?.includes('Surgeon') && !!suffixData.howToVerifyLive);

    // Pakistan PMDC
    const pmdcRes = await fetchFn(`${BASE_URL}/api/license/verify?query=PMC-MD-892401`);
    const pmdcData = await pmdcRes.json();
    record('22. Pakistan PMDC license validated with board portal link', pmdcData.board?.includes('PMDC') && pmdcData.registryOfficialUrl?.includes('pmdc.pk'));

    // UK GMC
    const gmcRes = await fetchFn(`${BASE_URL}/api/license/verify?query=GMC-7129034`);
    const gmcData = await gmcRes.json();
    record('23. UK GMC license validated with LRMP register link', gmcData.board?.includes('GMC') && gmcData.registryOfficialUrl?.includes('gmc-uk.org'));
  } catch (e) {
    record('20. License verification engine tests', false, e.message);
  }

  // 8. Verify Production Static Frontend Serving (Single-Port Hosting)
  try {
    const rootRes = await fetchFn(`${BASE_URL}/`);
    const rootText = await rootRes.text();
    record('24. Production server serves built frontend bundle on /', rootRes.status === 200 && rootText.toLowerCase().includes('<!doctype html'));
    record('25. Frontend contains MediJobs root mount point (<div id="root">)', rootText.includes('id="root"'));
  } catch (e) {
    record('24. Production frontend serving', false, e.message);
  }

  // Print Summary
  console.log(`\n=======================================================`);
  console.log(`📊 PRODUCTION TEST SUMMARY:`);
  console.log(`   Passed: ${results.passed.length} / 25 tests`);
  console.log(`   Failed: ${results.failed.length} / 25 tests`);
  console.log(`=======================================================\n`);

  if (results.failed.length === 0) {
    console.log(`🎉 100% PRODUCTION READY! ALL 25 TESTS PASSED WITH ZERO ERRORS.\n`);
    process.exit(0);
  } else {
    console.error(`❌ Some tests failed. Please review the output above.`);
    process.exit(1);
  }
}

runProductionTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
