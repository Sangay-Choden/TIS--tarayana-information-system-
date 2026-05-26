const Beneficiary = require("../models/beneficiaryModel");
const Project = require("../models/projectModel");

/**
 * @desc    Create / register batch beneficiaries for an intervention
 * @route   POST /api/beneficiaries
 */
exports.createBeneficiary = async (req, res) => {
  try {
    const {
      projectId,
      year,
      dzongkhag,
      gewog,
      village,
      keyActivities, 
      beneficiaries  
    } = req.body;

    // 1. Core Validations
    if (!projectId || !year || !dzongkhag || !gewog || !village) {
      return res.status(400).json({ success: false, message: "Missing location or project header data." });
    }
    if (!keyActivities || !Array.isArray(keyActivities) || keyActivities.length === 0) {
      return res.status(400).json({ success: false, message: "At least one key activity or training must be specified." });
    }
    if (!beneficiaries || !Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide at least one beneficiary to register." });
    }

    // 2. Validate Project Existence & Jurisdiction
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Associated project context not found." });
    }

    const allowedDzongkhags = project.dzongkhag.map(d => d.toLowerCase().trim());
    if (!allowedDzongkhags.includes(dzongkhag.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid region. This project only operates within: ${project.dzongkhag.join(", ")}`
      });
    }

    // 3. FIXED: Scoped Uniqueness Validation Check
    // Extract target activity identifiers for composite uniqueness evaluation
    const targetActivityName = keyActivities[0].activityName?.trim();
    const incomingCids = beneficiaries.map(p => p.cid.trim());

    // Search for a document containing BOTH: matching CID AND the exact same activity name
    const duplicateIntervention = await Beneficiary.findOne({
      projectId: projectId,
      cid: { $in: incomingCids },
      "keyActivities.activityName": { $regex: new RegExp(`^${targetActivityName}$`, "i") }
    });

    if (duplicateIntervention) {
      return res.status(400).json({
        success: false,
        message: `Beneficiary with CID ${duplicateIntervention.cid} is already registered under the '${targetActivityName}' intervention for this project.`
      });
    }

    // 4. Map and batch save if all checks pass smoothly
    const documentsToInsert = beneficiaries.map(person => {
      return {
        projectId,
        year,
        dzongkhag,
        gewog,
        village,
        name: person.name,
        cid: person.cid.trim(),
        gender: person.gender,
        houseNo: person.houseNo,
        thramNo: person.thramNo,
        indirectBeneficiaries: person.indirectBeneficiaries || { male: 0, female: 0 },
        keyActivities: keyActivities
      };
    });

    const savedBeneficiaries = await Beneficiary.insertMany(documentsToInsert);

    res.status(201).json({
      success: true,
      message: `${savedBeneficiaries.length} beneficiary records generated and saved successfully.`,
      data: savedBeneficiaries
    });

  } catch (error) {
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
    
    // Tracks uniquely logged individual intervention configurations
    const deduplicationTracker = new Set();

    beneficiaries.forEach((beneficiary) => {
      const dzongkhag = beneficiary.dzongkhag?.toLowerCase()?.trim();
      const gewog = beneficiary.gewog?.toLowerCase()?.trim();
      const village = beneficiary.village?.toLowerCase()?.trim();
      const cid = beneficiary.cid?.toLowerCase()?.trim();

      if (!dzongkhag || !gewog || !village || !cid) return;

      if (!dzongkhagActivitySummary[dzongkhag]) {
        dzongkhagActivitySummary[dzongkhag] = {
          totalActivities: 0,
          activities: {}
        };
      }

      beneficiary.keyActivities?.forEach((activity) => {
        const activityName = activity.activityName?.toLowerCase()?.trim();
        if (!activityName) return;

        // Compound Key Signature to isolate records based on CID instead of Household Number
        const trackingKey = `${dzongkhag}-${gewog}-${village}-${cid}-${activityName}`;

        // Skip calculations if this exact person has already logged this activity at this location
        if (deduplicationTracker.has(trackingKey)) return;
        deduplicationTracker.add(trackingKey);

        dzongkhagActivitySummary[dzongkhag].totalActivities += 1;

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
 * @desc    Update an existing beneficiary (Aligned with Batch Create Architecture)
 * @route   PUT /api/beneficiaries/:id
 */
/**
 * @desc    Update an existing beneficiary (Aligned with Batch Create Architecture)
 * @route   PUT /api/beneficiaries/:id
 */
exports.updateBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      projectId, 
      year, 
      dzongkhag, 
      gewog, 
      village, 
      keyActivities, 
      beneficiaries 
    } = req.body;

    // 1. Locate the master record targeted for configuration updates
    const beneficiary = await Beneficiary.findById(id);
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: "Beneficiary profile not found" });
    }

    // Determine target project identity context dynamically
    const finalProjectId = projectId || beneficiary.projectId;

    // 2. Extract and format individual profile data safely from batch array structure
    let individualProfile = {};
    if (beneficiaries && Array.isArray(beneficiaries) && beneficiaries.length > 0) {
      // Pick the first array entry to update this singular specific beneficiary document
      individualProfile = beneficiaries[0];
    } else if (req.body.name || req.body.cid) {
      // Fallback in case raw parameters are provided on the root level
      individualProfile = req.body;
    }

    // 3. Location & Dzongkhag Matrix Validation against the project profile
    const targetDzongkhag = dzongkhag || individualProfile.dzongkhag || beneficiary.dzongkhag;
    if (targetDzongkhag) {
      const project = await Project.findById(finalProjectId);
      if (!project) {
        return res.status(404).json({ success: false, message: "Associated project assignment not found." });
      }

      const allowedDzongkhags = project.dzongkhag.map(d => d.toLowerCase());
      if (!allowedDzongkhags.includes(targetDzongkhag.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid Dzongkhag constraint selection. This project only operates in: ${project.dzongkhag.join(", ")}`
        });
      }
    }

    // 4. Validate CID duplicate tracking restrictions across project registries
    const targetCid = individualProfile.cid;
    if (targetCid && targetCid !== beneficiary.cid) {
      const cidExists = await Beneficiary.findOne({ 
        cid: targetCid, 
        projectId: finalProjectId,
        _id: { $ne: id } // Exclude current record scope lookup check
      });

      if (cidExists) {
        return res.status(400).json({
          success: false,
          message: "A beneficiary with this structural CID configuration already exists in this target project."
        });
      }
    }

    // 5. Build unified tracking record state payload object mappings
    const consolidatedUpdatePayload = {
      ...(projectId && { projectId }),
      ...(year && { year: parseInt(year) }),
      ...(dzongkhag && { dzongkhag }),
      ...(gewog && { gewog }),
      ...(village && { village }),
      ...(keyActivities && { keyActivities }),
      
      // Inject nested individual profile assignments if explicitly mapped
      ...(individualProfile.name && { name: individualProfile.name }),
      ...(individualProfile.cid && { cid: individualProfile.cid }),
      ...(individualProfile.gender && { gender: individualProfile.gender }),
      ...(individualProfile.hasOwnProperty('houseNo') && {
        houseNo: individualProfile.houseNo
      }),

      ...(individualProfile.hasOwnProperty('thramNo') && {
        thramNo: individualProfile.thramNo
      }),
      ...(individualProfile.indirectBeneficiaries && { indirectBeneficiaries: individualProfile.indirectBeneficiaries })
    };

    // 6. Execute updates to the targeted database profile
    const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(
      id,
      { $set: consolidatedUpdatePayload },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Beneficiary document parameter updates completed successfully.",
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