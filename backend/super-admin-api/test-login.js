const axios = require('axios');

async function test() {
  // Test super-admin-api login
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'sadiqli2024@gmail.com',
      password: 'password123'
    });
    console.log('Super-admin login SUCCESS:', res.data.data?.user?.email, res.data.data?.user?.role);
    console.log('Token received:', !!res.data.data?.token);
  } catch(e) {
    console.log('Super-admin login FAIL:', e.response?.status, e.response?.data?.message);
    console.log('Full error:', JSON.stringify(e.response?.data));
  }
}
test();
