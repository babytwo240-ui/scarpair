const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testLogin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/business/login`, {
      email: 'testbusiness@example.com',
      password: 'SecurePass123!'
    });
    
    console.log('✅ LOGIN SUCCESSFUL');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ LOGIN FAILED');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
  }
}

testLogin();
