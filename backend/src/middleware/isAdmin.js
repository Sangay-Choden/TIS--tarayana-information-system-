const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.isAdmin = async (req, res, next) => {
  try {
    // Get token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from DB
    const user = await User.findById(decoded.id).populate("roleId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check role
    if (user.roleId.roleName !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Attach user to request for further use
    req.user = user;

    next();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};