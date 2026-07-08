const axios = require('axios');

async function test() {
  try {
    // Login with admin-api
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginRes.data);
  } catch (e) {
    if (e.response) {
      console.log('Login failed:', e.response.status, e.response.data);
    } else {
      console.log('Error:', e.message);
    }
  }
}
test();
