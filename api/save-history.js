const jwt = require("jsonwebtoken");
const { getData, saveData } = require("./jsonbin");

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    /* ================= AUTH ================= */
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = auth.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    /* ================= BODY ================= */
    const {
      contentId,     // movie / episode id
      title,         // movie name / episode title
      type,          // "movie" | "anime"
      episode,       // optional (anime)
      progress,      // seconds watched
      duration       // total duration
    } = req.body;

    if (!contentId || !title || !type)
      return res.status(400).json({ message: "Missing fields" });

    /* ================= DB ================= */
    const db = await getData();
    db.users = Array.isArray(db.users) ? db.users : [];

    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.history = Array.isArray(user.history) ? user.history : [];

    /* ================= UPSERT HISTORY ================= */
    const existing = user.history.find(
      h => h.contentId === contentId && h.episode === episode
    );

    if (existing) {
      // update progress
      existing.progress = progress;
      existing.duration = duration;
      existing.updatedAt = new Date().toISOString();
    } else {
      user.history.unshift({
        contentId,
        title,
        type,
        episode: episode || null,
        progress: progress || 0,
        duration: duration || 0,
        updatedAt: new Date().toISOString()
      });
    }

    // keep only last 50 items
    user.history = user.history.slice(0, 50);

    await saveData(db);

    res.json({ success: true, history: user.history });

  } catch (e) {
    console.error("SAVE HISTORY ERROR:", e);
    res.status(500).json({ message: "Server error" });
  }
};
