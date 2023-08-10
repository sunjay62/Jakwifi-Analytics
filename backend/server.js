const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.post('/api/elastiflow', async (req, res) => {
  try {
    const apiUrl = 'http://metalika.tachyon.net.id:8080/elastiflow-*/_search';
    const response = await axios.post(apiUrl, req.body);

    res.json(response.data); // Mengembalikan respons tanpa perubahan
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
