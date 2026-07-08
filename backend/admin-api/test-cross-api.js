const axios = require('axios');

async function test() {
  // Login via SUPER-ADMIN-API (port 5000) - this is what the frontend actually does
  console.log('=== Login via super-admin-api (port 5000) ===');
  let token;
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sadiqli2024@gmail.com',
      password: 'password123'
    });
    token = loginRes.data.data?.token || loginRes.data.token;
    console.log('Login OK via port 5000, token:', token?.substring(0,40)+'...');
  } catch(e) {
    console.log('Login fail on port 5000:', e.response?.status, e.response?.data?.message);
    return;
  }
  
  // Now try profile via ADMIN-API (port 5001) with that token
  console.log('\n=== Profile via admin-api (port 5001) with super-admin token ===');
  try {
    const profileRes = await axios.get('http://localhost:5001/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile SUCCESS:', profileRes.data.data?.email, profileRes.data.data?.role);
  } catch(e) {
    console.log('Profile fail:', e.response?.status, e.response?.data?.message);
  }
}
test();
