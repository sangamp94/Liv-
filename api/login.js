const jwt = require("jsonwebtoken");
const { getData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const body = req.body || {};
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const db = await getData();
    if (!db || !Array.isArray(db.users)) {
      return res.status(500).json({ message: "DB not working" });
    }

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ⚠️ TEMP: plain password check
    if (user.password !== password) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "test",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { name: user.name, email: user.email }
    });

  } catch (e) {
    console.error("LOGIN CRASH:", e);
    return res.status(500).json({ message: e.message });
  }
};
