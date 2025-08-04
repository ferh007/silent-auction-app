const adminAuth = require('../config/firebaseAdmin');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    return next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
