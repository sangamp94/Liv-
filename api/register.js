import bcrypt from "bcryptjs";
import { getData, updateData } from "./jsonbin.js";

export default async function handler(req, res) {
  // 🔥 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const db = await getData();
    db.users = Array.isArray(db.users) ? db.users : [];

    const exists = db.users.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.users.push({
      id: "USER_" + Date.now(),
      name: name || email.split("@")[0],
      email,
      password: hashed,
      plan: "FREE",
      createdAt: new Date().toISOString()
    });

    await updateData(db);

    return res.status(201).json({
      success: true,
      message: "Registration successful"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
