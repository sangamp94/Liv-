const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const db = await getData();
    db.users = Array.isArray(db.users) ? db.users : [];

    const user = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        plan: user.plan
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
