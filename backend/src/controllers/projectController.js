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
      .populate("programme donor partner fieldOfficer");
    
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

    // 1. Helper for parsing capacity (unchanged)
    const parseSpecs = (specsArray) => {
      if (!specsArray || !Array.isArray(specsArray)) return 0;

      return specsArray.reduce((total, num) => {
        return total + Number(num || 0);
      }, 0);
    };

    // 2. Summary (unchanged)
    const summary = beneficiaries.reduce((acc, curr) => {
      acc.totalDirect += 1;
      acc.totalIndirectMale += curr.indirectBeneficiaries?.male || 0;
      acc.totalIndirectFemale += curr.indirectBeneficiaries?.female || 0;
      if (curr.gender?.toLowerCase() === 'm') acc.directMale += 1;
      if (curr.gender?.toLowerCase() === 'f') acc.directFemale += 1;
      return acc;
    }, { totalDirect: 0, directMale: 0, directFemale: 0, totalIndirectMale: 0, totalIndirectFemale: 0 });

    // 3. UPDATED AGGREGATION: Include isTraining and trainingDetails
    const geoStats = await Beneficiary.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(id) } },
      { $unwind: "$keyActivities" },
      {
        $group: {
          _id: {
            dzongkhag: "$dzongkhag",
            gewog: "$gewog",
            village: "$village",
            // If it's training, we use the training type as the name if activityName is missing
            activity: { $ifNull: ["$keyActivities.activityName", "$keyActivities.trainingDetails.type"] },
            isTraining: "$keyActivities.isTraining"
          },
          totalQty: { $sum: "$keyActivities.totalQuantity" },
          attendeeCount: { $sum: 1 }, // Count how many people did this activity/training
          unit: { $first: "$keyActivities.unit" },
          allSpecs: { $push: "$keyActivities.specifications" },
          households: { $addToSet: "$houseNo" }
        }
      }
    ]);

    // 4. UPDATED GEOGRAPHIC BREAKDOWN FORMATTING
    const geographicBreakdown = geoStats.reduce((acc, curr) => {
      const locKey = `${curr._id.dzongkhag}-${curr._id.gewog}-${curr._id.village}`;
      if (!acc[locKey]) {
        acc[locKey] = {
          location: { dzongkhag: curr._id.dzongkhag, gewog: curr._id.gewog, village: curr._id.village },
          totalHouseholds: 0,
          activities: []
        };
      }

      const isTraining = curr._id.isTraining === true;
      const flatSpecs = curr.allSpecs.flat();

      acc[locKey].activities.push({
        activityName: curr._id.activity || "Unnamed Activity",
        isTraining: isTraining,
        // For training, "Total Count" is attendeeCount; for activities, it's totalQuantity
        displayTotal: isTraining ? curr.attendeeCount : curr.totalQty, 
        unit: isTraining ? "Participants" : curr.unit,
        totalCapacitySum: isTraining ? 0 : parseSpecs(flatSpecs),
        remarks: flatSpecs
        // remarks: curr.allSpecs
      });

      acc[locKey].totalHouseholds = acc[locKey].totalHouseholds + curr.households.length;
      return acc;
    }, {});

    // 5. Global Activity Totals (Summary)
    const globalActivityTotals = geoStats.reduce((acc, curr) => {
      const name = curr._id.activity || "Unknown";
      if (!acc[name]) {
        acc[name] = { quantity: 0, attendeeCount: 0, capacity: 0, unit: curr.unit, isTraining: curr._id.isTraining, realQuantity: 0, isConfirmed: false };
      }
      acc[name].quantity += curr.totalQty;
      acc[name].attendeeCount += curr.attendeeCount;
      acc[name].capacity += parseSpecs(curr.allSpecs.flat());
      return acc;
    }, {});

    // / NEW: Merge C&D Verification data into the totals
    if (project.keyActivityVerification && project.keyActivityVerification.length > 0) {
      project.keyActivityVerification.forEach(verification => {
        if (globalActivityTotals[verification.activityName]) {
          globalActivityTotals[verification.activityName].realQuantity = verification.realQuantity;
          // Automatically flag as confirmed if the numbers match exactly
          globalActivityTotals[verification.activityName].isConfirmed = 
            globalActivityTotals[verification.activityName].quantity === verification.realQuantity;
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
    const { verifications } = req.body; // Expecting an array of { activityName, realQuantity }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const beneficiaries = await Beneficiary.find({ projectId: id });

    // 1. Pre-calculate all beneficiary totals once for efficiency
    const beneficiaryTotals = {};
    beneficiaries.forEach(bene => {
      bene.keyActivities.forEach(act => {
        beneficiaryTotals[act.activityName] = (beneficiaryTotals[act.activityName] || 0) + (act.totalQuantity || 0);
      });
    });

    // 2. Process each verification sent in the request
    verifications.forEach(item => {
      const beneTotal = beneficiaryTotals[item.activityName] || 0;
      const isMatched = Number(item.realQuantity) === beneTotal;

      const recordIndex = project.keyActivityVerification.findIndex(v => v.activityName === item.activityName);

      if (recordIndex > -1) {
        project.keyActivityVerification[recordIndex].realQuantity = item.realQuantity;
        project.keyActivityVerification[recordIndex].isConfirmed = isMatched;
      } else {
        project.keyActivityVerification.push({ 
          activityName: item.activityName, 
          realQuantity: item.realQuantity, 
          isConfirmed: isMatched 
        });
      }
    });

    await project.save();
    res.status(200).json({ success: true, message: "All verifications processed", data: project });
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

    // 2. Aggregate actual quantities from Beneficiaries (The "Truth")
    const beneficiaries = await Beneficiary.find({ projectId: id });
    const actualTotals = {};
    beneficiaries.forEach(bene => {
      bene.keyActivities.forEach(act => {
        actualTotals[act.activityName] = (actualTotals[act.activityName] || 0) + (act.totalQuantity || 0);
      });
    });

    // 3. Build the Mismatch Report based on C&D verification array
    let mismatchReport = "";
    project.keyActivityVerification.forEach(v => {
      const currentActual = actualTotals[v.activityName] || 0;
      if (currentActual !== v.realQuantity) {
        mismatchReport += `
        Activity: ${v.activityName}
        - Reported in the project: ${currentActual}
        - Verified in the feild: ${v.realQuantity}
        -------------------------------------------`;
      }
    });

    if (!mismatchReport) {
      return res.status(400).json({ success: false, message: "No mismatches detected." });
    }

    // 4. DEFINE THE LIST (This fixes your error)
    const recipientEmails = [];

    // Add Field Officers if they exist
    if (project.fieldOfficer && project.fieldOfficer.length > 0) {
      project.fieldOfficer.forEach(off => {
        if (off.email) recipientEmails.push(off.email);
      });
    }

    // Add Programme Officer if they exist
    if (project.programmeOfficer && project.programmeOfficer.email) {
      recipientEmails.push(project.programmeOfficer.email);
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(recipientEmails)];

    if (uniqueEmails.length === 0) {
      return res.status(400).json({ success: false, message: "No officer emails found for this project." });
    }

    // 5. Send the Alert
    const { sendDataMismatchAlert } = require("../utils/email"); // Ensure path is correct
    
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

    // --- Helper for parsing capacity (from getProjectView) ---
    const parseSpecs = (specsArray) => {
      if (!specsArray || !Array.isArray(specsArray)) return 0;
      return specsArray.reduce((total, num) => total + Number(num || 0), 0);
    };

    let projectFilter = {};
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;

    // 1. Role-based filtering
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
        summary: { totalProjects: 0, totalDirect: 0, totalIndirect: 0, totalIndirectMale: 0, totalIndirectFemale: 0 }, 
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

    // 3. Process Projects
    projects.forEach(p => {
      const year = p.startDate ? new Date(p.startDate).getFullYear().toString() : "N/A";
      const progName = p.programme?.[0]?.programmeName || "Unassigned";

      stats.projByYear[year] = (stats.projByYear[year] || 0) + 1;
      stats.projByProg[progName] = (stats.projByProg[progName] || 0) + 1;
      
      p.dzongkhag?.forEach(dz => {
        const dName = dz.trim();
        stats.projByDzong[dName] = (stats.projByDzong[dName] || 0) + 1;
        stats.dzongkhags.add(dName.toLowerCase());
      });

      p.programme?.forEach(prog => stats.programmes.add(prog.programmeName));
    });

    // 4. Process Beneficiaries
    beneficiaries.forEach(ben => {
      const year = ben.createdAt ? new Date(ben.createdAt).getFullYear().toString() : "N/A";
      const dzong = ben.dzongkhag || "Unknown";
      
      const parentProject = projects.find(p => p._id.toString() === ben.projectId.toString());
      const progName = parentProject?.programme?.[0]?.programmeName || "Unassigned";

      stats.beneByYear[year] = (stats.beneByYear[year] || 0) + 1;
      stats.beneByDzong[dzong] = (stats.beneByDzong[dzong] || 0) + 1;
      stats.beneByProg[progName] = (stats.beneByProg[progName] || 0) + 1;

      // Totals
      const m = ben.indirectBeneficiaries?.male || 0;
      const f = ben.indirectBeneficiaries?.female || 0;
      stats.totalIndirectMale += m;
      stats.totalIndirectFemale += f;
      stats.totalIndirect += (m + f);

      // Activity processing with Capacity Sum
      ben.keyActivities?.forEach(act => {
        const name = act.activityName || "Unknown";
        if (!stats.activityTotals[name]) {
          stats.activityTotals[name] = { 
            count: 0, 
            isTraining: act.isTraining,
            unit: act.unit || " ",
            totalCapacity: 0 // Initialize capacity
          };
        }

        // Add to count/quantity
        stats.activityTotals[name].count += act.isTraining ? 1 : (Number(act.totalQuantity) || 0);
        
        // Calculate and add capacity for this specific activity entry
        const capacitySum = parseSpecs(act.specifications);
        stats.activityTotals[name].totalCapacity += capacitySum;
      });
    });

    const formatForChart = (obj) => Object.entries(obj).map(([name, value]) => ({ name, value }));

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
          year: formatForChart(stats.beneByYear)
        },
        projects: {
          programme: formatForChart(stats.projByProg),
          dzongkhag: formatForChart(stats.projByDzong),
          year: formatForChart(stats.projByYear)
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


