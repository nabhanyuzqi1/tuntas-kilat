// Simple script to test Supabase connection
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Debug: Print environment variables (without exposing full key)
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key: ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined'}`);

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase URL and Key are required.');
  console.error('Please make sure you have set the following environment variables in your .env file:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialize Supabase client
console.log('🔄 Initializing Supabase client...');
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
};
const supabase = createClient(supabaseUrl, supabaseKey, options);
console.log('✅ Supabase client initialized');

async function testConnection() {
  console.log('\n🔄 Testing Supabase connection...');
  
  try {
    // First, test a simple health check
    console.log('🔄 Testing basic connectivity...');
    const { error: healthError } = await supabase.rpc('get_service_role');
    
    if (healthError) {
      console.log('⚠️ Basic connectivity test failed, trying alternative approach...');
    } else {
      console.log('✅ Basic connectivity test passed');
    }
    
    // Try to get Supabase project details
    console.log('\n🔄 Fetching Supabase project info...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Successfully connected to Supabase REST API');
        const data = await response.json();
        console.log('📊 Available endpoints:', Object.keys(data).length);
      } else {
        console.error('❌ Failed to connect to Supabase REST API:', response.status, response.statusText);
      }
    } catch (fetchError) {
      console.error('❌ Network error when connecting to Supabase REST API:', fetchError.message);
    }
    
    // Try to query the database
    console.log('\n🔄 Testing database query...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      console.error('Error details:', error.details || 'No additional details');
      console.error('Error hint:', error.hint || 'No hint available');
      console.error('Error code:', error.code || 'No error code');
      
      // Check if the table exists
      console.log('\n🔄 Checking if tables exist...');
      const { data: tables, error: tablesError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (tablesError) {
        console.error('❌ Could not check tables:', tablesError.message);
      } else if (tables && tables.length > 0) {
        console.log('📊 Available tables:', tables.map(t => t.tablename).join(', '));
      } else {
        console.log('⚠️ No tables found in the public schema');
      }
      
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`📊 Retrieved ${data.length} user(s) from the database.`);
    
    // Test each table
    const tables = ['users', 'services', 'workers', 'orders', 'addresses', 'promotions', 'conversations'];
    console.log('\n🔍 Testing access to tables:');
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Error accessing table '${table}': ${error.message}`);
          console.error(`   Error code: ${error.code}, Details: ${error.details || 'None'}`);
        } else {
          console.log(`✅ Table '${table}' is accessible.`);
        }
      } catch (err) {
        console.error(`❌ Error accessing table '${table}': ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Failed to connect to Supabase:');
    console.error('Error message:', error.message || 'No error message');
    console.error('Error code:', error.code || 'No error code');
    console.error('Error details:', error.details || 'No details available');
    
    // Check if it's a "relation does not exist" error
    if (error.code === '42P01') {
      console.error('\n⚠️ The database tables do not exist yet!');
      console.error('You need to create the required tables in your Supabase project.');
      
      // Check if the SQL setup file exists
      const sqlFilePath = path.join(process.cwd(), 'setup-supabase-tables.sql');
      if (fs.existsSync(sqlFilePath)) {
        console.log('\n📋 Found setup-supabase-tables.sql file.');
        console.log('To create the tables:');
        console.log('1. Log in to your Supabase dashboard at https://app.supabase.com/');
        console.log('2. Select your project');
        console.log('3. Go to the SQL Editor in the left sidebar');
        console.log('4. Create a new query');
        console.log('5. Copy and paste the contents of setup-supabase-tables.sql into the editor');
        console.log('6. Click "Run" to execute the script');
        console.log('\nAfter creating the tables, run this test script again.');
      } else {
        console.log('\nPlease follow the instructions in SUPABASE-SETUP.md to create the required tables.');
      }
    } else {
      // Check if it's a network issue
      try {
        console.log('\n🔄 Testing network connectivity to Supabase URL...');
        const response = await fetch(supabaseUrl);
        console.log(`Network response: ${response.status} ${response.statusText}`);
      } catch (networkError) {
        console.error('❌ Network connectivity test failed:', networkError.message);
        console.error('This suggests a network issue or the Supabase project URL is incorrect.');
      }
    }
    
    process.exit(1);
  }
}

testConnection();