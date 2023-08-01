import axios from 'axios';
const BASE_URL = 'http://172.16.25.50:5000';

export default axios.create({
  baseURL: BASE_URL
});
