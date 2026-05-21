// ============================================
// Auth Middleware — JWT verification + role check
// ============================================
const jwt = require('jsonwebtoken');
const { User } = require('./models');

// Verify JWT token and attach user to req.user
const auth = async (req, res, next) => {
  try {
    // Read token from "Authorization: Bearer <token>"
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB to make sure they still exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Attach user info to the request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Check if the authenticated user is an admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { auth, requireAdmin };
