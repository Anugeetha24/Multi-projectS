const { spawn } = require('child_process');
const path = require('path');

async function runTest() {
  console.log('--- Starting Integration Test ---');

  const PORT = 5055;
  const env = {
    ...process.env,
    PORT: PORT.toString(),
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || ''
  };

  const serverPath = path.join(__dirname, 'server.js');
  console.log(`Spawning server at: ${serverPath} on port ${PORT}`);

  const server = spawn('node', [serverPath], { env });

  let serverStdout = '';

  await new Promise((resolve, reject) => {
    const startupTimeout = setTimeout(() => {
      reject(new Error('Server failed to start within 20 seconds.'));
    }, 20000);

    server.stdout.on('data', (data) => {
      const out = data.toString();
      serverStdout += out;
      console.log(`[Server Stdout]: ${out.trim()}`);

      if (out.includes('Server is running on port')) {
        clearTimeout(startupTimeout);
        resolve();
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`[Server Stderr]: ${data.toString().trim()}`);
    });
  });

  const baseUrl = `http://localhost:${PORT}/api`;
  let token = '';
  let studentId = null;

  try {
    console.log('\n--- Step 1: Registering Test Student ---');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: `test_${Date.now()}@example.com`,
        password: 'Password123!',
        target_role: 'Software Engineer'
      })
    });

    if (!registerRes.ok) {
      const errText = await registerRes.text();
      throw new Error(`Registration failed: ${errText}`);
    }

    const regData = await registerRes.json();
    token = regData.token;
    studentId = regData.student.id;
    console.log(`Student registered. ID: ${studentId}, Token: [EXISTS]`);

    console.log('\n--- Step 2: Submitting Resume for Audit ---');
    const resumeText = 'Experienced software engineer skilled in JavaScript, Node.js, and SQL databases. Looking for senior roles.';

    const reviewRes = await fetch(`${baseUrl}/agents/resume-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ resumeText })
    });

    if (!reviewRes.ok) {
      const errText = await reviewRes.text();
      throw new Error(`API Call returned non-200: ${errText}`);
    }

    const reviewData = await reviewRes.json();
    console.log('\n--- Step 3: API Call Output ---');
    console.log(JSON.stringify(reviewData, null, 2));

    console.log('\n--- Step 4: Confirming Database Write ---');
    const { ResumeReport } = require('./models');

    const reportRow = await ResumeReport.findOne({
      where: { student_id: studentId },
      order: [['created_at', 'DESC']]
    });

    if (reportRow) {
      console.log('Database Write Confirmed: YES');
      console.log('SQL DB Row inserted:');
      console.log(JSON.stringify({
        id: reportRow.id,
        student_id: reportRow.student_id,
        ats_score: reportRow.ats_score,
        missing_sections: reportRow.missing_sections,
        suggestions: reportRow.suggestions,
        created_at: reportRow.created_at
      }, null, 2));
    } else {
      console.log('Database Write Confirmed: NO (No row found in resume_reports)');
    }
  } catch (err) {
    console.error('Test execution failed:', err.message);
  } finally {
    console.log('\nTerminating local server process...');
    server.kill();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit(0);
  }
}

runTest();