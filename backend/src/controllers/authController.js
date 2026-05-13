const User = require("../models/userModel");
const Role = require("../models/roleModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// const sendEmail = require("../utils/email");
const { sendEmail } = require("../utils/email");

exports.register = async (req, res) => {
  try {
    let { email, roleName } = req.body;

    // Normalize email to avoid case-sensitive duplicates
    email = email.toLowerCase();

    // Find role
    const role = await Role.findOne({ roleName });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate random password
    const randomPassword = crypto.randomBytes(4).toString("hex");

    // Hash password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user
    let user;
    try {
      user = await User.create({
        email,
        roleId: role._id,
        password: hashedPassword
      });
    } catch (err) {
      // Handle duplicate key error (race condition)
      if (err.code === 11000) {
        return res.status(400).json({ message: "User already exists" });
      }
      throw err; // other errors
    }

    // Send password via email
    await sendEmail(email, roleName, randomPassword);

    // Success response
    res.json({ message: "User registered successfully. Password sent to email." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { email, roleName } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update email
    if (email) {
      email = email.toLowerCase();

      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(400).json({ message: "Email already in use" });
      }

      user.email = email;
    }

    // Update role
    if (roleName) {
      const role = await Role.findOne({ roleName });
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      user.roleId = role._id;
    }

    await user.save();

    res.json({
      message: "User updated successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(id);

    console.log("Entered Password:", oldPassword);
    console.log("Stored Hash:", user.password);

    const match = await bcrypt.compare(oldPassword, user.password);

    console.log("Password Match:", match);

    if (!match) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    await sendEmail(email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.json({
      message: "OTP sent to email"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.resetPassword = async (req, res) => {
  try {

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Fetch role
    const role = await Role.findById(user.roleId);
    const roleName = role ? role.roleName : "Unknown";

    // Generate JWT token (expires in 1 day)
    // const token = jwt.sign(
    //   { id: user._id, role: roleName },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1d" }
    // );
    const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
    name: user.name || user.email.split("@")[0],
    roleName: roleName
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    // Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: roleName
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves (optional)
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "Admin cannot delete themselves" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find()
      .populate("roleId", "roleName roleDescription")
      .select("-password");

    res.json({
      totalUsers: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findById(id)
      .populate("roleId", "roleName roleDescription")
      .select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      user
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {

    const totalUsers = await User.countDocuments();

    const roleStats = await User.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: "$role" },
      {
        $group: {
          _id: "$role.roleName",
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      roleStats
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






/**
 * @desc    Fetch all users with the 'Programme Officer' role
 * @route   GET /api/users/programme-officers
 */
exports.getAllProgrammeOfficers = async (req, res) => {
  try {
    // 1. Find the Role ID for Programme Officer
    const role = await Role.findOne({ roleName: "ProgrammeOfficer" });
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    // 2. Find all users with that roleId
    const officers = await User.find({ roleId: role._id })
      .select("-password") // Don't send passwords back!
      .sort({ email: 1 });

    res.status(200).json({ success: true, count: officers.length, data: officers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Fetch all users with the 'Field Officer' role
 * @route   GET /api/users/field-officers
 */
exports.getAllFieldOfficers = async (req, res) => {
  try {
    // 1. Find the Role ID for Field Officer
    const role = await Role.findOne({ roleName: "FieldOfficer" });
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });

    // 2. Find all users with that roleId
    const officers = await User.find({ roleId: role._id })
      .select("-password")
      .sort({ email: 1 });

    res.status(200).json({ success: true, count: officers.length, data: officers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};