const Programme = require("../models/programmeModel");
const Project = require("../models/projectModel");
// CREATE
exports.createProgramme = async (req, res) => {
  try {
    const { programmeName, programmeDescription } = req.body;

    const existing = await Programme.findOne({ programmeName });
    if (existing) {
      return res.status(400).json({ message: "Programme already exists" });
    }

    const programme = await Programme.create({ programmeName, programmeDescription });
    res.status(201).json({
      message: "Programme created successfully",
      programme
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL
// exports.getAllProgrammes = async (req, res) => {
//   try {
//     const programmes = await Programme.find();
//     res.json({ totalProgrammes: programmes.length, programmes });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.getAllProgrammes = async (req, res) => {
  try {

    const programmes = await Programme.find();

    // ADD PROJECT COUNT
    const updatedProgrammes = await Promise.all(
      programmes.map(async (prog) => {

        const count = await Project.countDocuments({
          programme: prog._id,
        });

        return {
          ...prog._doc,
          projectCount: count,
        };
      })
    );

    res.json({
      totalProgrammes: updatedProgrammes.length,
      programmes: updatedProgrammes,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


// GET BY ID
exports.getProgrammeById = async (req, res) => {
  try {
    const { id } = req.params;
    const programme = await Programme.findById(id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    res.json({ programme });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
exports.updateProgramme = async (req, res) => {
  try {
    const { id } = req.params;
    const { programmeName, programmeDescription } = req.body;

    const programme = await Programme.findByIdAndUpdate(
      id,
      { programmeName, programmeDescription },
      { new: true, runValidators: true }
    );

    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    res.json({
      message: "Programme updated successfully",
      programme
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
// exports.deleteProgramme = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const programme = await Programme.findByIdAndDelete(id);
//     if (!programme) {
//       return res.status(404).json({ message: "Programme not found" });
//     }

//     res.json({ message: "Programme deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.deleteProgramme = async (req, res) => {
  try {
    const { id } = req.params;

    // Find projects under programme
    const projects = await Project.find({ programme: id });

    console.log("Projects found:", projects);

    const projectIds = projects.map((p) => p._id);

    console.log("Project IDs:", projectIds);

    // Delete beneficiaries linked to projects
    const beneficiaryDeleteResult = await Beneficiary.deleteMany({
      projectId: { $in: projectIds },
    });

    console.log(
      "Beneficiaries deleted:",
      beneficiaryDeleteResult
    );

    // Delete projects
    const projectDeleteResult = await Project.deleteMany({
      programme: id,
    });

    console.log(
      "Projects deleted:",
      projectDeleteResult
    );

    // Delete programme
    const programme = await Programme.findByIdAndDelete(id);

    if (!programme) {
      return res.status(404).json({
        message: "Programme not found",
      });
    }

    res.json({
      message:
        "Programme and related data deleted successfully",
      deletedBeneficiaries:
        beneficiaryDeleteResult.deletedCount,
      deletedProjects:
        projectDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};