import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ChevronDown, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import SuccessModal from '../../components/modals/SuccessModal';

const RegisterBeneficiary = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const PO_ID = storedUser?.id || storedUser?._id;

  const [projects, setProjects] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [regionalData, setRegionalData] = useState({
    projectId: '',
    year: 2026,
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
      trainingDetails: { date: '', type: '' },
      specifications: [] 
    }
  ]);

  useEffect(() => {
    if (!token || !storedUser) {
      console.warn("Unauthorized access. Redirecting...");
      navigate("/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!PO_ID || !token) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/projects/programme-officer/${PO_ID}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data.data || []);
      } catch (err) {
        console.error("Fetch error", err);
        if (err.response?.status === 401) navigate("/login");
      }
    };
    fetchProjects();
  }, [PO_ID, token, navigate]);

  // --- LIVE VALIDATION LOGIC ---
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
      case 'gewog':
      case 'village':
        if (/[0-9]/.test(value)) error = `${name.charAt(0).toUpperCase() + name.slice(1)} cannot contain numbers.`;
        break;
      case 'dzongkhag':
        if (!regionalData.projectId) error = "Please select a Project first.";
        break;
      default:
        break;
    }
    setFieldErrors(prev => ({ ...prev, [errorKey]: error }));
  };

  const getTextColor = (value) => value ? "text-black" : "text-gray-400";
  const selectedProject = projects.find(p => p._id === regionalData.projectId);
  
  const availableDzongkhags = [];
  if (selectedProject && selectedProject.dzongkhag) {
    if (Array.isArray(selectedProject.dzongkhag)) {
      availableDzongkhags.push(...selectedProject.dzongkhag);
    } else {
      availableDzongkhags.push(selectedProject.dzongkhag.toString());
    }
  }

  const handleRegionalChange = (field, value) => {
    if ((field === 'gewog' || field === 'village') && /[0-9]/.test(value)) {
      return; 
    }
    setRegionalData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleBeneficiaryChange = (index, field, value) => {
    const updated = [...beneficiaries];
    if (field === 'cid') {
      const cleanVal = value.replace(/[^0-9]/g, '');
      updated[index][field] = cleanVal;
      setBeneficiaries(updated);
      validateField('cid', cleanVal, index);
      return;
    }
    if (field === 'name' && /[0-9]/.test(value)) {
      return;
    }
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

  // --- Dynamic Intervention Plan Array Operations ---
  const addActivity = () => {
    const lastItemType = keyActivities[keyActivities.length - 1]?.isTraining;
    setKeyActivities([
      ...keyActivities, { 
        activityName: '', totalQuantity: 0, unit: '', remarks: '',
        isTraining: lastItemType || false,
        trainingDetails: { date: '', type: '' },
        specifications: ['']
      }
    ]);
  };

const handleActivityChange = (idx, field, value) => {
  const newActs = [...keyActivities];
  if (!newActs[idx].specifications) {
    newActs[idx].specifications = [];
  }
  
  if (field === "totalQuantity") {
    const qty = Math.max(0, parseInt(value) || 0);
    newActs[idx].totalQuantity = qty;
    const old = newActs[idx].specifications || [];
    newActs[idx].specifications = Array.from({ length: qty }, (_, i) => old[i] || "");
  } else if (field === "specifications") {
    const { sIdx, val } = value;
    newActs[idx].specifications[sIdx] = val.replace(/[^0-9.]/g, "");
  } else if (field === "isTraining") {
    newActs[idx].isTraining = value;
    if (value) {
      newActs[idx].totalQuantity = 1;
      newActs[idx].unit = "";
      newActs[idx].specifications = [];
      // Initialize training structure safely if not present
      if (!newActs[idx].trainingDetails) {
        newActs[idx].trainingDetails = { startDate: "", endDate: "", type: "" };
      }
    }
  } else if (field.includes(".")) {
    const [p, c] = field.split(".");
    newActs[idx][p] = { ...newActs[idx][p], [c]: value };
  } else {
    newActs[idx][field] = value;
  }
  setKeyActivities(newActs);
};


  // Final Unified Batch Form Submit Execution 
  const handleSubmit = async () => {
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

    for (let i = 0; i < beneficiaries.length; i++) {
      const b = beneficiaries[i];
      if (!b.name || b.cid.length !== 11 || !b.gender || !b.houseNo || !b.thramNo) {
        setErrorMessage(`Please check Row ${i + 1}: Make sure fields are populated completely and CID is exactly 11 digits.`);
        setShowErrorPopup(true);
        return;
      }
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

      // Map beneficiaries data inside a single array block
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

      // Single Unified Payload Object to match Backend Array setup
      const finalPayload = {
        projectId: regionalData.projectId,
        year: parseInt(regionalData.year),
        dzongkhag: regionalData.dzongkhag,
        gewog: regionalData.gewog,
        village: regionalData.village,
        keyActivities: backendInterventions,
        beneficiaries: formattedBeneficiaries
      };

      await axios.post("http://localhost:5000/api/beneficiaries", finalPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsSuccess(true);
      setShowConfirm(false);
      setTimeout(() => navigate("/po/beneficiaries"), 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Beneficiary registration process failed.");
      setShowErrorPopup(true);
    }
  };

  return (
    <>
      <div className="w-full space-y-6 pb-20 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 text-sm hover:text-blue-500 transition-colors">
            <ChevronLeft size={16} /> Back
          </button>
        </div>
        {/* <div className="bg-white w-full p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm"> */}
        <div className="bg-white w-full rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 overflow-hidden">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Register Beneficiary
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-8">
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">1. Regional & Project Assignment</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-sm font-bold text-gray-700">Project *</label>
                  <select required className="w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white text-gray-700"
                    value={regionalData.projectId} onChange={e => {
                      setRegionalData({...regionalData, projectId: e.target.value, dzongkhag: ''});
                      setFieldErrors(prev => ({ ...prev, dzongkhag: "" }));
                    }}>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.projectName}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Reporting Year *</label>
                  <input required type="number" className={`w-full p-2.5 text-sm border rounded-lg outline-none ${fieldErrors.year ? 'border-red-400' : ''}`}
                    value={regionalData.year} onChange={e => handleRegionalChange('year', e.target.value)} />
                  {fieldErrors.year && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.year}</p>}
                </div>
                <div className="space-y-1 relative">
                  <label className="text-sm font-bold text-gray-700">Dzongkhag *</label>
                  <select required className={`w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white capitalize text-gray-700 ${fieldErrors.dzongkhag ? 'border-red-400' : ''}`} 
                    value={regionalData.dzongkhag} onChange={e => handleRegionalChange('dzongkhag', e.target.value)}
                    onClick={() => validateField('dzongkhag', regionalData.dzongkhag)}>
                    <option value="">Select Dzongkhag</option>
                    {availableDzongkhags.map((d, i) => <option key={i} value={d.toLowerCase()}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                  {fieldErrors.dzongkhag && <p className="text-[13px] text-red-500 mt-0.5">{fieldErrors.dzongkhag}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Gewog *</label>
                  <input required type="text" placeholder="Gewog Name" className={`w-full p-2.5 text-sm border rounded-lg outline-none ${fieldErrors.gewog ? 'border-red-400' : ''}`} 
                    value={regionalData.gewog} onChange={e => handleRegionalChange('gewog', e.target.value)} />
                  {fieldErrors.gewog && <p className="text-[13px] text-red-500 mt-0.5">{fieldErrors.gewog}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">Village *</label>
                  <input required type="text" placeholder="Village Name" className={`w-full p-2.5 text-sm border rounded-lg outline-none ${fieldErrors.village ? 'border-red-400' : ''}`} 
                    value={regionalData.village} onChange={e => handleRegionalChange('village', e.target.value)} />
                  {fieldErrors.village && <p className="text-[13px] text-red-500 mt-0.5">{fieldErrors.village}</p>}
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">2. Beneficiary Profile Details</h3>
                <button type="button" onClick={addBeneficiaryRow} className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 p-1.5 px-3 border border-blue-200 rounded-lg transition-all">
                  <Plus size={14}/> Add Row
                </button>
              </div>          
              {/* <div className="w-full overflow-x-auto border border-gray-100 rounded-lg bg-white shadow-inner"> */}
              <div className="w-full overflow-x-auto rounded-lg border bg-white shadow-inner">
                {/* <table className="w-full text-left border-collapse min-w-[1000px]"> */}
                <table className="w-full min-w-[1300px] border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[5%] text-center">Row</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[18%]">Full Name *</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[15%]">CID Number *</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[12%]">Gender *</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[10%]">House No *</th>
                      <th className="p-3 text-xs font-bold uppercase text-gray-600 w-[12%]">Thram No *</th>
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
                          <input required type="text" placeholder="Name" className={`w-full p-2 text-sm border rounded-lg outline-none bg-white ${fieldErrors[`name-${bIdx}`] ? 'border-red-400 bg-red-50/30' : ''}`}
                            value={b.name} onChange={e => handleBeneficiaryChange(bIdx, 'name', e.target.value)} />
                          {fieldErrors[`name-${bIdx}`] && <p className="text-[13px] text-red-500 mt-0.5 leading-tight">{fieldErrors[`name-${bIdx}`]}</p>}
                        </td>
                        <td className="p-2">
                          <input required type="text" maxLength={11} placeholder="11-digit CID" className={`w-full p-2 text-sm border rounded-lg outline-none bg-white ${fieldErrors[`cid-${bIdx}`] ? 'border-red-400 bg-red-50/30' : ''}`}
                            value={b.cid} onChange={e => handleBeneficiaryChange(bIdx, 'cid', e.target.value)} />
                          {fieldErrors[`cid-${bIdx}`] && <p className="text-[13px] text-red-500 mt-0.5 leading-tight">{fieldErrors[`cid-${bIdx}`]}</p>}
                        </td>
                        <td className="p-2 relative">
                          <select required className="w-full p-2 pr-6 border text-sm rounded-lg outline-none appearance-none bg-white text-gray-700"
                            value={b.gender} onChange={e => handleBeneficiaryChange(bIdx, 'gender', e.target.value)}>
                            <option value="">Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="Others">Others</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-[18px] text-gray-400 pointer-events-none" size={12} />
                        </td>
                        <td className="p-2">
                          <input required type="text" placeholder="House No." className="w-full p-2 text-sm border rounded-lg outline-none bg-white"
                            value={b.houseNo} onChange={e => handleBeneficiaryChange(bIdx, 'houseNo', e.target.value)} />
                        </td>
                        <td className="p-2">
                    <input
  required
  type="text"
  inputMode="numeric"
  placeholder="Thram No"
  className="w-full p-2 text-sm border rounded-lg outline-none bg-white"
  value={b.thramNo}
  onChange={e =>
    handleBeneficiaryChange(
      bIdx,
      'thramNo',
      e.target.value.replace(/[^0-9]/g, '')
    )
  }
/>
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">3. Intervention</h3>
                <button type="button" onClick={addActivity} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 p-1 px-2 rounded-lg transition-colors">
                  <Plus size={16}/> {keyActivities[keyActivities.length-1]?.isTraining ? "Add New Training" : "Add New Activity"}
                </button>
              </div>
              {keyActivities.map((act, idx) => (
                <div key={idx} className="p-5 border border-dashed border-gray-200 rounded-xl space-y-4 relative bg-gray-50/30">
                  {keyActivities.length > 1 && (
                    <button type="button" onClick={() => setKeyActivities(keyActivities.filter((_, i) => i !== idx))} 
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                  )}
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`type-${idx}`} checked={!act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', false)} className="accent-blue-500" />
                      <span className="text-sm font-bold uppercase text-gray-900">Key Activity</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`type-${idx}`} checked={act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', true)} className="accent-blue-500" />
                      <span className="text-sm font-bold uppercase text-gray-900">Training</span>
                    </label>
                  </div>
                  <div className="space-y-1">
                      <label className="text-sm font-bold text-gray-700 ">{act.isTraining ? "Training Name" : "Activity Name"}</label>
                      <input required placeholder={act.isTraining ? "Enter training name..." : "Enter activity name..."} className={`w-full p-2 border-b bg-transparent outline-none focus:border-blue-500 transition-all ${getTextColor(act.activityName)}`} 
                        value={act.activityName} onChange={e => handleActivityChange(idx, 'activityName', e.target.value)} />
                  </div>
                  {act.isTraining ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700 ">Start Date</label>
                        <input 
                          required 
                          type="date" 
                          className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails?.startDate)}`} 
                          value={act.trainingDetails?.startDate ? new Date(act.trainingDetails.startDate).toISOString().split('T')[0] : ""} 
                          onChange={e => handleActivityChange(idx, 'trainingDetails.startDate', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">End Date</label>
                        <input 
                          required 
                          type="date" 
                          className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails?.endDate)}`} 
                          value={act.trainingDetails?.endDate ? new Date(act.trainingDetails.endDate).toISOString().split('T')[0] : ""} 
                          onChange={e => handleActivityChange(idx, 'trainingDetails.endDate', e.target.value)} 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Training Type</label>
                        <input 
                          required 
                          placeholder="e.g. Technical, Financial" 
                          className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails?.type)}`} 
                          value={act.trainingDetails?.type || ""} 
                          onChange={e => handleActivityChange(idx, 'trainingDetails.type', e.target.value)} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 relative">
                        <label className="text-sm font-bold text-gray-700">Unit</label>
                        <select 
                          required 
                          className={`w-full p-2 border rounded-lg outline-none appearance-none bg-white ${getTextColor(act.unit)}`} 
                          value={act.unit} 
                          onChange={e => handleActivityChange(idx, 'unit', e.target.value)}
                        >
                          <option value="" disabled={!!act.unit} className="text-gray-600">Select Unit</option>
                          <option value="Nos" className="text-black">Nos</option>
                          <option value="Litres" className="text-black">Litres</option>
                          <option value="Acres" className="text-black">Acres</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-[35px] text-gray-400 pointer-events-none" size={14} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Quantity</label>
                        <input 
                          required 
                          type="number" 
                          min="0" 
                          className="w-full p-2 border rounded-lg outline-none text-black"
                          value={act.totalQuantity === 0 ? '' : act.totalQuantity} onChange={e => handleActivityChange(idx, 'totalQuantity', e.target.value)} />
                      </div>
                    </div>
                  )}                     
                  {!act.isTraining && act.totalQuantity > 0 && act.unit !== "Nos" && act.unit !== "" && (
                    <div className="space-y-3 p-3 mt-4 bg-white rounded-xl border border-gray-100">
                      <label className="text-sm font-bold text-gray-700">Specifications (optional)</label>
                      <span className="block text-sm sm:text-base text-gray-600 italic leading-relaxed">
                        {act.unit === "Litres" 
                          ? "For the total quantity entered above, please specify the corresponding capacity for each item (e.g., liters per tank (500, 1000))."
                          : `For the total quantity entered above, please specify the corresponding acres for each (e.g., acres per plot (2, 3.4)).`
                        }                      
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {act.specifications.map((spec, sIdx) => (
                          <input 
                            key={sIdx}
                            type="text"
                            placeholder={act.unit === "Litres" ? "Enter capacity" : "Enter acres"}
                            className="p-2 border rounded-lg text-sm outline-none focus:border-blue-400 text-black"
                            value={spec}
                            onChange={(e) => handleActivityChange(idx, 'specifications', { sIdx, val: e.target.value })}
                          />
                        ))}                      
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button type="submit" className="w-full bg-[#2EA1F2] text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#298CD2] transition-color shadow-lg">
              <Save size={20}/> Review and Save 
               {/* ({beneficiaries.length}) */}
            </button>
          </form>
        </div>
      </div>

      {/* ─── MODAL DIALOG CONFIRMATION ─── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30  flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-8 max-w-5xl w-full shadow-xl space-y-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Confirm Beneficiary Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-600 bg-gray-50 p-6 rounded-2xl border">
              <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mb-1">Basic & Location Information</p>
              <p><strong>Project:</strong> <span className="text-black font-medium">{projects.find(p => p._id === regionalData.projectId)?.projectName || 'N/A'}</span></p>
              <p><strong>Reporting Year:</strong> <span className="text-black font-medium">{regionalData.year}</span></p>
              <p><strong>Dzongkhag:</strong> <span className="text-black font-medium capitalize">{regionalData.dzongkhag}</span></p>
              <p><strong>Gewog:</strong> <span className="text-black font-medium">{regionalData.gewog}</span></p>
              <p><strong>Village:</strong> <span className="text-black font-medium">{regionalData.village}</span></p>
              
              <div className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">
                Beneficiary Profiles ({beneficiaries.length})
              </div>
              <div className="md:col-span-2 space-y-3 max-h-40 overflow-y-auto pr-2">
                {beneficiaries.map((b, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
                    <p className="font-bold text-gray-900 mb-1">Row {idx + 1}: {b.name || 'N/A'}</p>
                    <div className="grid grid-cols-2 gap-1">
                      <p><strong>CID:</strong> {b.cid}</p>
                      <p><strong>Gender:</strong> {b.gender === 'M' ? 'Male' : b.gender === 'F' ? 'Female' : 'Others'}</p>
                      <p><strong>House No:</strong> {b.houseNo}</p>
                      <p><strong>Thram No:</strong> {b.thramNo}</p>
                      <p className="col-span-2"><strong>Indirect:</strong> Male: {b.indirectMale || 0} | Female: {b.indirectFemale || 0}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Interventions ({keyActivities.length})</p>
              <div className="md:col-span-2 space-y-3">
                {keyActivities.map((act, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-gray-100">
                    <p className="font-bold text-black">{act.isTraining ? 'Training:' : 'Activity:'} {act.activityName}</p>
                    <p className="text-xs text-gray-500">
                      {act.isTraining 
                        ? `Duration: ${act.trainingDetails?.startDate ? new Date(act.trainingDetails.startDate).toLocaleDateString() : 'N/A'} to ${act.trainingDetails?.endDate ? new Date(act.trainingDetails.endDate).toLocaleDateString() : 'N/A'} | Type: ${act.trainingDetails?.type || 'N/A'}` 
                        : `Quantity: ${act.totalQuantity} ${act.unit}`}
                    </p>
                    {!act.isTraining && act.specifications && act.specifications.filter(s => s !== "").length > 0 && (
                      <p className="text-xs italic text-gray-400 mt-1">Details: {act.specifications.filter(s => s !== "").join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="flex gap-4"> 
              <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 p-4 border rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Go Back</button> 
              <button onClick={handleSubmit} className="flex-1 p-4 bg-[#2EA1F2] text-white rounded-xl font-bold hover:bg-[#298CD2] transition-color shadow-md">Confirm & Save</button>
            </div>           */}
<div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
  
  <button
    type="button"
    onClick={() => setShowConfirm(false)}
    className="w-full sm:w-auto px-6 py-3 sm:min-w-[140px] border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all"
  >
    Go Back
  </button>

  <button
    onClick={handleSubmit}
    className="w-full sm:w-auto px-6 py-3 sm:min-w-[180px] bg-[#2EA1F2] text-white rounded-lg font-bold hover:bg-[#298CD2] transition-all shadow-md"
  >
    Confirm & Save
  </button>

</div>
          </div>        
        </div>      
      )}
      
      <SuccessModal isOpen={isSuccess} onClose={() => setIsSuccess(false)} message={`Beneficiary Saved Successfully`} />
      
      {showErrorPopup && (        
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowErrorPopup(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl px-8 py-8 text-center w-full max-w-md border border-gray-100">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">!</div>
            </div>            
            <h2 className="text-lg font-semibold text-gray-700">Action Failed</h2>
            <p className="text-gray-500 mt-2 text-xs leading-relaxed">{errorMessage}</p>
          </div>       
        </div>      
      )}    
    </>  
  );
};

export default RegisterBeneficiary;