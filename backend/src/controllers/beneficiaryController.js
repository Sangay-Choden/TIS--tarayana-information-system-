const Beneficiary = require("../models/beneficiaryModel");
const Project = require("../models/projectModel");

/**
 * @desc    Create a new beneficiary with project-based Dzongkhag validation
 * @route   POST /api/beneficiaries
 */
exports.createBeneficiary = async (req, res) => {
  try {
    const {
      projectId,
      year,
      gender,
      cid,
      name,
      dzongkhag,
      village,
      gewog,
      houseNo,
      thramNo,
      indirectBeneficiaries,
      keyActivities
    } = req.body;

    // 1. Basic Field Validation (Requirement: all except indirectBeneficiaries)
    if (!projectId || !year || !gender || !cid || !name || !dzongkhag || !village || !gewog || !houseNo || !thramNo) {
      return res.status(400).json({
        success: false,
        message: "All fields are required except indirect beneficiaries."
      });
    }

    // 2. Fetch the project to validate Dzongkhag
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // 3. Dzongkhag validation (Must match project's selected dzongkhags)
    const allowedDzongkhags = project.dzongkhag.map(d => d.toLowerCase());
    if (!allowedDzongkhags.includes(dzongkhag.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid Dzongkhag. This project only operates in: ${project.dzongkhag.join(", ")}`
      });
    }

    // 4. Check if Beneficiary with this CID already exists in THIS project
    const existingBeneficiary = await Beneficiary.findOne({ cid, projectId });
    if (existingBeneficiary) {
      return res.status(400).json({
        success: false,
        message: "A beneficiary with this CID is already registered to this project."
      });
    }

    // 5. Create the Beneficiary
    const newBeneficiary = await Beneficiary.create({
      projectId,
      year,
      gender,
      cid,
      name,
      dzongkhag,
      village,
      gewog,
      houseNo,
      thramNo,
      indirectBeneficiaries,
      keyActivities
    });

    res.status(201).json({
      success: true,
      message: "Beneficiary registered successfully",
      data: newBeneficiary
    });

  } catch (error) {
    // This catches CID 11-digit validation or Gender enum errors from the model
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all beneficiaries for a specific project
 * @route   GET /api/beneficiaries/project/:projectId
 */
exports.getProjectBeneficiaries = async (req, res) => {
  try {
    const { projectId } = req.params;

    const beneficiaries = await Beneficiary.find({ projectId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      data: beneficiaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add this to your beneficiaryController.js
exports.deleteBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;

    const beneficiary = await Beneficiary.findByIdAndDelete(id);

    if (!beneficiary) {
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Beneficiary deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @desc    Get all beneficiaries with full project details
 * @route   GET /api/beneficiaries
 */
exports.getAllBeneficiaries = async (req, res) => {
  try {
    // We use .populate() to join project details (like project name) 
    // and sort by newest first
    const beneficiaries = await Beneficiary.find()
      .populate({
        path: 'projectId',
        select: 'projectName programme' 
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      data: beneficiaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch beneficiaries",
      error: error.message
    });
  }
};


exports.getAllBeneficiariesbyDzongkhag = async (req, res) => {
    try {

    const beneficiaries = await Beneficiary.find();

    const dzongkhagActivitySummary = {};

    beneficiaries.forEach((beneficiary) => {

      const dzongkhag = beneficiary.dzongkhag?.toLowerCase();

      if (!dzongkhag) return;

      // CREATE DZONGKHAG OBJECT
      if (!dzongkhagActivitySummary[dzongkhag]) {
        dzongkhagActivitySummary[dzongkhag] = {
          totalActivities: 0,
          activities: {}
        };
      }

      // LOOP ACTIVITIES
      beneficiary.keyActivities?.forEach((activity) => {

        const activityName = activity.activityName?.toLowerCase();

        if (!activityName) return;

        // TOTAL COUNT
        dzongkhagActivitySummary[dzongkhag].totalActivities += 1;

        // ACTIVITY COUNT
        if (!dzongkhagActivitySummary[dzongkhag].activities[activityName]) {
          dzongkhagActivitySummary[dzongkhag].activities[activityName] = 0;
        }

        dzongkhagActivitySummary[dzongkhag].activities[activityName] += 1;

      });

    });

    res.status(200).json({
      success: true,
      dzongkhagActivitySummary
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });

  }
};

/**
 * @desc    Update an existing beneficiary
 * @route   PUT /api/beneficiaries/:id
 */
exports.updateBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Find the existing beneficiary
    const beneficiary = await Beneficiary.findById(id);
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: "Beneficiary not found" });
    }

    // 2. If Dzongkhag is being updated, validate it against the Project
    if (updateData.dzongkhag) {
      const project = await Project.findById(beneficiary.projectId);
      const allowedDzongkhags = project.dzongkhag.map(d => d.toLowerCase());
      
      if (!allowedDzongkhags.includes(updateData.dzongkhag.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid Dzongkhag. This project only operates in: ${project.dzongkhag.join(", ")}`
        });
      }
    }

    // 3. If CID is being updated, check for duplicates within the same project
    if (updateData.cid && updateData.cid !== beneficiary.cid) {
      const cidExists = await Beneficiary.findOne({ 
        cid: updateData.cid, 
        projectId: beneficiary.projectId,
        _id: { $ne: id } // Ensure we aren't checking the current record itself
      });

      if (cidExists) {
        return res.status(400).json({
          success: false,
          message: "A beneficiary with this new CID is already registered to this project."
        });
      }
    }

    // 4. Perform the update
    const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // runValidators ensures CID length and Enums are checked
    );

    res.status(200).json({
      success: true,
      message: "Beneficiary updated successfully",
      data: updatedBeneficiary
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * @desc    Get a single beneficiary by ID
 * @route   GET /api/beneficiaries/:id
 */
exports.getBeneficiaryById = async (req, res) => {
  try {
    const { id } = req.params;

    // We populate 'projectId' to get the Project Name and details 
    // This is helpful for displaying "Project: [Name]" on the detail page
    const beneficiary = await Beneficiary.findById(id).populate({
      path: 'projectId',
      select: 'projectName programme dzongkhag'
    });

    if (!beneficiary) {
      return res.status(404).json({
        success: false,
        message: "Beneficiary not found"
      });
    }

    res.status(200).json({
      success: true,
      data: beneficiary
    });
  } catch (error) {
    // Check if the error is due to an invalid MongoDB ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: "Invalid Beneficiary ID format" });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.getProgrammeBeneficiaries = async (req, res) => {
  try {

    const { programmeId } = req.params;

    // GET ALL PROJECTS OF THIS PROGRAMME
    const projects = await Project.find({
      programme: programmeId,
    }).select("_id");

    const projectIds = projects.map((p) => p._id);

    // COUNT BENEFICIARIES OF ALL PROJECTS
    const beneficiaries = await Beneficiary.find({
      projectId: { $in: projectIds },
    });

    res.status(200).json({
      success: true,
      count: beneficiaries.length,
      data: beneficiaries,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};