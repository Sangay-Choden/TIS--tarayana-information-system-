import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, ChevronDown, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import SuccessModal from '../../components/modals/SuccessModal';

const NewRegister = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const PO_ID = storedUser?.id || storedUser?._id;

  // Track dynamic incoming target path context parameter values safely
  const contextProjectId = location.state?.projectId || "";

  // UI status notification handlers
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Storage states mirroring your exact payload logging parameters
  const [projectDataRaw, setProjectDataRaw] = useState(null);
  const [availableDzongkhags, setAvailableDzongkhags] = useState([]);
  const [availableGewogs, setAvailableGewogs] = useState([]);
  const [availableVillages, setAvailableVillages] = useState([]);
  const [projectActivitiesList, setProjectActivitiesList] = useState([]);

  // Controlled UI submission object state slices
  const [regionalData, setRegionalData] = useState({
    projectId: contextProjectId,
    projectName: '',
    year: '',
    dzongkhag: '',
    gewog: '',
    village: ''
  });

  const [beneficiaries, setBeneficiaries] = useState([
    { name: '', cid: '', gender: '', houseNo: '', thramNo: '', indirectMale: 0, indirectFemale: 0 }
  ]);

  const [keyActivities, setKeyActivities] = useState([
    { 
      activityName: '', 
      totalQuantity: '', 
      unit: '', 
      remarks: '',
      isTraining: false,
      trainingDetails: { startDate: '', endDate: '', type: '' },
      specifications: [] 
    }
  ]);

  useEffect(() => {
    if (!token || !storedUser) {
      console.warn("Unauthorized access session token validation failed. Redirecting...");
      navigate("/auth/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  // Fetch specific project summary metrics and breakdown locations
  useEffect(() => {
    const fetchProjectSummary = async () => {
      if (!contextProjectId || !token) {
        console.warn("Skipping summary query: Project target context ID or authorization token missing.");
        return;
      }
      
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const targetUrl = `${baseUrl}/api/projects/summary/${contextProjectId}`;

      try {
        console.log(`Querying project summary structure from endpoint: ${targetUrl}`);
        const response = await axios.get(targetUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const summaryData = response.data;
        console.log("Fetched Project Summary Payload:", summaryData);

        if (summaryData) {
          setProjectDataRaw(summaryData);
          
          const projectStartYear = summaryData.project?.startDate
            ? new Date(summaryData.project.startDate).getFullYear()
            : "";

          setRegionalData(prev => ({
            ...prev,
            projectName:
                summaryData.project?.projectName ||
                summaryData.projectName ||
                summaryData.project?.description ||
                "Project Active Workspace",
            year: projectStartYear
          }));

          const projectDzongkhags = summaryData.project?.dzongkhag || summaryData.dzongkhag;
          if (Array.isArray(projectDzongkhags)) {
            setAvailableDzongkhags(projectDzongkhags);
          } else if (projectDzongkhags) {
            setAvailableDzongkhags([projectDzongkhags]);
          }
        } else {
          console.error("Endpoint returned an empty or invalid summary payload matrix.", response);
          setErrorMessage("Failed to read valid layout rules from project summary.");
          setShowErrorPopup(true);
        }
      } catch (err) {
        console.error("Error executing network fetch sequence on project summary router:", err);
        setErrorMessage("Could not parse configuration workspace data profiles correctly.");
        setShowErrorPopup(true);
      }
    };

    fetchProjectSummary();
  }, [contextProjectId, token, API_URL]);

  // Handle cascading filters for locations (Dzongkhag -> Gewog)
  useEffect(() => {
    if (!projectDataRaw || !regionalData.dzongkhag) {
      setAvailableGewogs([]);
      setAvailableVillages([]);
      return;
    }

    const matchingBlocks = projectDataRaw.geographicBreakdown.filter(
      block => block.location?.dzongkhag?.toLowerCase() === regionalData.dzongkhag.toLowerCase()
    );

    const uniqueGewogs = [...new Set(matchingBlocks.map(b => b.location?.gewog).filter(Boolean))];
    setAvailableGewogs(uniqueGewogs);

    if (uniqueGewogs.length === 1) {
      setRegionalData(prev => ({ ...prev, gewog: uniqueGewogs[0] }));
    } else if (!uniqueGewogs.includes(regionalData.gewog)) {
      setRegionalData(prev => ({ ...prev, gewog: '', village: '' }));
    }
  }, [regionalData.dzongkhag, projectDataRaw]);

  // Handle cascading filters for locations (Gewog -> Village)
  useEffect(() => {
    if (!projectDataRaw || !regionalData.dzongkhag || !regionalData.gewog) {
      setAvailableVillages([]);
      return;
    }

    const matchingBlocks = projectDataRaw.geographicBreakdown.filter(
      block => block.location?.dzongkhag?.toLowerCase() === regionalData.dzongkhag.toLowerCase() &&
               block.location?.gewog?.toLowerCase() === regionalData.gewog.toLowerCase()
    );

    const uniqueVillages = [...new Set(matchingBlocks.map(b => b.location?.village).filter(Boolean))];
    setAvailableVillages(uniqueVillages);

    if (uniqueVillages.length === 1) {
      setRegionalData(prev => ({ ...prev, village: uniqueVillages[0] }));
    } else if (!uniqueVillages.includes(regionalData.village)) {
      setRegionalData(prev => ({ ...prev, village: '' }));
    }
  }, [regionalData.gewog, regionalData.dzongkhag, projectDataRaw]);

  // Synchronize target interventions when structural geographic boundaries align
  useEffect(() => {
    console.log("FILTER EFFECT", regionalData);

    if (
      !projectDataRaw ||
      !regionalData.dzongkhag ||
      !regionalData.gewog ||
      !regionalData.village
    ) {
      setProjectActivitiesList([]);
      return;
    }

    const matchingBlocks = projectDataRaw.geographicBreakdown.filter(block => {
      const dz = String(block.location?.dzongkhag || "").trim().toLowerCase();
      const gw = String(block.location?.gewog || "").trim().toLowerCase();
      const vg = String(block.location?.village || "").trim().toLowerCase();

      return (
        dz === String(regionalData.dzongkhag || "").trim().toLowerCase() &&
        gw === String(regionalData.gewog || "").trim().toLowerCase() &&
        vg === String(regionalData.village || "").trim().toLowerCase()
      );
    });

    console.log("MATCHING BLOCKS", matchingBlocks);

    const activities = matchingBlocks.flatMap(block => block.activities || []);
    setProjectActivitiesList(activities);
  }, [projectDataRaw, regionalData.dzongkhag, regionalData.gewog, regionalData.village]);

  // Validation rules implementation processing
  const validateField = (name, value, index = null) => {
    let error = "";
    const errorKey = index !== null ? `${name}-${index}` : name;
    switch (name) {
      case 'year':
        if (value.toString().length !== 4) error = "Year must be exactly 4 digits.";
        break;
      case 'cid':
        if (value.length !== 11 && value.length > 0) error = "CID must be exactly 11 digits.";
        break;
      case 'name':
        if (/[0-9]/.test(value)) error = `Name values cannot contain standard numeric keys.`;
        break;
      case 'thramNo':
        if (value && !/^\d+$/.test(value)) error = "Thram No must contain numbers only.";
        break;
      default:
        break;
    }
    setFieldErrors(prev => ({ ...prev, [errorKey]: error }));
  };

  const handleRegionalChange = (field, value) => {
    console.log("CHANGE:", field, value);

    if (field === "dzongkhag") {
      setRegionalData(prev => ({ ...prev, dzongkhag: value, gewog: "", village: "" }));
      setProjectActivitiesList([]);
      return;
    }
    if (field === "gewog") {
      setRegionalData(prev => ({ ...prev, gewog: value, village: "" }));
      setProjectActivitiesList([]);
      return;
    }
    if (field === "village") {
      setRegionalData(prev => ({ ...prev, village: value }));
      return;
    }
    setRegionalData(prev => ({ ...prev, [field]: value }));
  };

  const handleBeneficiaryChange = (index, field, value) => {
    const updated = [...beneficiaries];
    if (field === 'cid') {
      const cleanVal = value.replace(/[^0-9]/g, '');
      updated[index][field] = cleanVal;
      setBeneficiaries(updated);
      validateField('cid', cleanVal, index);

      const duplicate = beneficiaries.some((b, i) => i !== index && b.cid === cleanVal);
      setFieldErrors(prev => ({
        ...prev,
        [`cid-${index}`]: duplicate ? "Duplicate CID inside submission forms." : cleanVal.length !== 11 && cleanVal.length > 0 ? "CID must be 11 digits." : ""
      }));
      return;
    }
    if (field === 'name' && /[0-9]/.test(value)) return;
    if (field === 'thramNo') value = value.replace(/[^0-9]/g, '');

    updated[index][field] = value;
    setBeneficiaries(updated);
    if (field === 'name') validateField('name', value, index);
  };

  const addBeneficiaryRow = () => {
    setBeneficiaries([...beneficiaries, { name: '', cid: '', gender: '', houseNo: '', thramNo: '', indirectMale: 0, indirectFemale: 0 }]);
  };

  const removeBeneficiaryRow = (index) => {
    if (beneficiaries.length === 1) return;
    const updatedFields = { ...fieldErrors };
    delete updatedFields[`name-${index}`];
    delete updatedFields[`cid-${index}`];
    setFieldErrors(updatedFields);
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index));
  };

  const addActivity = () => {
    const lastItemType = keyActivities[keyActivities.length - 1]?.isTraining;
    setKeyActivities([
      ...keyActivities, { 
        activityName: '', totalQuantity: 0, unit: '', remarks: '',
        isTraining: lastItemType || false,
        trainingDetails: { startDate: '', endDate: '', type: '' },
        specifications: []
      }
    ]);
  };

  const handleActivityChange = (idx, field, value) => {
    const newActs = [...keyActivities];
    
    if (field === "activityName") {
      newActs[idx].activityName = value;
      
      let targetActivityMatch = null;
      const targetBreakdown = projectDataRaw?.geographicBreakdown || projectDataRaw?.breakdown;
      
      if (Array.isArray(targetBreakdown)) {
        const locationMatchedBlock = targetBreakdown.find(block => 
          block.location?.dzongkhag?.toLowerCase() === regionalData.dzongkhag?.toLowerCase() &&
          block.location?.gewog?.toLowerCase() === regionalData.gewog?.toLowerCase() &&
          block.location?.village?.toLowerCase() === regionalData.village?.toLowerCase()
        );

        if (locationMatchedBlock && Array.isArray(locationMatchedBlock.activities)) {
          targetActivityMatch = locationMatchedBlock.activities.find(a => a.activityName === value);
        }

        if (!targetActivityMatch) {
          for (const block of targetBreakdown) {
            const matchedAct = block.activities?.find(a => a.activityName === value);
            if (matchedAct) {
              targetActivityMatch = matchedAct;
              break; 
            }
          }
        }
      }

      if (targetActivityMatch) {
        const totalQty = targetActivityMatch.displayTotal || targetActivityMatch.remarks?.length || targetActivityMatch.totalQuantity || 0;
        newActs[idx].totalQuantity = totalQty;
        newActs[idx].unit = targetActivityMatch.unit || "";
        newActs[idx].isTraining = targetActivityMatch.isTraining || false;
        
        const remarksSpecs = Array.isArray(targetActivityMatch.remarks) ? targetActivityMatch.remarks : [];
        newActs[idx].specifications = Array.from({ length: totalQty }, (_, i) => {
          return remarksSpecs[i] !== undefined ? String(remarksSpecs[i]) : "";
        });
      }
    } else if (field === "isTraining") {
      newActs[idx].isTraining = value;
      if (value) {
        newActs[idx].totalQuantity = 1;
        newActs[idx].unit = "";
        newActs[idx].specifications = [];
        newActs[idx].trainingDetails = { startDate: "", endDate: "", type: "" };
      }
    } else if (field.includes(".")) {
      const [p, c] = field.split(".");
      newActs[idx][p] = { ...newActs[idx][p], [c]: value };
    } else {
      newActs[idx][field] = value;
    }
    setKeyActivities(newActs);
  };

  const handleSpecChange = (activityIdx, specIdx, value) => {
    const updatedActivities = [...keyActivities];
    updatedActivities[activityIdx].specifications[specIdx] = value;
    setKeyActivities(updatedActivities);
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    const hasErrors = Object.values(fieldErrors).some(err => err !== "");
    if (hasErrors) {
      setErrorMessage("Please correct the validation errors in the form before proceeding.");
      setShowErrorPopup(true);
      return;
    }

    const missingRegional = !regionalData.projectId || !regionalData.dzongkhag || !regionalData.gewog || !regionalData.village || !regionalData.year;
    if (missingRegional) {
      setErrorMessage("Please fill all required regional configuration assignment options.");
      setShowErrorPopup(true);
      return;
    }

    const cidTracker = new Set();
    for (let i = 0; i < beneficiaries.length; i++) {
      const b = beneficiaries[i];
      if (!b.name || b.cid.length !== 11 || !b.gender) {
        setErrorMessage(`Please check Row ${i + 1}: Make sure fields are populated completely`);
        setShowErrorPopup(true);
        return;
      }
      if (cidTracker.has(b.cid)) {
        setErrorMessage(`Duplicate CID detected in Row ${i + 1}. CID '${b.cid}' already exists in this submission.`);
        setShowErrorPopup(true);
        return;
      }
      cidTracker.add(b.cid);
    }

    for (let act of keyActivities) {
      if (!act.isTraining && (!act.unit || act.unit.trim() === "")) {
        setErrorMessage("Please select unit for all activities");
        setShowErrorPopup(true);
        return;
      }
    }

    try {
      const backendInterventions = keyActivities.map(act => act.isTraining ? {
        activityName: act.activityName,
        isTraining: true,
        trainingDetails: act.trainingDetails,
        totalQuantity: 1,
        specifications: []
      } : {
        activityName: act.activityName,
        isTraining: false,
        totalQuantity: act.totalQuantity,
        unit: act.unit,
        specifications: act.specifications.filter(s => s !== "").map(Number)
      });

      const formattedBeneficiaries = beneficiaries.map(b => ({
        name: b.name,
        cid: b.cid,
        gender: b.gender,
        houseNo: b.houseNo,
        thramNo: b.thramNo,
        indirectBeneficiaries: { 
          male: b.indirectMale === '' ? 0 : parseInt(b.indirectMale), 
          female: b.indirectFemale === '' ? 0 : parseInt(b.indirectFemale) 
        }
      }));

      const finalPayload = {
        projectId: regionalData.projectId,
        year: parseInt(regionalData.year),
        dzongkhag: regionalData.dzongkhag,
        gewog: regionalData.gewog,
        village: regionalData.village,
        keyActivities: backendInterventions,
        beneficiaries: formattedBeneficiaries
      };

      await axios.post(`${API_URL}/api/beneficiaries`, finalPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsSuccess(true);
      setTimeout(() => navigate("/po/programmes"), 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Beneficiary registration process failed.");
      setShowErrorPopup(true);
    }
  };

  return (
    <>
      <div className="w-full space-y-6 pb-20 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center text-gray-400 text-sm hover:text-blue-500 transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
        </div>
        
        <div className="bg-white w-full rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 overflow-hidden">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Register Beneficiary</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-8">
            
            {/* ─── SECTION 1: REGIONAL ASSIGNMENT ─── */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">1. Regional & Project Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Project <span className="text-red-500">*</span></label>
                  <input 
                    readOnly
                    type="text"
                    className="w-full p-2.5 border text-sm rounded-lg bg-gray-100 text-gray-500 outline-none font-medium"
                    value={regionalData.projectName || "Loading project settings details..."} 
                  />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">Reporting Year <span className="text-red-500">*</span></label>
                    <input 
                        required 
                        type="number" 
                        className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white text-gray-700 font-medium ${fieldErrors.year ? 'border-red-400' : 'border-gray-200'}`}
                        value={regionalData.year} 
                        onChange={e => handleRegionalChange('year', e.target.value)} 
                    />
                    {fieldErrors.year && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.year}</p>}
                </div>

                <div className="space-y-1 relative">
                  <label className="text-sm font-bold text-gray-700">Dzongkhag <span className="text-red-500">*</span></label>
                  <select required className="w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white capitalize text-gray-700 font-medium" 
                    value={regionalData.dzongkhag} onChange={e => handleRegionalChange('dzongkhag', e.target.value)}>
                    <option value="">Select Dzongkhag</option>
                    {availableDzongkhags.map((d, i) => <option key={i} value={d.toLowerCase()}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-sm font-bold text-gray-700">Gewog <span className="text-red-500">*</span></label>
                  {availableGewogs.length > 1 ? (
                    <>
                      <select required className="w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white capitalize text-gray-700 font-medium"
                        value={regionalData.gewog} onChange={e => handleRegionalChange('gewog', e.target.value)}>
                        <option value="">Select Gewog</option>
                        {availableGewogs.map((g, i) => <option key={i} value={g.toLowerCase()}>{g}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                    </>
                  ) : (
                    <input required type="text" placeholder="Enter Gewog Name" readOnly={availableGewogs.length === 1}
                      className="w-full p-2.5 text-sm border rounded-lg outline-none bg-white capitalize read-only:bg-gray-100 read-only:text-gray-500 text-gray-700 font-medium" 
                      value={regionalData.gewog} onChange={e => handleRegionalChange('gewog', e.target.value)} />
                  )}
                </div>

                <div className="space-y-1 relative">
                  <label className="text-sm font-bold text-gray-700">Village <span className="text-red-500">*</span></label>
                  {availableVillages.length > 1 ? (
                    <>
                      <select required className="w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white capitalize text-gray-700 font-medium"
                        value={regionalData.village} onChange={e => handleRegionalChange('village', e.target.value)}>
                        <option value="">Select Village</option>
                        {availableVillages.map((v, i) => <option key={i} value={v.toLowerCase()}>{v}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                    </>
                  ) : (
                    <input required type="text" placeholder="Enter Village Name" readOnly={availableVillages.length === 1}
                      className="w-full p-2.5 text-sm border rounded-lg outline-none bg-white capitalize read-only:bg-gray-100 read-only:text-gray-500 text-gray-700 font-medium" 
                      value={regionalData.village} onChange={e => handleRegionalChange('village', e.target.value)} />
                  )}
                </div>

              </div>
            </div>

            {/* ─── SECTION 2: BENEFICIARY PROFILES ─── */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">2. Beneficiary Profile Details</h3>
                <button type="button" onClick={addBeneficiaryRow} className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 p-1.5 px-3 border border-blue-200 rounded-lg transition-all">
                  <Plus size={14}/> Add Row
                </button>
              </div>          
              <div className="w-full overflow-x-auto rounded-lg border bg-white shadow-inner">
                <table className="w-full min-w-[1300px] border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[5%] text-center">Row</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[18%]">Full Name <span className="text-red-500">*</span></th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[15%]">CID Number <span className="text-red-500">*</span></th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[12%]">Gender <span className="text-red-500">*</span></th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[10%]">House No</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[12%]">Thram No</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[11%]">Ind. Male</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[11%]">Ind. Female</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[6%] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((b, bIdx) => (
                      <tr key={bIdx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 text-xs font-bold text-gray-400 text-center bg-gray-50/30">{bIdx + 1}</td>
                        <td className="p-2">
                          <input required type="text" placeholder="Name" className="w-full p-2 text-sm border rounded-lg outline-none bg-white"
                            value={b.name} onChange={e => handleBeneficiaryChange(bIdx, 'name', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input required type="text" maxLength={11} placeholder="11-digit CID" className="w-full p-2 text-sm border rounded-lg outline-none bg-white"
                            value={b.cid} onChange={e => handleBeneficiaryChange(bIdx, 'cid', e.target.value)} />
                          {fieldErrors[`cid-${bIdx}`] && <p className="text-[13px] text-red-500 mt-0.5 leading-tight">{fieldErrors[`cid-${bIdx}`]}</p>}
                        </td>
                        <td className="p-2 relative">
                          <select required className="w-full p-2 pr-6 border text-sm rounded-lg outline-none appearance-none bg-white text-gray-700 font-medium"
                            value={b.gender} onChange={e => handleBeneficiaryChange(bIdx, 'gender', e.target.value)}>
                            <option value="">Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="Others">Others</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-[18px] text-gray-400 pointer-events-none" size={12} />
                        </td>
                        <td className="p-2">
                          <input type="text" placeholder="House No." className="w-full p-2 text-xs border rounded-lg outline-none bg-white"
                            value={b.houseNo} onChange={e => handleBeneficiaryChange(bIdx, 'houseNo', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="text" placeholder="Thram No." className="w-full p-2 text-xs border rounded-lg outline-none bg-white"
                            value={b.thramNo} onChange={e => handleBeneficiaryChange(bIdx, 'thramNo', e.target.value)} />
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" placeholder="0" className="w-full p-2 text-sm border rounded-lg outline-none bg-white"
                            value={b.indirectMale === 0 ? '' : b.indirectMale} onChange={e => handleBeneficiaryChange(bIdx, 'indirectMale', Math.max(0, parseInt(e.target.value) || 0))} />
                        </td>
                        <td className="p-2">
                          <input type="number" min="0" placeholder="0" className="w-full p-2 text-sm border rounded-lg outline-none bg-white"
                            value={b.indirectFemale === 0 ? '' : b.indirectFemale} onChange={e => handleBeneficiaryChange(bIdx, 'indirectFemale', Math.max(0, parseInt(e.target.value) || 0))} />
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" disabled={beneficiaries.length === 1} onClick={() => removeBeneficiaryRow(bIdx)}
                            className={`text-red-400 hover:text-red-600 transition-colors ${beneficiaries.length === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── SECTION 3: INTERVENTION WORKSPACE ─── */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">3. Intervention Workspace</h3>
                <button type="button" onClick={addActivity} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 p-1 px-2 rounded-lg transition-colors">
                  <Plus size={16}/> {keyActivities[keyActivities.length-1]?.isTraining ? "Add New Training" : "Add New Activity"}
                </button>
              </div>
              
              {keyActivities.map((act, idx) => (
                <div key={idx} className="p-5 border border-dashed border-gray-200 rounded-xl space-y-4 relative bg-gray-50/30">
                  {keyActivities.length > 1 && (
                    <button type="button" onClick={() => setKeyActivities(keyActivities.filter((_, i) => i !== idx))} 
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className={`grid grid-cols-1 gap-4 pt-4 ${act.isTraining ? 'sm:grid-cols-1' : 'sm:grid-cols-3'}`}>
                    <div className="space-y-1 relative">
                      <label className="text-sm font-bold text-gray-700">Activity Name <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        className="w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white text-gray-700 font-medium"
                        value={act.activityName} 
                        onChange={e => handleActivityChange(idx, 'activityName', e.target.value)}
                      >
                        <option value="">Select Activity</option>
                        {projectActivitiesList.map((item, actIdx) => (
                          <option key={actIdx} value={item.activityName}>
                            {item.activityName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {!act.isTraining && (
                      <>
                        <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700">Total Quantity</label>
                          <input 
                            type="number" 
                            placeholder="Quantity" 
                            className="w-full p-2.5 text-sm border rounded-lg bg-gray-100 text-gray-500 outline-none font-medium" 
                            readOnly 
                            value={act.totalQuantity} 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-bold text-gray-700">Unit Metric</label>
                          <input 
                            type="text" 
                            placeholder="Unit" 
                            className="w-full p-2.5 text-sm border rounded-lg bg-gray-100 text-gray-500 outline-none font-medium" 
                            readOnly 
                            value={act.unit} 
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {!act.isTraining && act.specifications && act.specifications.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold text-gray-600 block">Item Dynamic Specifications Matrix Mapping:</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {act.specifications.map((spec, specIdx) => (
                          <input
                            key={specIdx}
                            type="text"
                            className="p-2 border text-xs rounded-lg bg-white outline-none"
                            placeholder={`Specification Item #${specIdx + 1}`}
                            value={spec}
                            onChange={e => handleSpecChange(idx, specIdx, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Actions Footer Bar */}
            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className=" border px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-all">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2.5 bg-[#3498db] hover:bg-[#2980b9] text-white font-medium text-sm rounded-lg inline-flex items-center gap-2 shadow-sm transition-all">
                <Save size={16} /> Save Register Registration
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Confirmation Prompt Popup Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/40  flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-xl border space-y-4">
            <h4 className="text-base font-bold text-gray-800">Confirm Beneficiary Submission</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Are you sure you want to write these records into the operational ledger program matrices?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowConfirm(false)} className="px-4 py-2 border text-sm font-medium rounded-lg text-gray-500 hover:bg-gray-50">Cancel Check</button>
              <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-[#3498db] text-sm font-medium rounded-lg text-white hover:bg-[#2980b9]">Commit Save</button>
            </div>
          </div>
        </div>
      )}

      {/* API Exception Error Popup Notification */}
      {showErrorPopup && (
        <div className="fixed bottom-5 right-5 z-50 bg-red-50 border border-red-200 p-4 rounded-xl shadow-lg flex items-start gap-3 max-w-md">
          <div className="flex-1 space-y-1">
            <h5 className="text-sm font-bold text-red-800">Operational Request Halt Exception</h5>
            <p className="text-xs text-red-600 leading-normal">{errorMessage}</p>
          </div>
          <button onClick={() => setShowErrorPopup(false)} className="text-red-400 hover:text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-md hover:bg-red-100/50">Dismiss</button>
        </div>
      )}

      {/* Success Modal Mapping Node */}
      <SuccessModal isOpen={isSuccess} onClose={() => setIsSuccess(false)} title="Registration Complete" message="Beneficiary profile metadata written into live persistence targets successfully." />
    </>
  );
};

export default NewRegister;