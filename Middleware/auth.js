const { verifyToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is required' });
  }

  const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};