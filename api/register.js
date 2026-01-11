const bcrypt = require("bcryptjs");
const { getData, updateData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { academyName, adminName, email, password } = req.body;

    if (!academyName || !adminName || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const db = await getData();
    db.admins = Array.isArray(db.admins) ? db.admins : [];

    if (db.admins.find(a => a.email === email)) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.admins.push({
      id: Date.now().toString(),
      academyName,
      adminName,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });

    await updateData(db);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
