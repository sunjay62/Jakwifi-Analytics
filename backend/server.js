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

    const modifiedResponse = modifyResponse(response.data);
    const sortedBuckets = sortBucketsBySumNetworkPacket(modifiedResponse.aggregations.top_server.buckets);

    res.json({ aggregations: { top_server: { buckets: sortedBuckets } } });
    console.log(sortedBuckets);
  } catch (error) {
    res.status(error.response ? error.response.status : 500).json({ error: error.message });
  }
});

function modifyResponse(data) {
  if (data && data.aggregations && data.aggregations.top_server && data.aggregations.top_server.buckets) {
    data.aggregations.top_server.buckets.forEach((bucket) => {
      if (bucket.sum_network_bytes && bucket.sum_network_bytes.value !== undefined) {
        bucket.sum_network_bytes.value = bucket.sum_network_bytes.value.toExponential();
      }
    });
  }
  return data;
}

function sortBucketsBySumNetworkPacket(buckets) {
  return buckets.sort((a, b) => b.sum_network_bytes.value - a.sum_network_bytes.value);
}

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
