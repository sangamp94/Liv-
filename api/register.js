const bcrypt = require("bcryptjs");
const { getData, updateData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const db = await getData();
    db.users = Array.isArray(db.users) ? db.users : [];

    const exists = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.users.push({
      id: "USER_" + Date.now(),
      name: name || "User",
      email,
      password: hashedPassword,
      plan: "FREE",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    });

    await updateData(db);

    return res.status(201).json({
      success: true,
      message: "Registration successful"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
