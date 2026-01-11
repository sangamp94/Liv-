const bcrypt = require("bcryptjs");
const { getData, updateData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const db = await getData();
    db.users = Array.isArray(db.users) ? db.users : [];

    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.users.push({
      id: "USER_" + Date.now(),
      name: name || email.split("@")[0],
      email,
      password: hash,
      plan: "FREE",
      createdAt: new Date().toISOString()
    });

    await updateData(db);
    res.json({ success: true });

  } catch (e) {
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
};
