import axios from 'axios';

// Get the base URL from environment variables
const baseURL = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_URL 
  : '/api';  // Use '/api' prefix for development to match the Vite proxy

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Example usage (assuming this is the structure of your api.js):
// Place a bid
export const placeBid = (productId, amount) => {
  return api.post('/bids', { productId, amount });
};

// Get bids for a product
export const getProductBids = (productId) => {
  return api.get(`/bids/product/${productId}`);
};

// Get user's bids
export const getUserBids = () => {
  return api.get('/bids/user');
};

export default api; 