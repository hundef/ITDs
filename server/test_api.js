~import http from 'http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Full-Stack API & Database Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  // 1. Health check
  try {
    const health = await makeRequest({ host: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
    if (health.status === 200 && health.data.status === 'online') {
      console.log('✅ 1. API Health Check: OK');
      passed++;
    } else {
      console.error('❌ 1. API Health Check Failed:', health);
      failed++;
    }
  } catch (e) {
    console.error('❌ 1. API Health Check Error:', e.message);
    failed++;
  }

  // 2. Demo Login & Auth Token
  let token = '';
  try {
    const authRes = await makeRequest({
      host: '127.0.0.1',
      port: 5000,
      path: '/api/auth/demo-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'super_admin' });

    if (authRes.status === 200 && authRes.data.token) {
      token = authRes.data.token;
      console.log(`✅ 2. Auth Demo Login (Super Admin): OK (User: ${authRes.data.user.name}, Role: ${authRes.data.user.role})`);
      passed++;
    } else {
      console.error('❌ 2. Auth Demo Login Failed:', authRes);
      failed++;
    }
  } catch (e) {
    console.error('❌ 2. Auth Demo Login Error:', e.message);
    failed++;
  }

  // 3. Projects Catalog & Hydration
  let testProjectSlug = 'apexcore-ai-platform';
  try {
    const pRes = await makeRequest({ host: '127.0.0.1', port: 5000, path: '/api/projects?limit=10', method: 'GET' });
    if (pRes.status === 200 && pRes.data.projects && pRes.data.projects.length > 0) {
      testProjectSlug = pRes.data.projects[0].slug;
      console.log(`✅ 3. Projects Catalog: OK (${pRes.data.projects.length} projects retrieved)`);
      passed++;
    } else {
      console.error('❌ 3. Projects Catalog Failed:', pRes);
      failed++;
    }
  } catch (e) {
    console.error('❌ 3. Projects Catalog Error:', e.message);
    failed++;
  }

  // 4. Project Details with Workflow & Features
  try {
    const pDetail = await makeRequest({ host: '127.0.0.1', port: 5000, path: `/api/projects/${testProjectSlug}`, method: 'GET' });
    if (pDetail.status === 200 && pDetail.data.project) {
      const p = pDetail.data.project;
      console.log(`✅ 4. Project Detail Hydration: OK (${p.name || p.title}, ${p.features?.length || 0} features, ${p.workflows?.length || 0} workflow steps)`);
      passed++;
    } else {
      console.error('❌ 4. Project Detail Failed:', pDetail);
      failed++;
    }
  } catch (e) {
    console.error('❌ 4. Project Detail Error:', e.message);
    failed++;
  }

  // 5. Submit Contact Inquiry
  try {
    const inqRes = await makeRequest({
      host: '127.0.0.1',
      port: 5000,
      path: '/api/inquiries',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      full_name: 'Dr. Evelyn Vance',
      email: 'evelyn.vance@quantumtech.com',
      company: 'Quantum Dynamics',
      phone: '+1 (555) 890-1234',
      subject_category: 'AI & Machine Learning',
      message: 'Interested in enterprise AI pipeline deployment and cloud orchestration.'
    });

    const inquiryId = inqRes.data.inquiry?.id || inqRes.data.data?.id || inqRes.data.id;
    if ((inqRes.status === 201 || inqRes.status === 200) && inqRes.data.success) {
      console.log(`✅ 5. Public Contact Inquiry Submission: OK (Inquiry ID: ${inquiryId})`);
      passed++;
    } else {
      console.error('❌ 5. Contact Inquiry Failed:', inqRes);
      failed++;
    }
  } catch (e) {
    console.error('❌ 5. Contact Inquiry Error:', e.message);
    failed++;
  }

  // 6. Admin Inquiries Inbox & Status Patch
  try {
    const inbox = await makeRequest({
      host: '127.0.0.1',
      port: 5000,
      path: '/api/inquiries',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (inbox.status === 200 && inbox.data.inquiries && inbox.data.inquiries.length > 0) {
      console.log(`✅ 6. Admin Inquiries Inbox: OK (${inbox.data.inquiries.length} inquiries in stream)`);
      passed++;
    } else {
      console.error('❌ 6. Admin Inquiries Inbox Failed:', inbox);
      failed++;
    }
  } catch (e) {
    console.error('❌ 6. Admin Inquiries Inbox Error:', e.message);
    failed++;
  }

  // 7. Dashboard Overview KPIs & Charts
  try {
    const stats = await makeRequest({
      host: '127.0.0.1',
      port: 5000,
      path: '/api/stats/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (stats.status === 200 && stats.data.kpis) {
      console.log(`✅ 7. Admin Dashboard KPIs & Charts: OK (${stats.data.kpis.totalProjects} Projects, ${stats.data.kpis.completedProjects} Completed, ${stats.data.kpis.totalServices} Services, ${stats.data.kpis.totalInquiries} Inquiries)`);
      passed++;
    } else {
      console.error('❌ 7. Admin Dashboard Failed:', stats);
      failed++;
    }
  } catch (e) {
    console.error('❌ 7. Admin Dashboard Error:', e.message);
    failed++;
  }

  // 8. Website Settings CMS
  try {
    const settings = await makeRequest({ host: '127.0.0.1', port: 5000, path: '/api/settings', method: 'GET' });
    if (settings.status === 200 && settings.data.settings?.company_name) {
      console.log(`✅ 8. Website CMS Settings: OK (Company: ${settings.data.settings.company_name}, Slogan: "${settings.data.settings.company_slogan}")`);
      passed++;
    } else {
      console.error('❌ 8. Website Settings Failed:', settings);
      failed++;
    }
  } catch (e) {
    console.error('❌ 8. Website Settings Error:', e.message);
    failed++;
  }

  // 9. Brochure Management CRUD Test
  let createdBrochureId = null;
  try {
    // Get an existing project ID first
    const projectsRes = await makeRequest({ host: '127.0.0.1', port: 5000, path: '/api/projects?limit=1', method: 'GET' });
    const targetProjectId = projectsRes.data?.projects?.[0]?.id;

    if (!targetProjectId) {
      console.error('❌ No project found to attach brochure to.');
      failed++;
    } else {
      // 9a. Create Brochure with PDF & Cover Image
      const newBrochure = await makeRequest({
        host: '127.0.0.1',
        port: 5000,
        path: '/api/brochures',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        project_id: targetProjectId,
        title: 'Automated Test Brochure Whitepaper',
        description: 'Comprehensive specifications and architectural overview.',
        file_type: 'pdf',
        file_url: '/uploads/sample-whitepaper.pdf',
        thumbnail_url: '/uploads/sample-cover.png',
        file_size_mb: 3.45,
        display_order: 1
      });

      if (newBrochure.status === 201 && newBrochure.data.success && newBrochure.data.brochure) {
        createdBrochureId = newBrochure.data.brochure.id;
        console.log(`✅ 9a. Create Brochure (PDF + Cover Image): OK (ID: ${createdBrochureId}, Project: ${targetProjectId})`);
        passed++;
      } else {
        console.error('❌ 9a. Create Brochure Failed:', newBrochure);
        failed++;
      }

      // 9b. Fetch Brochures for Project
      const getBrochures = await makeRequest({
        host: '127.0.0.1',
        port: 5000,
        path: `/api/brochures?projectId=${targetProjectId}`,
        method: 'GET'
      });

      if (getBrochures.status === 200 && getBrochures.data.success && Array.isArray(getBrochures.data.data)) {
        console.log(`✅ 9b. Fetch Project Brochures: OK (${getBrochures.data.data.length} brochures retrieved)`);
        passed++;
      } else {
        console.error('❌ 9b. Fetch Project Brochures Failed:', getBrochures);
        failed++;
      }

      // 9c. Update Brochure Information & Cover
      if (createdBrochureId) {
        const updateRes = await makeRequest({
          host: '127.0.0.1',
          port: 5000,
          path: `/api/brochures/${createdBrochureId}`,
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }, {
          title: 'Updated Test Brochure Whitepaper v2',
          description: 'Updated description with new specs.',
          thumbnail_url: '/uploads/sample-cover-v2.png'
        });

        if (updateRes.status === 200 && updateRes.data.success && updateRes.data.brochure.title.includes('v2')) {
          console.log(`✅ 9c. Edit Brochure Information & Cover Image: OK`);
          passed++;
        } else {
          console.error('❌ 9c. Edit Brochure Failed:', updateRes);
          failed++;
        }

        // 9d. Delete Brochure
        const delRes = await makeRequest({
          host: '127.0.0.1',
          port: 5000,
          path: `/api/brochures/${createdBrochureId}`,
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (delRes.status === 200 && delRes.data.success) {
          console.log(`✅ 9d. Delete Brochure: OK`);
          passed++;
        } else {
          console.error('❌ 9d. Delete Brochure Failed:', delRes);
          failed++;
        }
      }
    }
  } catch (e) {
    console.error('❌ 9. Brochure CRUD Test Error:', e.message);
    failed++;
  }

  console.log(`\n====================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`====================================================\n`);
}

runTests();
