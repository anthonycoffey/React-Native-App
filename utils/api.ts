import axios from 'axios';
console.log(process.env);
const API_URL =
  process.env['EXPO_PUBLIC_KEY_API_URL'] ||
  'https://afa8-2605-a601-aa7f-9300-752a-dc37-c5f8-e8aa.ngrok-free.app';
console.log(API_URL);
const api = axios.create({
  baseURL: API_URL,
});

export default api;
