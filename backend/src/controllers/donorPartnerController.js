const Role = require("../models/roleModel");
const donorPartner = require("../models/donorPartnerModel");

exports.registerDonorPartner = async (req, res) => {
  try {
    const { name, roleName } = req.body;

    // Validate role
    if (!["Donor", "Partner"].includes(roleName)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Validate name
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Find role
    const role = await Role.findOne({ roleName });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Create Donor/Partner
    const record = await donorPartner.create({
      name,
      roleId: role._id
    });

    return res.json({
      message: `${roleName} registered successfully`,
      data: record
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateDonorPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Update
    const updatedRecord = await donorPartner.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.json({
      message: "Updated successfully",
      data: updatedRecord
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.deleteDonorPartner = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await donorPartner.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.json({
      message: "Deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getDonorPartnerSummary = async (req, res) => {
  try {
    // Find roles
    const donorRole = await Role.findOne({ roleName: "Donor" });
    const partnerRole = await Role.findOne({ roleName: "Partner" });

    if (!donorRole || !partnerRole) {
      return res.status(404).json({ message: "Roles not found" });
    }

    // Fetch data in parallel
    const [donors, partners] = await Promise.all([
      donorPartner.find({ roleId: donorRole._id }).select("name"),
      donorPartner.find({ roleId: partnerRole._id }).select("name")
    ]);

    return res.json({
      totalDonors: donors.length,
      donors,

      totalPartners: partners.length,
      partners
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
