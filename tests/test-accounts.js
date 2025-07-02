// Direct test account creation script
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const testAccounts = [
  {
    email: 'nabhanyuzqi1@gmail.com',
    password: '@Yuzqi07070',
    firstName: 'Admin',
    lastName: 'Perusahaan',
    role: 'admin_perusahaan'
  },
  {
    email: 'nabhanyuzqi2@gmail.com', 
    password: '@Yuzqi07070',
    firstName: 'Admin',
    lastName: 'Umum', 
    role: 'admin_umum'
  },
  {
    email: 'nabhanyuzqi3@gmail.com',
    password: '@Yuzqi07070', 
    firstName: 'Worker',
    lastName: 'Tester',
    role: 'worker'
  },
  {
    email: 'customer.test@gmail.com',
    password: '@Yuzqi07070',
    firstName: 'Customer',
    lastName: 'Tester', 
    role: 'customer'
  }
];

async function createTestAccounts() {
  console.log('🚀 Creating test accounts...\n');
  
  for (const account of testAccounts) {
    try {
      console.log(`Creating account: ${account.email}`);
      
      // Register account
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, account, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (registerResponse.data.success) {
        console.log(`✅ Registration successful for ${account.email}`);
        
        // Immediate login test
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          identifier: account.email,
          password: account.password
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (loginResponse.data.success) {
          console.log(`✅ Login test successful for ${account.email}`);
          
          // Profile test
          const profileResponse = await axios.get(`${BASE_URL}/api/auth/user`, {
            headers: { 
              'Authorization': `Bearer ${loginResponse.data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (profileResponse.data && !profileResponse.data.error) {
            console.log(`✅ Profile retrieval successful for ${account.email}`);
            console.log(`   Role: ${profileResponse.data.role}`);
          } else {
            console.log(`❌ Profile retrieval failed for ${account.email}`);
          }
        } else {
          console.log(`❌ Login test failed for ${account.email}: ${loginResponse.data.message}`);
        }
      } else {
        console.log(`❌ Registration failed for ${account.email}: ${registerResponse.data.message}`);
      }
      
      console.log('---');
    } catch (error) {
      console.log(`❌ Error for ${account.email}:`, error.response?.data || error.message);
      console.log('---');
    }
  }
}

async function testEmailAuthentication() {
  console.log('🧪 Testing Email Authentication Flow...\n');
  
  const testEmail = 'test.email@example.com';
  const testPassword = 'TestPassword123';
  
  try {
    // 1. Registration Test
    console.log('1. Testing Registration...');
    const registerData = {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Registration Response:', registerResponse.data);
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      
      // 2. Login Test  
      console.log('\n2. Testing Login...');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        identifier: testEmail,
        password: testPassword
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Login Response:', loginResponse.data);
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful');
        
        // 3. Profile Test
        console.log('\n3. Testing Profile Retrieval...');
        const profileResponse = await axios.get(`${BASE_URL}/api/auth/user`, {
          headers: { 
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Profile Response:', profileResponse.data);
        
        if (profileResponse.data && !profileResponse.data.error) {
          console.log('✅ Profile retrieval successful');
          console.log('\n🎉 ALL EMAIL AUTHENTICATION TESTS PASSED!');
        } else {
          console.log('❌ Profile retrieval failed');
        }
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.log('❌ Email authentication test failed:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🔥 TUNTAS KILAT - COMPREHENSIVE TESTING SUITE\n');
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test basic email authentication flow
  await testEmailAuthentication();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Create all test accounts with roles
  await createTestAccounts();
  
  console.log('\n🏁 Testing completed!');
}

// Run the tests
main().catch(console.error);