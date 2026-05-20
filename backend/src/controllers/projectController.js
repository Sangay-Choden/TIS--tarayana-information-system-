const Project = require("../models/projectModel");
const Beneficiary = require("../models/beneficiaryModel");
const mongoose = require("mongoose");
const User = require("../models/userModel"); // Import User model to get email
const { sendProjectAssignmentEmail } = require("../utils/email");
const { sendDataMismatchAlert } = require("../utils/email");


// Add these to your exports in projectController.js

exports.createProject = async (req, res) => {
  try {
    // Set default status if not provided
    const projectData = { ...req.body, status: 'Ongoing', programmeOfficer: req.user.id };
    const project = await Project.create(projectData);

    console.log("✅ Project Created:", project.projectName);

    // Email Logic for Multiple Officers assigned to specific Dzongkhags
    if (project.fieldOfficer && project.fieldOfficer.length > 0) {
      
      // We iterate through field officers and match them with the corresponding Dzongkhag
      const emailPromises = project.fieldOfficer.map(async (officerId, index) => {
        const officer = await User.findById(officerId);
        if (officer) {
          // Match the officer to the dzongkhag by index (Officer 1 -> Dzongkhag 1)
          const assignedDzongkhag = project.dzongkhag[index] || "Assigned Area";
          const displayName = officer.name || officer.email.split('@')[0];

          console.log(`📧 Sending email to ${officer.email} for ${assignedDzongkhag}`);
          
          return sendProjectAssignmentEmail(
            officer.email, 
            displayName, 
            `${project.projectName} (${assignedDzongkhag})`
          );
        }
      });

      // Execute all email sends in background
      Promise.all(emailPromises)
      
        .then(() => console.log("🚀 All officer emails processed."))
        .catch(err => console.error("❌ Email Batch Error:", err));
    }

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// GET projects by Programme Officer ID
exports.getProjectsByProgrammeOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;
    const projects = await Project.find({ programmeOfficer: officerId })
.populate("programme donor partner fieldOfficer programmeOfficer");
    
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET projects by Field Officer ID (Check if ID exists in the array)
exports.getProjectsByFieldOfficer = async (req, res) => {
  try {
    const { officerId } = req.params;
    // MongoDB handles finding a value inside an array automatically with this syntax
    const projects = await Project.find({ fieldOfficer: officerId })
      .populate("programme donor partner fieldOfficer programmeOfficer");

    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getProjectView = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate("donor partner programme fieldOfficer programmeOfficer");
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const beneficiaries = await Beneficiary.find({ projectId: id });

    // 1. Helper to calculate capacity or area sum allocations accurately
    const parseSpecs = (specsArray) => {
      if (!specsArray || !Array.isArray(specsArray)) return 0;
      return specsArray.reduce((total, num) => total + Number(num || 0), 0);
    };

    // 2. Comprehensive Demographics Summary Generation
    const summary = beneficiaries.reduce((acc, curr) => {
      acc.totalDirect += 1;
      acc.totalIndirectMale += curr.indirectBeneficiaries?.male || 0;
      acc.totalIndirectFemale += curr.indirectBeneficiaries?.female || 0;
      
      const genderLower = curr.gender?.toLowerCase();
      if (genderLower === 'm') acc.directMale += 1;
      else if (genderLower === 'f') acc.directFemale += 1;
      else if (genderLower === 'others') {
        if (!acc.directOthers) acc.directOthers = 0;
        acc.directOthers += 1;
      }
      return acc;
    }, { totalDirect: 0, directMale: 0, directFemale: 0, directOthers: 0, totalIndirectMale: 0, totalIndirectFemale: 0 });

    // 3. UPDATED AGGREGATION PIPELINE ENGINE
    const geoStats = await Beneficiary.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$keyActivities" },
      
      // STAGE A: Group strictly by Location + Activity Type.
      {
        $group: {
          _id: {
            dzongkhag: "$dzongkhag",
            gewog: "$gewog",
            village: "$village",
            activity: { $ifNull: ["$keyActivities.activityName", "$keyActivities.trainingDetails.type"] },
            isTraining: "$keyActivities.isTraining"
          },
          // Keep the raw quantity entry value per location
          totalQty: { $max: "$keyActivities.totalQuantity" },
          unit: { $first: "$keyActivities.unit" },
          
          // CRITICAL: Push all specifications arrays into an array-of-arrays matrix
          allSpecsMatrix: { $push: "$keyActivities.specifications" },
          
          // Counts how many distinct citizen records are attached to this specific location match
          directBeneficiaryCount: { $sum: 1 } 
        }
      }
    ]);

    // Create a fast lookup map for verification data using a compound key: activity_dzongkhag_gewog_village
   // Create a fast lookup map for verification data
const verificationMap = {};

    // CRITICAL SAFEGUARD: Ensure array is present and populated before iterating over elements
    if (project.keyActivityVerification && Array.isArray(project.keyActivityVerification)) {
      project.keyActivityVerification.forEach(v => {
        const act = (v.activityName || "").toLowerCase().trim();
        const dzo = (v.dzongkhag || "").toLowerCase().trim();
        const gew = (v.gewog || "").toLowerCase().trim();
        const vil = (v.village || "").toLowerCase().trim();
        const lookupKey = `${act}_${dzo}_${gew}_${vil}`;
        
        verificationMap[lookupKey] = {
          realQuantity: v.realQuantity || 0,
          isConfirmed: v.isConfirmed || false
        };
      });
    }

    // 4. GEOGRAPHIC BREAKDOWN MATRIX FORMATTING (With Direct Counts and Real Quantities injected)
    const geographicBreakdown = geoStats.reduce((acc, curr) => {
      const locKey = `${curr._id.dzongkhag}-${curr._id.gewog}-${curr._id.village}`;
      if (!acc[locKey]) {
        acc[locKey] = {
          location: { 
            dzongkhag: curr._id.dzongkhag, 
            gewog: curr._id.gewog, 
            village: curr._id.village 
          },
          directBeneficiariesCount: 0, 
          activities: []
        };
      }

      const isTraining = curr._id.isTraining === true;
      const flatSpecs = Array.from(new Set(curr.allSpecsMatrix.flat()));

      // Construct lookups to tie stored user modifications back to the breakdown data stream
      const rawActName = curr._id.activity || "Unnamed Activity";
      const searchKey = `${rawActName.toLowerCase().trim()}_${(curr._id.dzongkhag || "").toLowerCase().trim()}_${(curr._id.gewog || "").toLowerCase().trim()}_${(curr._id.village || "").toLowerCase().trim()}`;
      
      const savedVerification = verificationMap[searchKey] || { realQuantity: 0, isConfirmed: false };

      acc[locKey].activities.push({
        activityName: rawActName,
        isTraining: isTraining,
        displayTotal: isTraining ? curr.directBeneficiaryCount : curr.totalQty, 
        realQuantity: savedVerification.realQuantity, // <-- Stored Real Quantity field is mapped here
        isConfirmed: savedVerification.isConfirmed,   // <-- Match confirmation indicator flag mapped here
        unit: isTraining ? "Participants" : curr.unit,
        totalCapacitySum: isTraining ? 0 : parseSpecs(flatSpecs), 
        remarks: flatSpecs,
        directBeneficiariesCount: curr.directBeneficiaryCount
      });

      return acc;
    }, {});

    // 5. Global Activity Totals Summary Calculation
    const globalActivityTotals = geoStats.reduce((acc, curr) => {
      const name = curr._id.activity || "Unknown";
      if (!acc[name]) {
        acc[name] = { 
          quantity: 0, 
          attendeeCount: 0, 
          capacity: 0, 
          unit: curr.unit, 
          isTraining: curr._id.isTraining, 
          realQuantity: 0, 
          isConfirmed: false 
        };
      }
      
      const flatSpecs = Array.from(new Set(curr.allSpecsMatrix.flat()));

      acc[name].quantity += curr.totalQty;
      acc[name].attendeeCount += curr.directBeneficiaryCount;
      acc[name].capacity += parseSpecs(flatSpecs);
      return acc;
    }, {});


    // 6. Cross-reference activity verification data keys for Global Totals
    if (project.keyActivityVerification && project.keyActivityVerification.length > 0) {
      project.keyActivityVerification.forEach(verification => {
        if (globalActivityTotals[verification.activityName]) {
          globalActivityTotals[verification.activityName].realQuantity += (verification.realQuantity || 0);
          globalActivityTotals[verification.activityName].isConfirmed = 
            globalActivityTotals[verification.activityName].quantity === globalActivityTotals[verification.activityName].realQuantity;
        }
      });
    }
    

    res.status(200).json({
      success: true,
      project,
      projectSummary: { ...summary, globalActivityTotals },
      geographicBreakdown: Object.values(geographicBreakdown),
      beneficiaryList: beneficiaries
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("programme donor partner fieldOfficer programmeOfficer");
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this to your projectController.js
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Delete all beneficiaries linked to this project first
    await Beneficiary.deleteMany({ projectId: id });

    // Now delete the project
    await Project.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Project and all associated beneficiaries deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * @desc    Update an existing project
 * @route   PUT /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the project first to see if it exists
    let project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // 2. Update the project
    // { new: true } returns the updated document
    // { runValidators: true } ensures the update follows your Schema rules
    project = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("programme donor partner fieldOfficer");

    console.log(`✅ Project Updated: ${project.projectName}`);

    // 3. Optional: Trigger email if new officers were added in this update
    // You can compare req.body.fieldOfficer with project.fieldOfficer if you want
    // to send emails only to NEWLY assigned officers.

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};












exports.verifyProjectData = async (req, res) => {
  try {
    const { id } = req.params;
    // Expecting the frontend to send an array of locations, matching your breakdown structure:
    // [ { location: { dzongkhag, gewog, village }, activities: [...] }, ... ]
    const { bulkVerifications } = req.body; 

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // CRITICAL BUG FIX: Ensure the array exists to prevent 'Cannot read properties of undefined (reading 'forEach')'
    if (!project.keyActivityVerification) {
      project.keyActivityVerification = [];
    }

    const beneficiaries = await Beneficiary.find({ projectId: id });

    // 1. Pre-calculate beneficiary totals using the compound key
    const beneficiaryTotals = {};
    beneficiaries.forEach(bene => {
      const dzo = (bene.dzongkhag || "").toLowerCase().trim();
      const gew = (bene.gewog || "").toLowerCase().trim();
      const vil = (bene.village || "").toLowerCase().trim();

      bene.keyActivities.forEach(act => {
        const actName = (act.activityName || "").toLowerCase().trim();
        const compoundKey = `${actName}_${dzo}_${gew}_${vil}`;
        
        beneficiaryTotals[compoundKey] = (beneficiaryTotals[compoundKey] || 0) + (act.totalQuantity || 0);
      });
    });

    // 2. Process bulk structural inputs safely
    if (bulkVerifications && Array.isArray(bulkVerifications)) {
      bulkVerifications.forEach(block => {
        const dzo = (block.location?.dzongkhag || "").toLowerCase().trim();
        const gew = (block.location?.gewog || "").toLowerCase().trim();
        const vil = (block.location?.village || "").toLowerCase().trim();

        if (block.activities && Array.isArray(block.activities)) {
          block.activities.forEach(item => {
            const actName = (item.activityName || "").toLowerCase().trim();
            const searchKey = `${actName}_${dzo}_${gew}_${vil}`;

            const beneTotal = beneficiaryTotals[searchKey] || 0;
            const isMatched = Number(item.realQuantity) === beneTotal;

            // Look for existing saved item record in the subdocument database list
            const recordIndex = project.keyActivityVerification.findIndex(v => 
              (v.activityName || "").toLowerCase().trim() === actName &&
              (v.dzongkhag || "").toLowerCase().trim() === dzo &&
              (v.gewog || "").toLowerCase().trim() === gew &&
              (v.village || "").toLowerCase().trim() === vil
            );

            if (recordIndex > -1) {
              project.keyActivityVerification[recordIndex].realQuantity = Number(item.realQuantity);
              project.keyActivityVerification[recordIndex].isConfirmed = isMatched;
            } else {
              project.keyActivityVerification.push({ 
                activityName: item.activityName.trim(), 
                dzongkhag: block.location.dzongkhag.trim(),
                gewog: block.location.gewog.trim(),
                village: block.location.village.trim(),
                realQuantity: Number(item.realQuantity), 
                isConfirmed: isMatched 
              });
            }
          });
        }
      });
    }

    project.markModified('keyActivityVerification');
    await project.save();
    
    res.status(200).json({ success: true, message: "Bulk verifications processed successfully", data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Project as Completed
exports.markAsComplete = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
    res.json({ success: true, message: "Project marked as Completed", data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Project as Inactive
exports.markAsInactive = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { status: 'Inactive' }, { new: true });
    res.json({ success: true, message: "Project marked as Inactive", data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.sendDataAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    // 1. Fetch project and populate officers
    const project = await Project.findById(id)
      .populate("fieldOfficer")
      .populate("programmeOfficer");

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // 2. Aggregate quantities from Beneficiaries with strict normalization
    const beneficiaries = await Beneficiary.find({ projectId: id });
    const actualTotals = {};

    beneficiaries.forEach(bene => {
      const dzo = (bene.dzongkhag || "").toLowerCase().trim();
      const gewog = (bene.gewog || "").toLowerCase().trim();
      const village = (bene.village || "").toLowerCase().trim();

      bene.keyActivities.forEach(act => {
        const actName = (act.activityName || "").toLowerCase().trim();
        
        // Build specific location key
        const compositeKey = `${actName}_${dzo}_${gewog}_${village}`;
        actualTotals[compositeKey] = (actualTotals[compositeKey] || 0) + (act.totalQuantity || 0);
      });
    });

    // 3. Build the Mismatch Report matching locations exactly
    let mismatchReport = "";
    
    project.keyActivityVerification.forEach(v => {
      if (!v.dzongkhag || !v.village) {
        return; // Skip this legacy ghost entry
      }


      const vAct = (v.activityName || "").toLowerCase().trim();
      const vDzo = (v.dzongkhag || "").toLowerCase().trim();
      const vGewog = (v.gewog || "").toLowerCase().trim();
      const vVillage = (v.village || "").toLowerCase().trim();
      
      const compositeKey = `${vAct}_${vDzo}_${vGewog}_${vVillage}`;
      
      // Look up specific location context from actual totals
      const currentActual = actualTotals[compositeKey] || 0;
      
      if (currentActual !== v.realQuantity) {
        // Build clean string representations for the email preview
        const displayDzo = v.dzongkhag ? v.dzongkhag.toUpperCase().trim() : "NOT SPECIFIED";
        const displayGewog = v.gewog ? v.gewog.trim() : "NOT SPECIFIED";
        const displayVillage = v.village ? v.village.trim() : "NOT SPECIFIED";

        mismatchReport += `
Location: ${displayDzo} (Gewog: ${displayGewog}, Village: ${displayVillage})
Activity: ${v.activityName}
- Reported in the project : ${currentActual}
- Verified in the Field : ${v.realQuantity}
-----------------------------------------------------------`;
      }
    });

    if (!mismatchReport) {
      return res.status(400).json({ success: false, message: "No mismatches detected." });
    }

    // 4. Define target recipient emails
    const recipientEmails = [];

    if (project.fieldOfficer && project.fieldOfficer.length > 0) {
      project.fieldOfficer.forEach(off => {
        if (off.email) recipientEmails.push(off.email);
      });
    }

    if (project.programmeOfficer && project.programmeOfficer.email) {
      recipientEmails.push(project.programmeOfficer.email);
    }

    const uniqueEmails = [...new Set(recipientEmails)];

    if (uniqueEmails.length === 0) {
      return res.status(400).json({ success: false, message: "No officer emails found for this project." });
    }

    // 5. Send the Alert
    const { sendDataMismatchAlert } = require("../utils/email"); 
    
    await Promise.all(uniqueEmails.map(email => 
      sendDataMismatchAlert(email, project.projectName, mismatchReport, remark)
    ));

    res.status(200).json({ 
      success: true, 
      message: `Alert sent to ${uniqueEmails.length} officers.` 
    });

  } catch (error) {
    console.error("Alert Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getDashboardSummary = async (req, res) => {
  try {
    const { roleName, userId } = req.params;

    if (!roleName || !userId) {
      return res.status(400).json({ success: false, message: "roleName and userId are required" });
    }

    // --- Helper for parsing capacity sums safely ---
    const parseSpecs = (specsArray) => {
      if (!specsArray || !Array.isArray(specsArray)) return 0;
      return specsArray.reduce((total, num) => total + Number(num || 0), 0);
    };

    let projectFilter = {};
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;

    // 1. Role-based filtering configurations
    if (roleName === "FieldOfficer") {
      projectFilter = { $or: [{ fieldOfficer: userId }, ...(userObjectId ? [{ fieldOfficer: userObjectId }] : [])] };
    } else if (roleName === "ProgrammeOfficer") {
      projectFilter = { $or: [{ programmeOfficer: userId }, ...(userObjectId ? [{ programmeOfficer: userObjectId }] : [])] };
    } else if (roleName === "C&DOfficer" || roleName === "M&EOfficer" || roleName === "Admin" || roleName === "Management") {
      projectFilter = {};
    } else {
      return res.status(400).json({ success: false, message: "Invalid roleName" });
    }

    const projects = await Project.find(projectFilter).populate("programme");
    if (!projects.length) {
      return res.status(200).json({ 
        success: true, 
        summary: { totalProjects: 0, totalDirect: 0, totalIndirect: 0, totalIndirectMale: 0, totalIndirectFemale: 0, dzongkhags: 0, programmes: 0, activityTotals: {} }, 
        charts: {} 
      });
    }

    const projectIds = projects.map(p => p._id);
    const beneficiaries = await Beneficiary.find({ projectId: { $in: projectIds } });

    // 2. Initialize Aggregation Objects
    const stats = {
      dzongkhags: new Set(),
      programmes: new Set(),
      totalIndirect: 0,
      totalIndirectMale: 0,
      totalIndirectFemale: 0,
      activityTotals: {},
      beneByProg: {},
      beneByDzong: {},
      beneByYear: {},
      projByProg: {},
      projByDzong: {},
      projByYear: {}
    };

    // Tracker sets to prevent duplicate counting of spatial data on the dashboard maps/metrics
    const activityLocationTracker = new Map();

    // 3. Process Projects (Aggregates projects by their operational Start Date)
    projects.forEach(p => {
      let projectYear = "N/A";
      if (p.startDate) {
        const dateObj = new Date(p.startDate);
        if (!isNaN(dateObj.getTime())) {
          projectYear = dateObj.getFullYear().toString();
        }
      }
      
      const progName = p.programme?.[0]?.programmeName || "Unassigned";

      stats.projByYear[projectYear] = (stats.projByYear[projectYear] || 0) + 1;
      stats.projByProg[progName] = (stats.projByProg[progName] || 0) + 1;
      
      p.dzongkhag?.forEach(dz => {
        const dName = dz.trim();
        stats.projByDzong[dName] = (stats.projByDzong[dName] || 0) + 1;
        stats.dzongkhags.add(dName.toLowerCase());
      });

      p.programme?.forEach(prog => stats.programmes.add(prog.programmeName));
    });

    // 4. Process Beneficiaries (Aggregates beneficiaries by their OWN entry/creation year)
    beneficiaries.forEach(ben => {
      const parentProject = projects.find(p => p._id.toString() === ben.projectId.toString());
      const progName = parentProject?.programme?.[0]?.programmeName || "Unassigned";
      
      // LOOK HERE: Tries custom fields first, falls back to Mongoose createdAt tracking
      const rawBeneficiaryDate = ben.year || ben.registrationDate || ben.createdAt || ben.date;
      let beneficiaryYear = "N/A";

      if (rawBeneficiaryDate) {
        // If it's already a saved number or string year (e.g. 2024 or "2024"), use it directly
        if (!isNaN(rawBeneficiaryDate) && rawBeneficiaryDate.toString().length === 4) {
          beneficiaryYear = rawBeneficiaryDate.toString();
        } else {
          // Otherwise parse it cleanly as a standard timestamp Date object
          const dateObj = new Date(rawBeneficiaryDate);
          if (!isNaN(dateObj.getTime())) {
            beneficiaryYear = dateObj.getFullYear().toString();
          }
        }
      }

      const dzong = ben.dzongkhag ? ben.dzongkhag.trim().toLowerCase() : "unknown";
      const gewog = ben.gewog ? ben.gewog.trim().toLowerCase() : "unknown";
      const village = ben.village ? ben.village.trim().toLowerCase() : "unknown";

      // Count direct beneficiaries linked to their actual tracking year timeline
      stats.beneByYear[beneficiaryYear] = (stats.beneByYear[beneficiaryYear] || 0) + 1;
      stats.beneByDzong[dzong] = (stats.beneByDzong[dzong] || 0) + 1;
      stats.beneByProg[progName] = (stats.beneByProg[progName] || 0) + 1;

      // Accumulate indirect family beneficiary pools
      const m = ben.indirectBeneficiaries?.male || 0;
      const f = ben.indirectBeneficiaries?.female || 0;
      stats.totalIndirectMale += m;
      stats.totalIndirectFemale += f;
      stats.totalIndirect += (m + f);

      // 5. Activity processing with location validation logic
      ben.keyActivities?.forEach(act => {
        const rawName = act.activityName || act.trainingDetails?.type || "Unknown";
        const name = rawName.trim().toLowerCase();
        const isTraining = act.isTraining === true;

        if (!stats.activityTotals[name]) {
          stats.activityTotals[name] = { 
            count: 0, 
            isTraining: act.isTraining,
            unit: isTraining ? "Participants" : (act.unit || "Nos"),
            totalCapacity: 0 
          };
        }

        const locationActivityKey = `${dzong}-${gewog}-${village}-${name}`;

        if (isTraining) {
          stats.activityTotals[name].count += 1;
        } else {
          if (!activityLocationTracker.has(locationActivityKey)) {
            const capacitySum = parseSpecs(act.specifications);
            const quantity = Number(act.totalQuantity) || 0;

            activityLocationTracker.set(locationActivityKey, { quantity, capacitySum });

            stats.activityTotals[name].count += quantity;
            stats.activityTotals[name].totalCapacity += capacitySum;
          } else {
            const previous = activityLocationTracker.get(locationActivityKey);
            const currentQty = Number(act.totalQuantity) || 0;
            const currentCapacity = parseSpecs(act.specifications);

            if (currentCapacity > previous.capacitySum) {
              stats.activityTotals[name].totalCapacity += (currentCapacity - previous.capacitySum);
              previous.capacitySum = currentCapacity;
            }
            if (currentQty > previous.quantity) {
              stats.activityTotals[name].count += (currentQty - previous.quantity);
              previous.quantity = currentQty;
            }
            activityLocationTracker.set(locationActivityKey, previous);
          }
        }
      });
    });

    // Converts objects to standard formatted chart arrays
    const formatForChart = (obj) => Object.entries(obj).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));

    // Explicitly sorts temporal chart metrics chronologically so line-graphs render properly
    const formatAndSortYears = (obj) => {
      return formatForChart(obj).sort((a, b) => {
        if (a.name === "N/A") return 1; 
        if (b.name === "N/A") return -1;
        return parseInt(a.name) - parseInt(b.name);
      });
    };

    res.status(200).json({
      success: true,
      summary: {
        totalProjects: projects.length,
        ongoing: projects.filter(p => p.status?.toLowerCase() === "ongoing").length,
        completed: projects.filter(p => p.status?.toLowerCase() === "completed").length,
        totalDirect: beneficiaries.length,
        totalIndirect: stats.totalIndirect,
        totalIndirectMale: stats.totalIndirectMale,
        totalIndirectFemale: stats.totalIndirectFemale,
        dzongkhags: stats.dzongkhags.size,
        programmes: stats.programmes.size,
        activityTotals: stats.activityTotals
      },
      charts: {
        beneficiaries: {
          programme: formatForChart(stats.beneByProg),
          dzongkhag: formatForChart(stats.beneByDzong),
          year: formatAndSortYears(stats.beneByYear) // Separated data flow
        },
        projects: {
          programme: formatForChart(stats.projByProg),
          dzongkhag: formatForChart(stats.projByDzong),
          year: formatAndSortYears(stats.projByYear) // Separated data flow
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getProjectsByProgramme = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const Project = require("../models/projectModel");

    const projects = await Project.find({
      programme: { $in: [programmeId] }
    }) .populate("donor")
  .populate("partner");

    res.json({ success: true, projects });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getBeneficiariesByProgramme = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const projects = await Project.find({
      programme: { $in: [programmeId] }
    }).select("_id");

    const projectIds = projects.map(p => p._id);

    const count = await Beneficiary.countDocuments({
      project: { $in: projectIds }
    });

    res.json({ count });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getBeneficiariesByProgramme = async (req, res) => {
  try {
    const { programmeId } = req.params;

    const Project = require("../models/projectModel");
    const Beneficiary = require("../models/beneficiaryModel");

    const projects = await Project.find({
      programme: { $in: [programmeId] }
    }).select("_id");

    const projectIds = projects.map(p => p._id);

    const count = await Beneficiary.countDocuments({
      project: { $in: projectIds }
    });

    res.json({ count });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  console.log("Programme ID:", programmeId);

const projects = await Project.find({
  programme: { $in: [programmeId] }
}).select("_id");

console.log("Projects found:", projects);

const projectIds = projects.map(p => p._id);
console.log("Project IDs:", projectIds);

const count = await Beneficiary.countDocuments({
  project: { $in: projectIds }
});

console.log("Beneficiary count:", count);
};


