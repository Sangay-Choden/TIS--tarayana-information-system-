const Role = require("../models/roleModel");

exports.createRole = async (req, res) => {

  try {

    const { roleName, roleDescription } = req.body;

    const existing = await Role.findOne({ roleName });

    if (existing) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      roleName,
      roleDescription
    });

    res.json({
      message: "Role created successfully",
      role
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, roleDescription } = req.body;

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Optional: prevent duplicate role names
    if (roleName && roleName !== role.roleName) {
      const existing = await Role.findOne({ roleName });
      if (existing) {
        return res.status(400).json({ message: "Role name already exists" });
      }
    }

    role.roleName = roleName || role.roleName;
    role.roleDescription = roleDescription || role.roleDescription;

    await role.save();

    res.json({
      message: "Role updated successfully",
      role
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {

    const { id } = req.params;

    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({
      message: "Role deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    res.json({
      roles,
      totalRoles: roles.length,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};