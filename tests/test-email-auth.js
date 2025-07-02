#!/usr/bin/env node

/**
 * Comprehensive Email Authentication Testing
 * Tests the optimized registration, login, and user profile functionality
 */

import fetch from 'node-fetch';

const apiUrl = 'http://localhost:5000';

// Test user data for comprehensive testing
const testUsers = [
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
    lastName: "Test",
    email: "nabhanyuzqi3@gmail.com",
    password: "@Yuzqi07070", 
    role: "worker"
  },
  {
    firstName: "Customer",
    lastName: "Test",
    email: "customer@example.com",
    password: "@Yuzqi07070",
    role: "customer"
  }
];

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${apiUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function testRegistration(userData) {
  console.log(`\n🔄 Testing Registration: ${userData.email}`);
  
  const result = await makeRequest('/api/auth/register', 'POST', userData);
  
  if (result.error) {
    console.log(`❌ Request Error: ${result.error}`);
    return null;
  }
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Registration SUCCESS for ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Token received: ${result.data.token ? 'YES' : 'NO'}`);
    return result.data.token;
  } else {
    console.log(`❌ Registration FAILED for ${userData.email}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data.message || result.data.error}`);
    return null;
  }
}

async function testLogin(email, password) {
  console.log(`\n🔄 Testing Login: ${email}`);
  
  const result = await makeRequest('/api/auth/login', 'POST', {
    identifier: email,
    password: password
  });
  
  if (result.error) {
    console.log(`❌ Request Error: ${result.error}`);
    return null;
  }
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Login SUCCESS for ${email}`);
    console.log(`   Token received: ${result.data.token ? 'YES' : 'NO'}`);
    return result.data.token;
  } else {
    console.log(`❌ Login FAILED for ${email}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data.message || result.data.error}`);
    return null;
  }
}

async function testUserProfile(token, expectedEmail) {
  console.log(`\n🔄 Testing User Profile for: ${expectedEmail}`);
  
  const result = await makeRequest('/api/auth/user', 'GET', null, token);
  
  if (result.error) {
    console.log(`❌ Request Error: ${result.error}`);
    return false;
  }
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ User Profile SUCCESS for ${expectedEmail}`);
    console.log(`   Name: ${result.data.user.firstName} ${result.data.user.lastName}`);
    console.log(`   Email: ${result.data.user.email}`);
    console.log(`   Role: ${result.data.user.role}`);
    console.log(`   Membership: ${result.data.user.membershipLevel}`);
    return true;
  } else {
    console.log(`❌ User Profile FAILED for ${expectedEmail}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.data.message || result.data.error}`);
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 STARTING COMPREHENSIVE EMAIL AUTHENTICATION TEST');
  console.log('=' * 60);
  
  const results = {
    registration: { success: 0, failed: 0 },
    login: { success: 0, failed: 0 },
    profile: { success: 0, failed: 0 }
  };
  
  const tokens = {};
  
  // Phase 1: Test Registration
  console.log('\n📝 PHASE 1: REGISTRATION TESTING');
  for (const user of testUsers) {
    const token = await testRegistration(user);
    if (token) {
      results.registration.success++;
      tokens[user.email] = token;
    } else {
      results.registration.failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Phase 2: Test Login
  console.log('\n🔐 PHASE 2: LOGIN TESTING');
  for (const user of testUsers) {
    const token = await testLogin(user.email, user.password);
    if (token) {
      results.login.success++;
      tokens[user.email] = token; // Update with fresh token
    } else {
      results.login.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Phase 3: Test User Profile
  console.log('\n👤 PHASE 3: USER PROFILE TESTING');
  for (const user of testUsers) {
    if (tokens[user.email]) {
      const success = await testUserProfile(tokens[user.email], user.email);
      if (success) {
        results.profile.success++;
      } else {
        results.profile.failed++;
      }
    } else {
      console.log(`⚠️  Skipping profile test for ${user.email} - no token available`);
      results.profile.failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Final Results
  console.log('\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('=' * 60);
  console.log(`📝 Registration: ${results.registration.success}/${testUsers.length} SUCCESS (${Math.round(results.registration.success/testUsers.length*100)}%)`);
  console.log(`🔐 Login:        ${results.login.success}/${testUsers.length} SUCCESS (${Math.round(results.login.success/testUsers.length*100)}%)`);
  console.log(`👤 User Profile: ${results.profile.success}/${testUsers.length} SUCCESS (${Math.round(results.profile.success/testUsers.length*100)}%)`);
  
  const totalTests = testUsers.length * 3;
  const totalSuccess = results.registration.success + results.login.success + results.profile.success;
  const overallSuccess = Math.round(totalSuccess/totalTests*100);
  
  console.log(`\n🎯 OVERALL SUCCESS RATE: ${totalSuccess}/${totalTests} (${overallSuccess}%)`);
  
  if (overallSuccess >= 90) {
    console.log('🎉 EXCELLENT! Email Authentication System is FULLY FUNCTIONAL');
  } else if (overallSuccess >= 70) {
    console.log('👍 GOOD! Email Authentication System is mostly functional');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT! Email Authentication System requires fixes');
  }
  
  return {
    registrationRate: Math.round(results.registration.success/testUsers.length*100),
    loginRate: Math.round(results.login.success/testUsers.length*100),
    profileRate: Math.round(results.profile.success/testUsers.length*100),
    overallRate: overallSuccess
  };
}

// Run the test if executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  runComprehensiveTest()
    .then(results => {
      console.log('\n✅ Test completed successfully');
      process.exit(results.overallRate >= 90 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test failed with error:', error);
      process.exit(1);
    });
}

export { runComprehensiveTest };