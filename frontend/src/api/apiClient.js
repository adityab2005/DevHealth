import axios from 'axios';

// Configure the base URL to match your backend exactly
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:4000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;