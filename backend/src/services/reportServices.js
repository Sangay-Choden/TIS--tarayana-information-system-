const Project = require("../models/projectModel");
const Beneficiary = require("../models/beneficiaryModel");
const mongoose = require("mongoose");

exports.buildReportData = async ({
  dateFilter,
  programmes,
  projects,
  officers,
  dzongkhags,
  include = {}
}) => {
  let query = { ...dateFilter };

  // 1. DYNAMIC FILTERING
  // Only filter if it's an array with IDs. Skip if it's "global" or null.
  if (Array.isArray(programmes) && programmes.length > 0) {
    query.programme = { $in: programmes };
  }
  if (Array.isArray(projects) && projects.length > 0) {
    query._id = { $in: projects };
  }
  if (Array.isArray(dzongkhags) && dzongkhags.length > 0) {
    query.dzongkhag = { $in: dzongkhags };
  }
  if (Array.isArray(officers) && officers.length > 0) {
    const officerIds = officers.map(id => new mongoose.Types.ObjectId(id));
    query.$or = [
      { fieldOfficer: { $in: officerIds } },
      { programmeOfficer: { $in: officerIds } }
    ];
  }

  // 2. FETCH PROJECTS
  // Note: Only populate fields that exist in your Schema to avoid StrictPopulateError
  const projectList = await Project.find(query)
    .populate("programme fieldOfficer") 
    .sort({ createdAt: -1 });

  if (projectList.length === 0) {
    return { summary: null, groups: [], groupingMode: "programme" };
  }

  // 3. FETCH BENEFICIARIES
  const beneficiaryQuery = { projectId: { $in: projectList.map(p => p._id) } };
  // Only filter beneficiaries if dzongkhags is a specific list, not "global"
  if (Array.isArray(dzongkhags) && dzongkhags.length > 0) {
    beneficiaryQuery.dzongkhag = { $in: dzongkhags };
  }
  const beneficiaries = await Beneficiary.find(beneficiaryQuery);

  // 4. DETERMINE GROUPING MODE
  // Priority: Officer (Global/Array) > Dzongkhag (Global/Array) > Programme
  // --- 4. DETERMINE GROUPING MODE ---
let groupingMode = "programme";

// Check if we are in Officer mode or Dzongkhag mode
if (officers === "global" || (Array.isArray(officers) && officers.length > 0)) {
  groupingMode = "officer";
} else if (dzongkhags === "global" || (Array.isArray(dzongkhags) && dzongkhags.length > 0)) {
  groupingMode = "dzongkhag";
}

const groupsMap = {};

projectList.forEach(p => {
  let groupKey, groupName;


// --- OFFICER GROUPING ---
if (groupingMode === "officer") {

  const isSpecificSelection =
    Array.isArray(officers) && officers.length > 0;

  // Handle both single object and array properly
  const potentialOfficers = [
    ...(Array.isArray(p.fieldOfficer)
      ? p.fieldOfficer
      : p.fieldOfficer
      ? [p.fieldOfficer]
      : []),

    ...(Array.isArray(p.programmeOfficer)
      ? p.programmeOfficer
      : p.programmeOfficer
      ? [p.programmeOfficer]
      : [])
  ].filter(off => off && off._id);

  let activeOfficer;

  if (isSpecificSelection) {
    activeOfficer = potentialOfficers.find(off =>
      officers.includes(off._id.toString())
    );
  } else {
    activeOfficer = potentialOfficers[0];
  }

  // SAFETY CHECK
  if (!activeOfficer || !activeOfficer._id) {
    groupKey = "unassigned_officer";
    groupName = "";
  } else {
    groupKey = activeOfficer._id.toString();
    groupName =
      activeOfficer.name ||
      activeOfficer.email ||
      "Unnamed Officer";
  }
}
  // --- DZONGKHAG GROUPING ---
  else if (groupingMode === "dzongkhag") {
    const projBeneficiariesInDz = beneficiaries.filter(b => b.projectId.toString() === p._id.toString());
    
    // If we are filtering by specific Dzongkhags, only group by those
    const dzName = projBeneficiariesInDz.length > 0 ? projBeneficiariesInDz[0].dzongkhag : null;

    if (dzName) {
      groupKey = String(dzName).toLowerCase();
      groupName = dzName;
    } else {
      groupKey = "unknown_dz";
      groupName = "Multiple / Unknown Dzongkhags";
    }
  } 
  // --- PROGRAMME GROUPING (Default) ---
  else {
    if (p.programme) {
    const progObj = Array.isArray(p.programme) ? p.programme[0] : p.programme;
    // 2. Try to get a unique ID for the group key
    groupKey = progObj?._id?.toString() || progObj?.toString() || "unknown_prog";

    // 3. Try to get the name for the header
    groupName = progObj?.programmeName || p.programmeName || "Unknown Programme";
    console.log("PROGRAMME HEADER:", groupName);
    } else {
      // If a project isn't linked to a programme object, label it clearly
      groupKey = "general_projects";
      groupName = "General / Multi-Programme Projects";
    }
  }

  // Initialize the group in the map
  if (!groupsMap[groupKey]) {
    groupsMap[groupKey] = { groupTitle: groupName, projects: [] };
  }

  // ... (Rest of your activity calculation logic remains the same)
// --- 5. CALCULATE PROJECT-SPECIFIC DATA ---
  const projBeneficiaries = beneficiaries.filter(b => b.projectId.toString() === p._id.toString());
  
  // Initialize the activity map for THIS specific project
  const activityMap = {};

  projBeneficiaries.forEach(b => {
    (b.keyActivities || []).forEach(act => {
      // Create a unique key for the activity (case-insensitive)
      const key = (act.activityName || "Unknown").toLowerCase().trim();
      
      if (!activityMap[key]) {
        activityMap[key] = { 
          name: act.activityName, 
          total: 0, 
          unit: act.unit || "Nos" 
        };
      }
      activityMap[key].total += Number(act.totalQuantity) || 0;
    });
  });

  // Now activityMap is defined and can be converted to an array safely
  groupsMap[groupKey].projects.push({
    ...p.toObject(),
    beneficiaries: projBeneficiaries,
    projectActivities: Object.values(activityMap)
  });
});
  // 5. METADATA & SUMMARY
  const finalGroups = Object.values(groupsMap);
  const displayedBeneficiaries = finalGroups.flatMap(g => g.projects.flatMap(proj => proj.beneficiaries));
  const allDisplayedProjects = finalGroups.flatMap(group => group.projects);

  const summary = displayedBeneficiaries.reduce((acc, b) => {
    acc.totalBeneficiaries++;
    if (b.gender === 'M') acc.male++;
    if (b.gender === 'F') acc.female++;
    return acc;
  }, { 
    totalProjects: allDisplayedProjects.length, 
    totalBeneficiaries: 0, 
    male: 0, 
    female: 0,
    totalDzongkhags: [...new Set(displayedBeneficiaries.map(b => String(b.dzongkhag || "").toLowerCase()))].filter(Boolean).length
  });

  return { 
    summary, 
    groups: finalGroups, 
    groupingMode,
  meta: { 
  officerNames: Array.isArray(officers) && officers.length > 0
    ? [
        ...new Set(
          projectList.flatMap(p => {
            const allOfficers = [
              ...(Array.isArray(p.fieldOfficer)
                ? p.fieldOfficer
                : p.fieldOfficer
                ? [p.fieldOfficer]
                : []),

              ...(Array.isArray(p.programmeOfficer)
                ? p.programmeOfficer
                : p.programmeOfficer
                ? [p.programmeOfficer]
                : [])
            ];

            return allOfficers
              .filter(
                off =>
                  off &&
                  off._id &&
                  officers.includes(off._id.toString())
              )
              .map(off => off.name || off.email);
          })
        )
      ]
    : ["All Officers"],

  dzongkhagNames: Array.isArray(dzongkhags)
    ? dzongkhags
    : []
}
  };
};