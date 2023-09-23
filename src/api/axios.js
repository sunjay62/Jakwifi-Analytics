import axios from 'axios';
const BASE_URL = 'http://dashflow.tachyon.net.id/api/beta';

export default axios.create({
  baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});
