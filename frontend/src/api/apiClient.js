import axios from 'axios';

// Configure the base URL to match your backend exactly
const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;