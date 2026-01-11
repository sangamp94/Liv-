const bcrypt = require("bcryptjs");
const { getData, updateData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Password are required"
      });
    }

    const db = await getData();

    // Ensure users array
    db.users = Array.isArray(db.users) ? db.users : [];

    // Check email exists
    const userExists = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: "USER_" + Date.now(),
      name,
      email,
      password: hashedPassword,
      plan: "FREE",          // FREE / BASIC / PREMIUM
      status: "ACTIVE",
      isVerified: false,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await updateData(db);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        plan: newUser.plan
      }
    });

  } catch (error) {
    console.error("User Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
