// Script to execute SQL migration against Supabase
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeMigration() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase credentials in environment');
    process.exit(1);
  }

  const sqlFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Use Supabase REST API to execute SQL
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    // Try direct SQL execution via postgres endpoint
    console.log('Trying direct SQL execution...');
    
    // Split SQL into statements and execute via management API
    const pgResponse = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!pgResponse.ok) {
      const error = await pgResponse.text();
      console.error('Migration failed:', error);
      console.log('\n--- MANUAL EXECUTION REQUIRED ---');
      console.log('Please run this SQL in your Supabase Dashboard SQL Editor:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Paste the contents of: supabase/migrations/001_initial_schema.sql');
      console.log('5. Click "Run"');
      process.exit(1);
    }
    
    const result = await pgResponse.json();
    console.log('Migration executed successfully!', result);
  } else {
    const result = await response.json();
    console.log('Migration executed successfully!', result);
  }
}

executeMigration().catch(console.error);
