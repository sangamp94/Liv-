const BIN_ID = process.env.JSONBIN_BIN_ID;
const API_KEY = process.env.JSONBIN_API_KEY;

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function getData() {
  const res = await fetch(`${BASE_URL}/latest`, {
    headers: {
      "X-Master-Key": API_KEY
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("JSONBin GET failed: " + text);
  }

  const json = await res.json();
  return json.record || { admins: [] };
}

async function updateData(data) {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("JSONBin PUT failed: " + text);
  }

  return res.json();
}

module.exports = { getData, updateData };
