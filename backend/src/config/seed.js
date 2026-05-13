const Role = require("../models/roleModel");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {

  const roleCount = await Role.countDocuments();

  if (roleCount === 0) {

    const adminRole = await Role.create({
      roleName: "Admin",
      roleDescription: "System administrator"
    });



    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      roleId: adminRole._id,
      email: "admin@gmail.com",
      password: hashedPassword
    });

    console.log("Default roles and admin user created");
  }

};

module.exports = seedDatabase;