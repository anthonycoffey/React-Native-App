import axios from 'axios';
const API_URL = process.env['EXPO_PUBLIC_KEY_API_URL'];

const api = axios.create({
  baseURL: API_URL,

});

export default api;
