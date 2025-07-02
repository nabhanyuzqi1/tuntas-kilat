/**
 * Create Test Accounts Script
 * Creates specific test accounts with predefined roles for system testing
 */

import fetch from 'node-fetch';

const accounts = [
  {
    firstName: "Admin",
    lastName: "Perusahaan",
    email: "nabhanyuzqi1@gmail.com",
    password: "@Yuzqi07070",
    role: "admin_perusahaan"
  },
  {
    firstName: "Admin",
    lastName: "Umum",
    email: "nabhanyuzqi2@gmail.com", 
    password: "@Yuzqi07070",
    role: "admin_umum"
  },
  {
    firstName: "Worker",
    lastName: "Professional",
    email: "nabhanyuzqi3@gmail.com",
    password: "@Yuzqi07070",
    role: "worker"
  },
  {
    firstName: "Customer",
    lastName: "Premium",
    email: "customer@tuntaskilat.com",
    password: "@Yuzqi07070",
    role: "customer"
  }
];

async function makeRequest(endpoint, method = 'GET', body = null) {
  const baseUrl = 'http://localhost:5000';
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function createTestAccounts() {
  console.log('🚀 Creating Test Accounts for Tuntas Kilat...\n');
  
  const results = [];
  
  for (const account of accounts) {
    console.log(`📝 Creating ${account.role}: ${account.email}`);
    
    // Try to register account
    const registerResult = await makeRequest('/api/auth/register', 'POST', account);
    
    if (registerResult.status === 200) {
      console.log(`✅ ${account.email} - Registration successful`);
      
      // Test login
      const loginResult = await makeRequest('/api/auth/login', 'POST', {
        identifier: account.email,
        password: account.password
      });
      
      if (loginResult.status === 200) {
        console.log(`✅ ${account.email} - Login successful`);
        
        // Test profile
        const token = loginResult.data.token;
        const profileResult = await makeRequest('/api/auth/user', 'GET', null);
        
        results.push({
          email: account.email,
          role: account.role,
          registration: 'SUCCESS',
          login: 'SUCCESS', 
          profile: profileResult.status === 200 ? 'SUCCESS' : 'FAILED',
          token: token.substring(0, 20) + '...'
        });
      } else {
        console.log(`❌ ${account.email} - Login failed: ${loginResult.data?.message}`);
        results.push({
          email: account.email,
          role: account.role,
          registration: 'SUCCESS',
          login: 'FAILED',
          profile: 'SKIPPED'
        });
      }
    } else {
      console.log(`❌ ${account.email} - Registration failed: ${registerResult.data?.message}`);
      results.push({
        email: account.email,
        role: account.role,
        registration: 'FAILED',
        login: 'SKIPPED',
        profile: 'SKIPPED'
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 Test Account Creation Summary:');
  console.log('=====================================');
  results.forEach(result => {
    console.log(`${result.email} (${result.role})`);
    console.log(`  Registration: ${result.registration}`);
    console.log(`  Login: ${result.login}`);
    console.log(`  Profile: ${result.profile || 'N/A'}`);
    if (result.token) {
      console.log(`  Token: ${result.token}`);
    }
    console.log('');
  });
  
  const successCount = results.filter(r => r.registration === 'SUCCESS' && r.login === 'SUCCESS').length;
  console.log(`🎯 Overall Success: ${successCount}/${accounts.length} accounts fully functional`);
  
  return results;
}

// Run the function
createTestAccounts().catch(console.error);