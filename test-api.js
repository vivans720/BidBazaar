const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing /api/products?status=ended...');
    const response = await axios.get('http://localhost:5000/api/products?status=ended&limit=50');
    
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Total expired auctions found:', response.data.data.length);
    
    if (response.data.data.length > 0) {
      console.log('\nFirst few expired auctions:');
      response.data.data.slice(0, 3).forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - Status: ${product.status} - End: ${product.endTime}`);
      });
    }
    
    console.log('\nPagination info:', response.data.pagination);
    
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

testAPI();
