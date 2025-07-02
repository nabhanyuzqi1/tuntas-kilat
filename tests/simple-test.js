import axios from 'axios';

async function quickTest() {
  const BASE_URL = 'http://localhost:5000';
  
  console.log('🔥 QUICK EMAIL AUTH TEST\n');

  // Test 1: Direct Registration
  try {
    console.log('1. Testing Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'testuser@example.com',
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'customer'
    }, { timeout: 5000 });
    
    console.log('✅ Registration:', registerResponse.data.success ? 'SUCCESS' : 'FAILED');
    if (registerResponse.data.token) {
      console.log('Token received:', registerResponse.data.token.substring(0, 20) + '...');
    }
    
    // Test 2: Login
    console.log('\n2. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'testuser@example.com',
      password: 'TestPass123'
    }, { timeout: 5000 });
    
    console.log('✅ Login:', loginResponse.data.success ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Profile
    if (loginResponse.data.token) {
      console.log('\n3. Testing Profile...');
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/user`, {
        headers: { 'Authorization': `Bearer ${loginResponse.data.token}` },
        timeout: 5000
      });
      
      console.log('✅ Profile:', profileResponse.data ? 'SUCCESS' : 'FAILED');
      console.log('User data:', {
        email: profileResponse.data.email,
        role: profileResponse.data.role,
        name: `${profileResponse.data.firstName} ${profileResponse.data.lastName}`
      });
    }
    
    console.log('\n🎉 ALL TESTS COMPLETED!');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

quickTest().catch(console.error);