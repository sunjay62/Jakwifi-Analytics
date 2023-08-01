const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json()); // Add this middleware to parse JSON request bodies

app.post('/api/elastiflow', async (req, res) => {
  // Change the route method to POST
  try {
    const apiUrl = 'http://metalika.tachyon.net.id:8080/elastiflow-*/_search';
    const response = await axios.post(apiUrl, req.body); // Use req.body to get the requestBody sent from the frontend
    res.json(response.data);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
