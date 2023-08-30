import axios from 'axios';
const BASE_URL = 'http://dashflow.tachyon.net.id/api/allsite';

export default axios.create({
  baseURL: BASE_URL
});
