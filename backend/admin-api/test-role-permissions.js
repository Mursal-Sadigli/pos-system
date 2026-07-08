const axios = require('axios');

async function test() {
  // Login via super-admin-api
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'sadiqli2024@gmail.com',
    password: 'password123'
  });
  const token = loginRes.data.data?.token;
  const storeId = 'e140a5af-fdfc-456f-a81e-076b4d872bc0'; // Mursel Store
  
  // Test saving role_permissions
  console.log('=== Saving role permissions ===');
  try {
    const res = await axios.put(`http://localhost:5001/api/stores/${storeId}`, {
      role_permissions: {
        MANAGER: ["sales_view", "inventory_manage"],
        CASHIER: ["pos_access"],
        VIEWER: ["sales_view"]
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Saved OK:', res.data?.success);
  } catch(e) {
    console.log('Save fail:', e.response?.status, e.response?.data?.message || e.response?.data);
  }
  
  // Now get it back
  console.log('\n=== Fetching store to verify ===');
  try {
    const res = await axios.get(`http://localhost:5001/api/stores/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('role_permissions:', JSON.stringify(res.data?.data?.role_permissions));
  } catch(e) {
    console.log('Fetch fail:', e.response?.status, e.response?.data?.message);
  }
}
test().catch(e => console.log('Error:', e.message));
