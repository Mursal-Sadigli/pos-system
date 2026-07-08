const axios = require('axios');

async function test() {
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'sadiqli2024@gmail.com',
    password: 'sadigli2024!'
  });
  const token = loginRes.data.data?.token;
  const storeId = 'bfe69c29-815a-4190-9971-64a6055011c6'; // Baku Electronics
  
  console.log('=== Updating currency, language and tax_rate ===');
  try {
    const res = await axios.put(`http://localhost:5001/api/stores/${storeId}`, {
      currency: 'EUR',
      language: 'en',
      tax_rate: 18.5
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update OK:', res.data?.success);
  } catch(e) {
    console.log('Update fail:', e.response?.status, e.response?.data);
  }
  
  console.log('\n=== Fetching store to verify ===');
  try {
    const res = await axios.get(`http://localhost:5001/api/stores/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Store data:', {
      currency: res.data?.data?.currency,
      language: res.data?.data?.language,
      tax_rate: res.data?.data?.tax_rate
    });
  } catch(e) {
    console.log('Fetch fail:', e.response?.status, e.response?.data?.message);
  }
}
test().catch(e => console.log('Error:', e.message));
