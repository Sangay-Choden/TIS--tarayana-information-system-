// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Plus, Trash2, Save, ChevronDown , ChevronLeft} from 'lucide-react';
// import axios from 'axios';
// import SuccessModal from '../../components/modals/SuccessModal';

// const RegisterBeneficiary = () => {
//   const navigate = useNavigate();
  
//   // 🔐 1. REAL SESSION RETRIEVAL
//   const token = localStorage.getItem("token");
//   const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
//   const PO_ID = storedUser?.id || storedUser?._id;

//   const [projects, setProjects] = useState([]);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
// const [showErrorPopup, setShowErrorPopup] = useState(false);
// const [errorMessage, setErrorMessage] = useState("");
//   // 🛡️ 2. AUTHENTICATION GUARD
//   useEffect(() => {
//     if (!token || !storedUser) {
//       console.warn("Unauthorized access. Redirecting...");
//       navigate("/login", { replace: true });
//     }
//   }, [token, storedUser, navigate]);

//   const [formData, setFormData] = useState({
//     projectId: '',
//     year: 2026,
//     gender: '',
//     cid: '',
//     name: '',
//     dzongkhag: '',
//     gewog: '',
//     village: '',
//     houseNo: '',
//     thramNo: '',
//     indirectBeneficiaries: { male: 0, female: 0 },
//     keyActivities: [{ 
//       activityName: '', 
//       totalQuantity: '', 
//       unit: '', 
//       remarks: '',
//       isTraining: false,
//       trainingDetails: { date: '', type: '' },
//       specifications: [] 
//     }]
//   });

//   // 📡 3. FETCH PROJECTS USING AUTH HEADERS
//   useEffect(() => {
//     const fetchProjects = async () => {
//       if (!PO_ID || !token) return;
//       try {
//         const res = await axios.get(`http://localhost:5000/api/projects/programme-officer/${PO_ID}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setProjects(res.data.data || []);
//       } catch (err) { 
//         console.error("Fetch error", err);
//         if (err.response?.status === 401) navigate("/login");
//       }
//     };
//     fetchProjects();
//   }, [PO_ID, token]);
  

//   const getTextColor = (value) => value ? "text-black" : "text-gray-400";

//   const selectedProject = projects.find(p => p._id === formData.projectId);
//   const availableDzongkhags = [];
//   if (selectedProject && selectedProject.dzongkhag) {
//     if (Array.isArray(selectedProject.dzongkhag)) {
//       availableDzongkhags.push(...selectedProject.dzongkhag);
//     } else {
//       availableDzongkhags.push(selectedProject.dzongkhag.toString());
//     }
//   }

//   const addActivity = () => {
//     const lastItemType = formData.keyActivities[formData.keyActivities.length - 1]?.isTraining;
//     setFormData({
//       ...formData,
//       keyActivities: [...formData.keyActivities, { 
//         activityName: '', totalQuantity: 0, unit: '', remarks: '',
//         isTraining: lastItemType || false,
//         trainingDetails: { date: '', type: '' },
//         specifications: ['']
//       }]
//     });
//   };



// const handleActivityChange = (idx, field, value) => {
//   const newActs = [...formData.keyActivities];

//   if (!newActs[idx].specifications) {
//     newActs[idx].specifications = [];
//   }

//   // quantity controls specs length
//   if (field === "totalQuantity") {
//     const qty = Math.max(0, parseInt(value) || 0);

//     newActs[idx].totalQuantity = qty;

//     const old = newActs[idx].specifications || [];

//     newActs[idx].specifications = Array.from(
//       { length: qty },
//       (_, i) => old[i] || ""
//     );
//   }

//   // individual spec input
//   else if (field === "specifications") {
//     const { sIdx, val } = value;

//     const clean = val.replace(/[^0-9]/g, "");

//     newActs[idx].specifications[sIdx] = clean;
//   }

//   // training toggle
//   else if (field === "isTraining") {
//     newActs[idx].isTraining = value;

//     if (value) {
//       newActs[idx].totalQuantity = 1;
//       newActs[idx].unit = "";
//       newActs[idx].specifications = [];
//     }
//   }

//   else if (field.includes(".")) {
//     const [p, c] = field.split(".");
//     newActs[idx][p] = {
//       ...newActs[idx][p],
//       [c]: value
//     };
//   }

//   else {
//     newActs[idx][field] = value;
//   }

//   setFormData({ ...formData, keyActivities: newActs });
// };


// const handleSubmit = async () => {
//     try {
//       // Validate
//       for (let act of formData.keyActivities) {
//         if (!act.isTraining && (!act.unit || act.unit.trim() === "")) {
//           setErrorMessage("Please select unit for all activities");
//        setShowErrorPopup(true);

// setTimeout(() => {
//   setShowErrorPopup(false);
// }, 2000);

// return;
//         }
//       }

//       // Clean payload
//       const payload = {
//         ...formData,
//         keyActivities: formData.keyActivities.map(act => {
//           if (act.isTraining) {
//             return {
//               activityName: act.activityName,
//               isTraining: true,
//               trainingDetails: act.trainingDetails,
//               totalQuantity: 1,
//               specifications: []
//             };
//           }
//           return {
//             activityName: act.activityName,
//             isTraining: false,
//             totalQuantity: act.totalQuantity,
//             unit: act.unit,
//             specifications: Array.isArray(act.specifications) 
//             ? act.specifications
//                 .filter(s => s !== "" && s !== null) 
//                 .map(s => Number(s))                
//             : []
//           };
//         })
//       };

//       // API call with Token
//       await axios.post(
//         "http://localhost:5000/api/beneficiaries",
//         payload,
//         {
//           headers: { Authorization: `Bearer ${token}` }
//         }
//       );

//       setIsSuccess(true);
//       setShowConfirm(false);

//       setTimeout(() => {
//         navigate("/po/beneficiaries");
//       }, 2000);

//     } catch (err) {
//       console.error("❌ Error:", err);
//       setErrorMessage(err.response?.data?.message || "Registration failed");
//       setShowErrorPopup(true);

// setTimeout(() => {
//   setShowErrorPopup(false);
// }, 2000);
//     }
//   };

//   // 🛡️ Guard Clause
//   if (!token || !storedUser) return null;







//   return (
//     <>
//    <div className="w-full space-y-6 pb-20 px-4">
//       <button onClick={() => navigate(-1)} 
//            className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
//   <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
//          Back
//       </button>
      
// <div className="w-full ">
// <div className="bg-white w-full p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm">
//         <h2 className="text-xl font-bold mb-6 text-gray-800">Register New Beneficiary</h2>
        
//         <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-6">
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//            <div className="space-y-1 relative">
//               <label className="text-sm font-bold text-gray-700">Project <span className="text-red-500">*</span></label>
//               <select required className={`w-full p-3 border rounded-xl border-blue-100 outline-none appearance-none ${getTextColor(formData.projectId)}`}
//                 value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value, dzongkhag: ''})}>
//                 <option value="" className="text-gray-400">Select associated project</option>
//                 {projects.map(p => <option key={p._id} value={p._id} className="text-black">{p.projectName}</option>)}
//               </select>
//               <ChevronDown className="absolute right-3 top-[38px] text-blue-400 pointer-events-none" size={18} />
//             </div>
//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">Reporting Year <span className="text-red-500">*</span></label>
//               <input required type="number" className={`w-full p-3 border rounded-xl outline-none font-medium ${getTextColor(formData.year)}`} 
//                 value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
//               <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.name)}`} placeholder="Enter Full Name" 
//                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">CID <span className="text-red-500">*</span></label>
//               <input required type="text" maxLength={11} className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.cid)}`} placeholder="Enter 11 Digit CID (Numbers only)" 
//                 value={formData.cid} onChange={e => setFormData({...formData, cid: e.target.value.replace(/[^0-9]/g, '')})} />
//             </div>

//             <div className="space-y-1 relative">
//               <label className="text-sm font-bold text-gray-700">Gender <span className="text-red-500">*</span></label>
//               <select required className={`w-full p-3 border rounded-xl outline-none appearance-none ${getTextColor(formData.gender)}`} 
//                 value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
//                 <option value="" className="text-gray-400">Select Gender</option>
//                 <option value="M" className="text-black">Male</option>
//                 <option value="F" className="text-black">Female</option>
//               </select>
//               <ChevronDown className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" size={18} />
//             </div>

//            <div className="space-y-1 relative">
//               <label className="text-sm font-bold text-gray-700">Dzongkhag <span className="text-red-500">*</span></label>
//               <select required className={`w-full p-3 border rounded-xl outline-none appearance-none capitalize ${getTextColor(formData.dzongkhag)}`} 
//                 value={formData.dzongkhag} onChange={e => setFormData({...formData, dzongkhag: e.target.value})}>
//                 <option value="" className="text-gray-400">Select Dzongkhag</option>
//                 {availableDzongkhags.map((d, index) => <option key={index} value={d.toLowerCase()} className="text-black">{d}</option>)}
//               </select>
//               <ChevronDown className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" size={18} />
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">Gewog <span className="text-red-500">*</span></label>
//               <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.gewog)}`} placeholder="Enter Gewog" 
//               value={formData.gewog} onChange={e => setFormData({...formData, gewog: e.target.value})} />
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">Village <span className="text-red-500">*</span></label>
//               <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.village)}`} placeholder="Enter Village" 
//                 value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">House No <span className="text-red-500">*</span></label>
//               <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.houseNo)}`} placeholder="Enter House No" 
//                 value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
//             </div>

//             <div className="space-y-1">
//               <label className="text-sm font-bold text-gray-700">Thram No <span className="text-red-500">*</span></label>
//               <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.thramNo)}`} placeholder="Enter Thram No (Numbers only)" 
//                 value={formData.thramNo} onChange={e => setFormData({...formData, thramNo: e.target.value.replace(/[^0-9]/g, '')})} />
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-1">
//             <label className="text-xs text-gray-400">Male</label>
//             <input 
//               type="number" 
//               min="0" 
//               className={`p-3 border rounded-xl w-full outline-none ${getTextColor(formData.indirectBeneficiaries.male)}`} 
//               value={formData.indirectBeneficiaries.male === 0 ? '' : formData.indirectBeneficiaries.male} 
//               placeholder="0"
//               onChange={e => {
//                 const val = e.target.value === '' ? 0 : parseInt(e.target.value);
//                 setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, male: Math.max(0, val)}});
//               }} 
//             />
//           </div>
//           <div className="space-y-1">
//             <label className="text-xs text-gray-400">Female</label>
//             <input 
//               type="number" 
//               min="0" 
//               className={`p-3 border rounded-xl w-full outline-none ${getTextColor(formData.indirectBeneficiaries.female)}`} 
//               value={formData.indirectBeneficiaries.female === 0 ? '' : formData.indirectBeneficiaries.female} 
//               placeholder="0"
//               onChange={e => {
//                 const val = e.target.value === '' ? 0 : parseInt(e.target.value);
//                 setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, female: Math.max(0, val)}});
//               }} 
//             />
//           </div>
//         </div>

//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h3 className="font-bold text-gray-900">Intervention</h3>
//               <button type="button" onClick={addActivity} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 p-1 px-2 rounded-lg transition-colors">
//                 <Plus size={16}/> {formData.keyActivities[formData.keyActivities.length-1]?.isTraining ? "Add New Training" : "Add New Activity"}
//               </button>
//             </div>

//             {formData.keyActivities.map((act, idx) => (
//               <div key={idx} className="p-5 border border-dashed border-gray-200 rounded-2xl space-y-4 relative bg-gray-50/30">
//                 {formData.keyActivities.length > 1 && (
//                   <button type="button" onClick={() => setFormData({...formData, keyActivities: formData.keyActivities.filter((_, i) => i !== idx)})} 
//                     className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
//                 )}

//                 <div className="flex gap-4 mb-2">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input type="radio" name={`type-${idx}`} checked={!act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', false)} className="accent-blue-500" />
//                     <span className="text-xs font-bold uppercase text-gray-900">Key Activity</span>
//                   </label>
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input type="radio" name={`type-${idx}`} checked={act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', true)} className="accent-blue-500" />
//                     <span className="text-xs font-bold uppercase text-gray-900">Training</span>
//                   </label>
//                 </div>

//                 <div className="space-y-1">
//                     <label className="text-xs font-bold text-gray-500 uppercase">{act.isTraining ? "Training Name" : "Activity Name"}</label>
//                     <input required placeholder={act.isTraining ? "Enter training name..." : "Enter activity name..."} className={`w-full p-2 border-b bg-transparent outline-none focus:border-blue-500 transition-all ${getTextColor(act.activityName)}`} 
//                       value={act.activityName} onChange={e => handleActivityChange(idx, 'activityName', e.target.value)} />
//                 </div>

//                 {act.isTraining ? (
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-1">
//                       <label className="text-xs font-bold text-gray-500 uppercase">Training Date</label>
//                       <input required type="date" className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails.date)}`} 
//                         value={act.trainingDetails.date} onChange={e => handleActivityChange(idx, 'trainingDetails.date', e.target.value)} />
//                     </div>
//                     <div className="space-y-1">
//                       <label className="text-xs font-bold text-gray-500 uppercase">Training Type</label>
//                       <input required placeholder="e.g. Technical, Financial" className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails.type)}`} 
//                         value={act.trainingDetails.type} onChange={e => handleActivityChange(idx, 'trainingDetails.type', e.target.value)} />
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-1">
//                     <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
//                     <input 
//                       required 
//                       type="number" 
//                       min="0" 
//                       className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.totalQuantity)}`} 
//                       value={act.totalQuantity === 0 ? '' : act.totalQuantity} 
//                       placeholder="0"
//                       onChange={e => {
//                         const val = e.target.value === '' ? 0 : e.target.value;
//                         handleActivityChange(idx, 'totalQuantity', val);
//                       }} 
//                     />
//                   </div>

                  
//                   <div className="space-y-1 relative">
//                   <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
//                   <select 
//                     required 
//                     className={`w-full p-2 border rounded-lg outline-none appearance-none bg-white ${getTextColor(act.unit)}`} 
//                     value={act.unit} 
//                     onChange={e => handleActivityChange(idx, 'unit', e.target.value)}
//                   >
//                     {/* Placeholder: remains grey via getTextColor when value is '' */}
//                     <option value="" disabled={!!act.unit} className="text-gray-400">Select Unit</option>
                    
//                     {/* Real options: explicitly set to text-black */}
//                     <option value="Nos" disabled={act.unit !== '' && act.unit !== 'Nos'} className="text-black">Nos</option>
//                     <option value="Litres" disabled={act.unit !== '' && act.unit !== 'Litres'} className="text-black">Litres</option>
//                     <option value="Acres" disabled={act.unit !== '' && act.unit !== 'Acres'} className="text-black">Acres</option>
//                     {/* <option value="Meters" disabled={act.unit !== '' && act.unit !== 'Meters'} className="text-black">Meters</option> */}
//                   </select>
//                   <ChevronDown className="absolute right-2 top-[28px] text-gray-400 pointer-events-none" size={14} />
//                 </div>


//                   </div>
//                 )}

//                 {!act.isTraining && act.totalQuantity > 0 && (
//                   <div className="space-y-3 p-3 bg-white rounded-xl border border-gray-100">
//                       <label className="text-xs font-bold text-gray-500 uppercase">Specifications (optional)</label>
//                       <span className="block text-sm sm:text-base text-gray-400 italic leading-relaxed">
//                         Please enter numeric values only. For capacity, use total liters (e.g., 500, 1000). 
//                         For land area, use total acres (e.g., 2, 3.5, 10) based on legal deed measurements.
//                       </span>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                         {act.specifications.map((spec, sIdx) => (
//                           <input 
//                             key={sIdx}
                            
//                             placeholder={`Enter amount`}
//                             className="p-2 border rounded-lg text-sm outline-none focus:border-blue-400 text-black" // Added text-black
//                             value={spec}
//                             onChange={(e) => handleActivityChange(idx, 'specifications', { sIdx, val: e.target.value })}
//                           />
//                         ))}
//                       </div>
//                   </div>
//                 )}
//                 <br />
//               </div>
//             ))}
//           </div>

//           <button type="submit" className="w-full bg-[#2EA1F2]  text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#298CD2] transition-color shadow-lg active:scale-[0.98]">
//             <Save size={20}/> Review and Register
//           </button>
//         </form>
//       </div>
//       </div>
//       </div>

//       {showConfirm && (
//         <div className="fixed inset-0 bg-black/40  flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-xl space-y-6 overflow-y-auto max-h-[90vh]">
//             <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Confirm Beneficiary Details</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-600 bg-gray-50 p-6 rounded-2xl border">
//                 <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mb-1">Basic Information</p>
//                 <p><strong>Project:</strong> <span className="text-black font-medium">{projects.find(p => p._id === formData.projectId)?.projectName || 'N/A'}</span></p>
//                 <p><strong>Reporting Year:</strong> <span className="text-black font-medium">{formData.year}</span></p>
//                 <p><strong>Full Name:</strong> <span className="text-black font-medium">{formData.name}</span></p>
//                 <p><strong>CID:</strong> <span className="text-black font-medium">{formData.cid}</span></p>
//                 <p><strong>Gender:</strong> <span className="text-black font-medium">{formData.gender === 'M' ? 'Male' : 'Female'}</span></p>
                
//                 <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Location Details</p>
//                 <p><strong>Dzongkhag:</strong> <span className="text-black font-medium capitalize">{formData.dzongkhag}</span></p>
//                 <p><strong>Gewog:</strong> <span className="text-black font-medium">{formData.gewog}</span></p>
//                 <p><strong>Village:</strong> <span className="text-black font-medium">{formData.village}</span></p>
//                 <p><strong>House No:</strong> <span className="text-black font-medium">{formData.houseNo}</span></p>
//                 <p><strong>Thram No:</strong> <span className="text-black font-medium">{formData.thramNo}</span></p>

//                 <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Indirect Beneficiaries</p>
//                 <p><strong>Male:</strong> <span className="text-black font-medium">{formData.indirectBeneficiaries.male}</span></p>
//                 <p><strong>Female:</strong> <span className="text-black font-medium">{formData.indirectBeneficiaries.female}</span></p>

//                 <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Intervention ({formData.keyActivities.length})</p>
//                 <div className="md:col-span-2 space-y-3">
//                   {formData.keyActivities.map((act, i) => (
//                     <div key={i} className="bg-white p-3 rounded-lg border border-gray-100">
//                       <p className="font-bold text-black">{act.isTraining ? 'Training:' : 'Activity:'} {act.activityName}</p>
//                       <p className="text-xs text-gray-500">
//                         {act.isTraining 
//                           ? `Date: ${act.trainingDetails.date} | Type: ${act.trainingDetails.type}` 
//                           : `Quantity: ${act.totalQuantity} ${act.unit}`}
//                       </p>
//                       {!act.isTraining && act.remarks && <p className="text-xs italic text-gray-400 mt-1">Amount: {act.remarks}</p>}
//                     </div>
//                   ))}
//                 </div>
//             </div>
//             <div className="flex gap-4">
              // <button onClick={() => setShowConfirm(false)} className="flex-1 p-4 border rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Go Back</button>
              // <button onClick={handleSubmit} className="flex-1 p-4 bg-[#2EA1F2] text-white rounded-xl font-bold hover:bg-[#298CD2] transition-color shadow-md">Confirm & Save</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <SuccessModal isOpen={isSuccess} onClose={() => setIsSuccess(false)} message="Beneficiary Registered Successfully" />
// {showErrorPopup && (
//   <div className="fixed inset-0 flex items-center justify-center z-50 px-4">

//     {/* Overlay */}
//     <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

//     {/* Card */}
// <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
//       {/* ICON */}
//       <div className="flex justify-center mb-6">

//         <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">

//           <div className="w-12 h-12 bg-[#AA3333] rounded-full flex items-center justify-center">

//             <svg
//               className="w-6 h-6 text-white"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="3"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 d="M6 18L18 6M6 6l12 12"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>

//           </div>
//         </div>
//       </div>

//       {/* TEXT */}
//       <h2 className="text-lg font-semibold text-gray-700">
//       Action Failed
//       </h2>

//       <p className="text-gray-500 mt-2 text-sm">
//         {errorMessage}
//       </p>

//     </div>
//   </div>
// )}

//     </>
//   );
// };





// export default RegisterBeneficiary;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, ChevronDown , ChevronLeft} from 'lucide-react';
import axios from 'axios';
import SuccessModal from '../../components/modals/SuccessModal';

const RegisterBeneficiary = () => {
  const navigate = useNavigate();
  
  // 🔐 1. REAL SESSION RETRIEVAL
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const PO_ID = storedUser?.id || storedUser?._id;

  const [projects, setProjects] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // New State for Live Validation
  const [errors, setErrors] = useState({});
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

  // 🛡️ 2. AUTHENTICATION GUARD
  useEffect(() => {
    if (!token || !storedUser) {
      console.warn("Unauthorized access. Redirecting...");
      navigate("/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  const [formData, setFormData] = useState({
    projectId: '',
    year: 2026,
    gender: '',
    cid: '',
    name: '',
    dzongkhag: '',
    gewog: '',
    village: '',
    houseNo: '',
    thramNo: '',
    indirectBeneficiaries: { male: 0, female: 0 },
    keyActivities: [{ 
      activityName: '', 
      totalQuantity: '', 
      unit: '', 
      remarks: '',
      isTraining: false,
      trainingDetails: { date: '', type: '' },
      specifications: [] 
    }]
  });

  // 📡 3. FETCH PROJECTS USING AUTH HEADERS
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
        if (err.response?.status === 401) navigate("auth/login");
      }
    };
    fetchProjects();
  }, [PO_ID, token]);

  // --- LIVE VALIDATION LOGIC ---
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case 'cid':
        if (value.length !== 11) error = "CID must be exactly 11 digits.";
        break;
      case 'year':
        if (value.toString().length !== 4) error = "Year must be exactly 4 digits.";
        break;
      case 'name':
        if (/[0-9]/.test(value)) error = "Name cannot contain numbers.";
        break;
      case 'gewog':
      case 'village':
        if (/[0-9]/.test(value)) error = `${name.charAt(0).toUpperCase() + name.slice(1)} cannot contain numbers.`;
        break;
      case 'dzongkhag':
        if (!formData.projectId) error = "Please select a Project first.";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const getTextColor = (value) => value ? "text-black" : "text-gray-400";

  const selectedProject = projects.find(p => p._id === formData.projectId);
  const availableDzongkhags = [];
  if (selectedProject && selectedProject.dzongkhag) {
    if (Array.isArray(selectedProject.dzongkhag)) {
      availableDzongkhags.push(...selectedProject.dzongkhag);
    } else {
      availableDzongkhags.push(selectedProject.dzongkhag.toString());
    }
  }

  const addActivity = () => {
    const lastItemType = formData.keyActivities[formData.keyActivities.length - 1]?.isTraining;
    setFormData({
      ...formData,
      keyActivities: [...formData.keyActivities, { 
        activityName: '', totalQuantity: 0, unit: '', remarks: '',
        isTraining: lastItemType || false,
        trainingDetails: { date: '', type: '' },
        specifications: ['']
      }]
    });
  };

  const handleActivityChange = (idx, field, value) => {
    const newActs = [...formData.keyActivities];
    if (!newActs[idx].specifications) {
      newActs[idx].specifications = [];
    }

    if (field === "totalQuantity") {
      const qty = Math.max(0, parseInt(value) || 0);
      newActs[idx].totalQuantity = qty;
      const old = newActs[idx].specifications || [];
      newActs[idx].specifications = Array.from(
        { length: qty },
        (_, i) => old[i] || ""
      );
    }
    else if (field === "specifications") {
      const { sIdx, val } = value;
      const clean = val.replace(/[^0-9.]/g, ""); // Allowed decimals for acres
      newActs[idx].specifications[sIdx] = clean;
    }
    else if (field === "isTraining") {
      newActs[idx].isTraining = value;
      if (value) {
        newActs[idx].totalQuantity = 1;
        newActs[idx].unit = "";
        newActs[idx].specifications = [];
      }
    }
    else if (field.includes(".")) {
      const [p, c] = field.split(".");
      newActs[idx][p] = {
        ...newActs[idx][p],
        [c]: value
      };
    }
    else {
      newActs[idx][field] = value;
    }
    setFormData({ ...formData, keyActivities: newActs });
  };

  const handleSubmit = async () => {
    // Final check for errors before submission
    const hasErrors = Object.values(errors).some(err => err !== "");
    if (hasErrors) {
        setErrorMessage("Please correct the errors in the form before proceeding.");
        setShowErrorPopup(true);
        setTimeout(() => {
            setShowErrorPopup(false);
        }, 2000);
        return;
    }

    try {
      for (let act of formData.keyActivities) {
        if (!act.isTraining && (!act.unit || act.unit.trim() === "")) {
          setErrorMessage("Please select unit for all activities");
       setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);

return;
        }
      }

      const payload = {
        ...formData,
        keyActivities: formData.keyActivities.map(act => {
          if (act.isTraining) {
            return {
              activityName: act.activityName,
              isTraining: true,
              trainingDetails: act.trainingDetails,
              totalQuantity: 1,
              specifications: []
            };
          }
          return {
            activityName: act.activityName,
            isTraining: false,
            totalQuantity: act.totalQuantity,
            unit: act.unit,
            specifications: Array.isArray(act.specifications) 
            ? act.specifications
                .filter(s => s !== "" && s !== null) 
                .map(s => Number(s))                
            : []
          };
        })
      };

      await axios.post(
        "http://localhost:5000/api/beneficiaries",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

            setIsSuccess(true);
      setShowConfirm(false);

      setTimeout(() => {
        navigate("/po/beneficiaries");
      }, 2000);

    } catch (err) {
      console.error("❌ Error:", err);
      setErrorMessage(err.response?.data?.message || "Registration failed");
      setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);
    }
  };

  // 🛡️ Guard Clause
  if (!token || !storedUser) return null;


  return (
    <>
   <div className="w-full space-y-6 pb-20 px-4">
      <button onClick={() => navigate(-1)} 
           className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
         Back
      </button>
      
<div className="w-full ">
<div className="bg-white w-full p-4 sm:p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Register New Beneficiary</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true); }} className="space-y-6">
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-1 relative">
              <label className="text-sm font-bold text-gray-700">Project <span className="text-red-500">*</span></label>
              <select required className={`w-full p-3 border rounded-xl border-blue-100 outline-none appearance-none ${getTextColor(formData.projectId)}`}
                value={formData.projectId} onChange={e => {
                    const val = e.target.value;
                    setFormData({...formData, projectId: val, dzongkhag: ''});
                    setErrors(prev => ({...prev, dzongkhag: ""})); // Clear dzongkhag error when project selected
                }}>
                <option value="" className="text-gray-400">Select associated project</option>
                {projects.map(p => <option key={p._id} value={p._id} className="text-black">{p.projectName}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-[38px] text-blue-400 pointer-events-none" size={18} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Reporting Year <span className="text-red-500">*</span></label>
              <input required type="number" className={`w-full p-3 border rounded-xl outline-none font-medium ${getTextColor(formData.year)} ${errors.year ? 'border-red-500' : ''}`} 
                value={formData.year} onChange={e => {
                    setFormData({...formData, year: e.target.value});
                    validateField('year', e.target.value);
                }} />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.name)} ${errors.name ? 'border-red-500' : ''}`} placeholder="Enter Full Name" 
                value={formData.name} onChange={e => {
                    setFormData({...formData, name: e.target.value});
                    validateField('name', e.target.value);
                }} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">CID <span className="text-red-500">*</span></label>
              <input required type="text" maxLength={11} className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.cid)} ${errors.cid ? 'border-red-500' : ''}`} placeholder="Enter 11 Digit CID" 
                value={formData.cid} onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({...formData, cid: val});
                    validateField('cid', val);
                }} />
              {errors.cid && <p className="text-red-500 text-xs mt-1">{errors.cid}</p>}
            </div>

            <div className="space-y-1 relative">
              <label className="text-sm font-bold text-gray-700">Gender <span className="text-red-500">*</span></label>
              <select required className={`w-full p-3 border rounded-xl outline-none appearance-none ${getTextColor(formData.gender)}`} 
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="" className="text-gray-400">Select Gender</option>
                <option value="M" className="text-black">Male</option>
                <option value="F" className="text-black">Female</option>
                <option value="Others" className="text-black">Others</option>
              </select>
              <ChevronDown className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" size={18} />
            </div>

           <div className="space-y-1 relative">
              <label className="text-sm font-bold text-gray-700">Dzongkhag <span className="text-red-500">*</span></label>
              <select required className={`w-full p-3 border rounded-xl outline-none appearance-none capitalize ${getTextColor(formData.dzongkhag)} ${errors.dzongkhag ? 'border-red-500' : ''}`} 
                value={formData.dzongkhag} 
                onFocus={() => validateField('dzongkhag', formData.dzongkhag)}
                onChange={e => {
                    setFormData({...formData, dzongkhag: e.target.value});
                    setErrors(prev => ({...prev, dzongkhag: ""}));
                }}>
                <option value="" className="text-gray-400">Select Dzongkhag</option>
                {availableDzongkhags.map((d, index) => <option key={index} value={d.toLowerCase()} className="text-black">{d}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-[38px] text-gray-400 pointer-events-none" size={18} />
              {errors.dzongkhag && <p className="text-red-500 text-xs mt-1">{errors.dzongkhag}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Gewog <span className="text-red-500">*</span></label>
              <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.gewog)} ${errors.gewog ? 'border-red-500' : ''}`} placeholder="Enter Gewog" 
              value={formData.gewog} onChange={e => {
                  setFormData({...formData, gewog: e.target.value});
                  validateField('gewog', e.target.value);
              }} />
              {errors.gewog && <p className="text-red-500 text-xs mt-1">{errors.gewog}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Village <span className="text-red-500">*</span></label>
              <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.village)} ${errors.village ? 'border-red-500' : ''}`} placeholder="Enter Village" 
                value={formData.village} onChange={e => {
                    setFormData({...formData, village: e.target.value});
                    validateField('village', e.target.value);
                }} />
              {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">House No <span className="text-red-500">*</span></label>
              <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.houseNo)}`} placeholder="Enter House No" 
                value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Thram No <span className="text-red-500">*</span></label>
              <input required type="text" className={`w-full p-3 border rounded-xl outline-none ${getTextColor(formData.thramNo)}`} placeholder="Enter Thram No" 
                value={formData.thramNo} onChange={e => setFormData({...formData, thramNo: e.target.value.replace(/[^0-9]/g, '')})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Male Household Members</label>
            <input 
              type="number" 
              min="0" 
              className={`p-3 border rounded-xl w-full outline-none ${getTextColor(formData.indirectBeneficiaries.male)}`} 
              value={formData.indirectBeneficiaries.male === 0 ? '' : formData.indirectBeneficiaries.male} 
              placeholder="0"
              onChange={e => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, male: Math.max(0, val)}});
              }} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400">Female Household Members</label>
            <input 
              type="number" 
              min="0" 
              className={`p-3 border rounded-xl w-full outline-none ${getTextColor(formData.indirectBeneficiaries.female)}`} 
              value={formData.indirectBeneficiaries.female === 0 ? '' : formData.indirectBeneficiaries.female} 
              placeholder="0"
              onChange={e => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, female: Math.max(0, val)}});
              }} 
            />
          </div>
        </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Intervention</h3>
              <button type="button" onClick={addActivity} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 p-1 px-2 rounded-lg transition-colors">
                <Plus size={16}/> {formData.keyActivities[formData.keyActivities.length-1]?.isTraining ? "Add New Training" : "Add New Activity"}
              </button>
            </div>

            {formData.keyActivities.map((act, idx) => (
              <div key={idx} className="p-5 border border-dashed border-gray-200 rounded-2xl space-y-4 relative bg-gray-50/30">
                {formData.keyActivities.length > 1 && (
                  <button type="button" onClick={() => setFormData({...formData, keyActivities: formData.keyActivities.filter((_, i) => i !== idx)})} 
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                )}

                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={`type-${idx}`} checked={!act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', false)} className="accent-blue-500" />
                    <span className="text-xs font-bold uppercase text-gray-900">Key Activity</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={`type-${idx}`} checked={act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', true)} className="accent-blue-500" />
                    <span className="text-xs font-bold uppercase text-gray-900">Training</span>
                  </label>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">{act.isTraining ? "Training Name" : "Activity Name"}</label>
                    <input required placeholder={act.isTraining ? "Enter training name..." : "Enter activity name..."} className={`w-full p-2 border-b bg-transparent outline-none focus:border-blue-500 transition-all ${getTextColor(act.activityName)}`} 
                      value={act.activityName} onChange={e => handleActivityChange(idx, 'activityName', e.target.value)} />
                </div>

                {act.isTraining ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Training Date</label>
                      <input required type="date" className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails.date)}`} 
                        value={act.trainingDetails.date} onChange={e => handleActivityChange(idx, 'trainingDetails.date', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Training Type</label>
                      <input required placeholder="e.g. Technical, Financial" className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.trainingDetails.type)}`} 
                        value={act.trainingDetails.type} onChange={e => handleActivityChange(idx, 'trainingDetails.type', e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 relative">
                      <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                      <select 
                        required 
                        className={`w-full p-2 border rounded-lg outline-none appearance-none bg-white ${getTextColor(act.unit)}`} 
                        value={act.unit} 
                        onChange={e => handleActivityChange(idx, 'unit', e.target.value)}
                      >
                        <option value="" disabled={!!act.unit} className="text-gray-400">Select Unit</option>
                        <option value="Nos" className="text-black">Nos</option>
                        <option value="Litres" className="text-black">Litres</option>
                        <option value="Acres" className="text-black">Acres</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-[35px] text-gray-400 pointer-events-none" size={14} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                      <input 
                        required 
                        type="number" 
                        min="0" 
                        className={`w-full p-2 border rounded-lg outline-none ${getTextColor(act.totalQuantity)}`} 
                        value={act.totalQuantity === 0 ? '' : act.totalQuantity} 
                        placeholder="0"
                        onChange={e => {
                          const val = e.target.value === '' ? 0 : e.target.value;
                          handleActivityChange(idx, 'totalQuantity', val);
                        }} 
                      />
                    </div>
                  </div>
                )}

                {!act.isTraining && act.totalQuantity > 0 && act.unit !== "Nos" && act.unit !== "" && (
                  <div className="space-y-3 p-3 mt-4 bg-white rounded-xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase">Specifications (optional)</label>
                    
                    <span className="block text-sm sm:text-base text-gray-400 italic leading-relaxed">
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
                <br />
              </div>
            ))}
          </div>

          <button type="submit" className="w-full bg-[#2EA1F2]  text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#298CD2] transition-color shadow-lg active:scale-[0.98]">
            <Save size={20}/> Review and Register
          </button>
        </form>
      </div>
      </div>
</div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Confirm Beneficiary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-600 bg-gray-50 p-6 rounded-2xl border">
                <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mb-1">Basic Information</p>
                <p><strong>Project:</strong> <span className="text-black font-medium">{projects.find(p => p._id === formData.projectId)?.projectName || 'N/A'}</span></p>
                <p><strong>Reporting Year:</strong> <span className="text-black font-medium">{formData.year}</span></p>
                <p><strong>Full Name:</strong> <span className="text-black font-medium">{formData.name}</span></p>
                <p><strong>CID:</strong> <span className="text-black font-medium">{formData.cid}</span></p>
                <p><strong>Gender:</strong> <span className="text-black font-medium">{formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : 'Others'}</span></p>
                
                <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Location Details</p>
                <p><strong>Dzongkhag:</strong> <span className="text-black font-medium capitalize">{formData.dzongkhag}</span></p>
                <p><strong>Gewog:</strong> <span className="text-black font-medium">{formData.gewog}</span></p>
                <p><strong>Village:</strong> <span className="text-black font-medium">{formData.village}</span></p>
                <p><strong>House No:</strong> <span className="text-black font-medium">{formData.houseNo}</span></p>
                <p><strong>Thram No:</strong> <span className="text-black font-medium">{formData.thramNo}</span></p>

                <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Indirect Beneficiaries</p>
                <p><strong>Male:</strong> <span className="text-black font-medium">{formData.indirectBeneficiaries.male}</span></p>
                <p><strong>Female:</strong> <span className="text-black font-medium">{formData.indirectBeneficiaries.female}</span></p>

                <p className="md:col-span-2 text-blue-600 font-bold border-b pb-1 mt-2 mb-1">Intervention ({formData.keyActivities.length})</p>
                <div className="md:col-span-2 space-y-3">
                  {formData.keyActivities.map((act, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-gray-100">
                      <p className="font-bold text-black">{act.isTraining ? 'Training:' : 'Activity:'} {act.activityName}</p>
                      <p className="text-xs text-gray-500">
                        {act.isTraining 
                          ? `Date: ${act.trainingDetails.date} | Type: ${act.trainingDetails.type}` 
                          : `Quantity: ${act.totalQuantity} ${act.unit}`}
                      </p>
                      {!act.isTraining && act.specifications.length > 0 && (
                        <p className="text-xs italic text-gray-400 mt-1">Details: {act.specifications.join(", ")}</p>
                      )}
                    </div>
                  ))}
                </div>
            </div>
            <div className="flex gap-4">
 <button onClick={() => setShowConfirm(false)} className="flex-1 p-4 border rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Go Back</button>
              <button onClick={handleSubmit} className="flex-1 p-4 bg-[#2EA1F2] text-white rounded-xl font-bold hover:bg-[#298CD2] transition-color shadow-md">Confirm & Save</button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal isOpen={isSuccess} onClose={() => setIsSuccess(false)} message="Beneficiary Registered Successfully" />
{showErrorPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-50 px-4">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
<div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
      {/* ICON */}
      <div className="flex justify-center mb-6">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">

          <div className="w-12 h-12 bg-[#AA3333] rounded-full flex items-center justify-center">

            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>
        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-lg font-semibold text-gray-700">
      Action Failed
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        {errorMessage}
      </p>

    </div>
  </div>
)}

    </>
  );
};

export default RegisterBeneficiary;