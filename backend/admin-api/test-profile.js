const axios = require('axios');

async function test() {
  // Login first
  const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
    email: 'sadiqli2024@gmail.com',
    password: 'password123'
  });
  const token = loginRes.data.data.token;
  console.log('Login OK, token received');
  
  // Now get profile
  const profileRes = await axios.get('http://localhost:5001/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Profile:', profileRes.data);
}
test().catch(e => console.log('Error:', e.response?.status, e.response?.data));
