import axios from 'axios';

// Definisikan variabel lingkungan untuk menentukan protokol (http atau https)
const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https' : 'http';

// Definisikan BASE_URL berdasarkan protokol yang dipilih
const BASE_URL = `${PROTOCOL}:.net.id/api/usage`;

export default axios.create({
  baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});
