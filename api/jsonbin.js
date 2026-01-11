const axios = require("axios");

const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;
const BASE_URL = process.env.JSONBIN_BASE_URL;

async function getData() {
  const res = await axios.get(`${BASE_URL}/b/${BIN_ID}/latest`, {
    headers: { "X-Master-Key": API_KEY }
  });
  return res.data.record;
}

async function updateData(data) {
  await axios.put(`${BASE_URL}/b/${BIN_ID}`, data, {
    headers: {
      "X-Master-Key": API_KEY,
      "Content-Type": "application/json"
    }
  });
}

module.exports = { getData, updateData };
