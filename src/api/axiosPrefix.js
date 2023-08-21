import axios from 'axios';
const BASE_URL = 'http://172.16.32.166:5080';

export default axios.create({
  baseURL: BASE_URL
});
