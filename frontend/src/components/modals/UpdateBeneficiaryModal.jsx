// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
// import axios from 'axios';

// const UpdateBeneficiaryModal = ({ isOpen, onClose, onUpdate, beneficiary }) => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [projects, setProjects] = useState([]);
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
//      keyActivities: [{ 
//       activityName: '', 
//       totalQuantity: 1, 
//       unit: '', 
//       remarks: '',
//       isTraining: false,
//       trainingDetails: { date: '', type: '' },
//       specifications: [] // Added to track individual specs
//     }]
//   });

// useEffect(() => {
//     const fetchProjects = async () => {
//       // 🔐 Get the real token
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       try {
//         const res = await axios.get(`${API_URL}/api/projects`, {
//           headers: {
//             Authorization: `Bearer ${token}` // ✅ Add this
//           }
//         });
//         setProjects(res.data.data || []);
//       } catch (err) { 
//         console.error("Fetch projects error:", err); 
//       }
//     };
//     fetchProjects();
//   }, []);


//   useEffect(() => {
//     if (beneficiary) {
//       setFormData({
//         projectId: beneficiary.projectId || '',
//         year: beneficiary.year || 2026,
//         gender: beneficiary.gender || '',
//         cid: beneficiary.cid || '',
//         name: beneficiary.name || '',
//         dzongkhag: beneficiary.dzongkhag || '',
//         gewog: beneficiary.gewog || '',
//         village: beneficiary.village || '',
//         houseNo: beneficiary.houseNo || '',
//         thramNo: beneficiary.thramNo || '',
//         indirectBeneficiaries: beneficiary.indirectBeneficiaries || { male: 0, female: 0 },
//         keyActivities: beneficiary.keyActivities?.map(act => {
//           // Sync specifications array with the specifications used in the UI
//           const qty = act.totalQuantity || 0;
//           const existingSpecs = act.specifications || [];
//           const specifications = Array.from({ length: qty }, (_, i) => existingSpecs[i] || "");
          
//           return { 
//             ...act, 
//             isTraining: act.isTraining || false,
//             trainingDetails: {
//               // FIX: Format the date here
//               date: formatDate(act.trainingDetails?.date),
//               type: act.trainingDetails?.type || ''
//             },
//             isNew: false,
//             unit: act.unit || '',
//             specifications: specifications,
//             remarks: specifications.join(", ")
//           };
//         }) || []
//       });
//     }
//   }, [beneficiary]);

//   const getTextColor = (value) => value ? "text-black" : "text-gray-400";
//   const selectedProject = projects.find(p => p._id === formData.projectId);
//   const availableDzongkhags = selectedProject?.dzongkhag
//     ? Array.isArray(selectedProject.dzongkhag) ? selectedProject.dzongkhag : [selectedProject.dzongkhag.toString()]
//     : [];

//   const formatDate = (isoString) => {
//     if (!isoString) return "";
//     return isoString.split('T')[0]; // Takes "2026-04-25" from "2026-04-25T00:00:00.000Z"
//   };


//   const handleActivityChange = (idx, field, value) => {
//     const newActs = [...formData.keyActivities];

//     if (field === "totalQuantity") {
//       const qty = Math.max(0, parseInt(value) || 0);
//       newActs[idx].totalQuantity = qty;
//       const old = newActs[idx].specifications || [];
//       newActs[idx].specifications = Array.from({ length: qty }, (_, i) => old[i] || "");
//     } 
//     else if (field === "specifications") {
//       const { sIdx, val } = value;
//       const clean = val.replace(/[^0-9]/g, ""); // Numbers only
//       const specs = [...(newActs[idx].specifications || [])];
//       specs[sIdx] = clean;
//       newActs[idx].specifications = specs;
//       newActs[idx].remarks = specs.join(", ");
//     }
//     else if (field === "isTraining") {
//       newActs[idx].isTraining = value;
//       if (value) {
//         newActs[idx].totalQuantity = 1;
//         newActs[idx].unit = "";
//         newActs[idx].specifications = [];
//       }
//     }
//     else if (field.includes('.')) {
//       const [parent, child] = field.split('.');
//       newActs[idx][parent] = { ...newActs[idx][parent], [child]: value };
//     } else {
//       newActs[idx][field] = value;
//     }
//     setFormData({ ...formData, keyActivities: newActs });
//   };

//   const addActivity = () => {
//     setFormData({
//       ...formData,
//       keyActivities: [...formData.keyActivities, { 
//         activityName: '', totalQuantity: 1, unit: '', remarks: '',
//         isTraining: false, isNew: true,
//         trainingDetails: { date: '', type: '' },
//         specifications: ['']
//       }]
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const token = localStorage.getItem("token");

//     const payload = {
//       ...formData,
//       keyActivities: formData.keyActivities.map(act => {
//         if (act.isTraining) {
//           return {
//             activityName: act.activityName,
//             isTraining: true,
//             trainingDetails: act.trainingDetails,
//             totalQuantity: 1,
//             specifications: []
//           };
//         }
//         return {
//           activityName: act.activityName,
//           isTraining: false,
//           totalQuantity: act.totalQuantity,
//           unit: act.unit,
//           specifications: Array.isArray(act.specifications) 
//           ? act.specifications
//               .filter(s => s !== "" && s !== null) // Remove empty inputs
//               .map(s => Number(s))                // Convert "100" to 100
//           : []
//         };
//       })
//     };

//     try {
//       await axios.put(
//         `${API_URL}/api/beneficiaries/${beneficiary._id}`, 
//         payload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}` // ✅ Add this
//           }
//         }
//       );
//       onUpdate();
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Update failed");
//     }
//   };



//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             onClick={onClose} className="fixed inset-0 bg-black/40 "
//              />
          
//           <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
//            className="
//   relative
//   bg-white
//   w-full
//   max-w-5xl
//   h-[95vh] sm:h-auto
//   max-h-[95vh]
//   overflow-hidden
//   rounded-xl
//   p-4 sm:p-2
//   shadow-xl
//   flex flex-col
// "
//           >
//             <div className="p-8 pb-0 flex items-center justify-between sticky top-0 bg-white z-10">
//               <div className="space-y-1">
//                 <h3 className="text-2xl font-bold text-gray-900">Update Beneficiary</h3>
//                 <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">
//                   Project: {selectedProject?.projectName || beneficiary?.projectName || "N/A"}
//                 </p>
//               </div>
//               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
//             </div>

//          <form
//   onSubmit={handleSubmit}
//   className="flex-1 overflow-y-auto p-8 space-y-6"
// >
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Reporting Year</label>
//                   <input required type="number" className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.year)}`} 
//                     value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
//                 </div>

//                 <div className="space-y-1 relative">
//                   <label className="text-xs font-bold text-black uppercase">Dzongkhag</label>
//                   <select required className={`w-full p-3 border rounded-xl outline-none appearance-none capitalize font-normal ${getTextColor(formData.dzongkhag)}`} 
//                     value={formData.dzongkhag} onChange={e => setFormData({...formData, dzongkhag: e.target.value})}>
//                     <option value="">Select Dzongkhag</option>
//                     {availableDzongkhags.map((d, i) => (<option key={i} value={d.toLowerCase()}>{d}</option>))}
//                   </select>
//                   <ChevronDown className="absolute right-3 top-[34px] text-gray-400 pointer-events-none" size={18} />
//                 </div>

//                 <div className="space-y-1 relative">
//                   <label className="text-xs font-bold text-black uppercase">Gender</label>
//                   <select required className={`w-full p-3 border rounded-xl outline-none appearance-none font-normal ${getTextColor(formData.gender)}`} 
//                     value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
//                     <option value="">Select Gender</option>
//                     <option value="M">Male</option>
//                     <option value="F">Female</option>
//                   </select>
//                   <ChevronDown className="absolute right-3 top-[34px] text-gray-400 pointer-events-none" size={18} />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Full Name</label>
//                   <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.name)}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">CID</label>
//                   <input required maxLength={11} className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.cid)}`} value={formData.cid} onChange={e => setFormData({...formData, cid: e.target.value.replace(/[^0-9]/g, '')})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Gewog</label>
//                   <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.gewog)}`} value={formData.gewog} onChange={e => setFormData({...formData, gewog: e.target.value})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Village</label>
//                   <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.village)}`} value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">House No</label>
//                   <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.houseNo)}`} value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Thram No</label>
//                   <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.thramNo)}`} value={formData.thramNo} onChange={e => setFormData({...formData, thramNo: e.target.value.replace(/[^0-9]/g, '')})} />
//                 </div>
//               </div>

//               <div className="p-4 bg-gray-50 rounded-2xl grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Indirect Male</label>
//                   <input type="number" min="0" placeholder="0" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(formData.indirectBeneficiaries.male)}`} 
//                     value={formData.indirectBeneficiaries.male === 0 ? '' : formData.indirectBeneficiaries.male} 
//                     onChange={e => setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, male: Math.max(0, parseInt(e.target.value) || 0)}})} />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-xs font-bold text-black uppercase">Indirect Female</label>
//                   <input type="number" min="0" placeholder="0" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(formData.indirectBeneficiaries.female)}`} 
//                     value={formData.indirectBeneficiaries.female === 0 ? '' : formData.indirectBeneficiaries.female} 
//                     onChange={e => setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, female: Math.max(0, parseInt(e.target.value) || 0)}})} />
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-bold text-gray-900">Intervention</h3>
//                   <button type="button" onClick={addActivity} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 p-1 px-2 rounded-lg">
//                     <Plus size={16}/> Add New Intervention
//                   </button>
//                 </div>
//                 {formData.keyActivities.map((act, idx) => (
//                   <div key={idx} className="p-4 border border-dashed border-gray-200 rounded-2xl relative bg-gray-50/30 space-y-3">
//                     <button type="button" onClick={() => setFormData({...formData, keyActivities: formData.keyActivities.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-400"><Trash2 size={16}/></button>
                    
//                     <div className="flex gap-4 mb-2">
//                       <label className="flex items-center gap-2 text-xs font-bold uppercase text-black cursor-pointer">
//                         <input type="radio" checked={!act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', false)} className="accent-blue-500" /> Activity
//                       </label>
//                       <label className="flex items-center gap-2 text-xs font-bold uppercase text-black cursor-pointer">
//                         <input type="radio" checked={act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', true)} className="accent-blue-500" /> Training
//                       </label>
//                     </div>

//                     <div className="space-y-1">
//                       <label className="text-[10px] font-bold text-black uppercase">{act.isTraining ? 'Training Name' : 'Activity Name'}</label>
//                       <input required className={`w-full p-2 border-b bg-transparent outline-none font-normal focus:border-blue-500 ${getTextColor(act.activityName)}`} value={act.activityName} onChange={e => handleActivityChange(idx, 'activityName', e.target.value)} />
//                     </div>

//                     {act.isTraining ? (
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="space-y-1">
//                           <label className="text-[10px] font-bold text-black uppercase">Date</label>
//                           <input required type="date" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(act.trainingDetails.date)}`} value={act.trainingDetails.date} onChange={e => handleActivityChange(idx, 'trainingDetails.date', e.target.value)} />
//                         </div>
//                         <div className="space-y-1">
//                           <label className="text-[10px] font-bold text-black uppercase">Type</label>
//                           <input required className={`w-full p-2 border rounded-lg font-normal ${getTextColor(act.trainingDetails.type)}`} value={act.trainingDetails.type} onChange={e => handleActivityChange(idx, 'trainingDetails.type', e.target.value)} />
//                         </div>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div className="space-y-1">
//                             <label className="text-[10px] font-bold text-black uppercase">Quantity</label>
//                             <input required type="number" min="0" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(act.totalQuantity)}`} 
//                               value={act.totalQuantity === 0 ? '' : act.totalQuantity} 
//                               onChange={e => handleActivityChange(idx, 'totalQuantity', e.target.value)} />
//                           </div>
//                           <div className="space-y-1 relative">
//                             <label className="text-[10px] font-bold text-black uppercase">Unit</label>
//                             <select required className={`w-full p-2 border rounded-lg font-normal appearance-none bg-white ${getTextColor(act.unit)}`} 
//                               value={act.unit} onChange={e => handleActivityChange(idx, 'unit', e.target.value)}>
//                               <option value="" disabled={!!act.unit}>Select Unit</option>
//                               <option value="Nos" disabled={act.unit !== '' && act.unit !== 'Nos'} className="text-black">Nos</option>
//                               <option value="Litres" disabled={act.unit !== '' && act.unit !== 'Litres'} className="text-black">Litres</option>
//                               {/* <option value="Kg" disabled={act.unit !== '' && act.unit !== 'Kg'} className="text-black">Kg</option> */}
//                               <option value="Acres" disabled={act.unit !== '' && act.unit !== 'Acres'} className="text-black">Acres</option>
//                             </select>
//                             <ChevronDown className="absolute right-2 top-[24px] text-gray-400 pointer-events-none" size={14} />
//                           </div>
//                         </div>
//                         {!act.isTraining && act.totalQuantity > 0 && (
//                           <div className="space-y-2">
//                              <label className="text-[10px] font-bold text-black uppercase">Specifications (optional)</label>
//                              <span className="block text-sm sm:text-base text-gray-400 italic leading-relaxed">
//                               Please enter numeric values only. For capacity, use total liters (e.g., 500, 1000). 
//                               For land area, use total acres (e.g., 2, 3.5, 10) based on legal deed measurements.
//                             </span>
//                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                                {act.specifications?.map((spec, sIdx) => (
//                                  <input 
//                                    key={sIdx} 
                                    
//                                    placeholder="Enter amount" 
//                                    className="p-2 border rounded-lg text-sm text-black outline-none focus:border-blue-400"
//                                    value={spec} 
//                                    onChange={e => handleActivityChange(idx, 'specifications', { sIdx, val: e.target.value })} 
//                                  />
//                                ))}
//                              </div>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-end gap-4 pt-6 sticky bottom-0 bg-white pb-2">
//                 <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 border rounded-lg">Cancel</button>
//                 <button type="submit" 
                
//               className="
//   w-full
//   sm:w-auto
//   bg-[#2EA1F2]
//   text-white
//   px-5
//   py-2.5
//   shadow
//   font-bold
//   text-md
//   rounded-lg
//   flex
//   justify-center
//   items-center
//   gap-2
//   hover:bg-[#298CD2]
//   transition-color
// ">
//                   Update</button>
//               </div>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default UpdateBeneficiaryModal;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Plus, Trash2, Save } from 'lucide-react';
import axios from 'axios';

const UpdateBeneficiaryModal = ({ isOpen, onClose, onUpdate, beneficiary }) => {
  const [projects, setProjects] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
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
      totalQuantity: 1, 
      unit: '', 
      remarks: '',
      isTraining: false,
      trainingDetails: { date: '', type: '' },
      specifications: [] 
    }]
  });

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data.data || []);
      } catch (err) { 
        console.error("Fetch projects error:", err); 
      }
    };
    if (isOpen) fetchProjects();
  }, [isOpen]);

  useEffect(() => {
    if (beneficiary) {
      setFormData({
        projectId: beneficiary.projectId || '',
        year: beneficiary.year || 2026,
        gender: beneficiary.gender || '',
        cid: beneficiary.cid || '',
        name: beneficiary.name || '',
        dzongkhag: beneficiary.dzongkhag || '',
        gewog: beneficiary.gewog || '',
        village: beneficiary.village || '',
        houseNo: beneficiary.houseNo || '',
        thramNo: beneficiary.thramNo || '',
        indirectBeneficiaries: beneficiary.indirectBeneficiaries || { male: 0, female: 0 },
        keyActivities: beneficiary.keyActivities?.map(act => {
          const qty = act.totalQuantity || 0;
          const existingSpecs = act.specifications || [];
          const specifications = Array.from({ length: qty }, (_, i) => existingSpecs[i] || "");
          
          return { 
            ...act, 
            isTraining: act.isTraining || false,
            trainingDetails: {
            startDate: formatDate(act.trainingDetails?.startDate),
            endDate: formatDate(act.trainingDetails?.endDate),
            type: act.trainingDetails?.type || ''
          },
            isNew: false,
            unit: act.unit || '',
            specifications: specifications,
            remarks: specifications.join(", ")
          };
        }) || []
      });
      setFieldErrors({});
    }
  }, [beneficiary]);

  const getTextColor = (value) => value ? "text-black" : "text-gray-400";
  const selectedProject = projects.find(p => p._id === formData.projectId);
  const availableDzongkhags = selectedProject?.dzongkhag
    ? Array.isArray(selectedProject.dzongkhag) ? selectedProject.dzongkhag : [selectedProject.dzongkhag.toString()]
    : [];

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return isoString.split('T')[0];
  };

  const validateField = (name, value) => {
    let error = "";
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
      case 'thramNo':
        if (value && !/^\d+$/.test(value)) {
          error = "Thram No must contain numbers only.";
        }
      break;
      default:
        break;
    }
    // setFieldErrors(prev => ({ ...prev, [name]: error }));
    setFieldErrors(prev => ({
    ...prev,
    [name]: error
  }));
  };

  const handleInputChange = (field, value) => {
    if ((field === 'name' || field === 'gewog' || field === 'village') && /[0-9]/.test(value)) {
      return; 
    }
     if (field === 'thramNo') {
      value = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    validateField(field, value);
  };

  const handleActivityChange = (idx, field, value) => {
    const newActs = [...formData.keyActivities];

    if (field === "totalQuantity") {
      const qty = Math.max(0, parseInt(value) || 0);
      newActs[idx].totalQuantity = qty;
      const old = newActs[idx].specifications || [];
      newActs[idx].specifications = Array.from({ length: qty }, (_, i) => old[i] || "");
    } 
    else if (field === "specifications") {
      const { sIdx, val } = value;
      const clean = val.replace(/[^0-9.]/g, "");
      const specs = [...(newActs[idx].specifications || [])];
      specs[sIdx] = clean;
      newActs[idx].specifications = specs;
      newActs[idx].remarks = specs.join(", ");
    }
    else if (field === "isTraining") {
      newActs[idx].isTraining = value;
      if (value) {
        newActs[idx].totalQuantity = 1;
        newActs[idx].unit = "";
        newActs[idx].specifications = [];
      }
    }
    else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newActs[idx][parent] = { ...newActs[idx][parent], [child]: value };
    } else {
      newActs[idx][field] = value;
    }
    setFormData({ ...formData, keyActivities: newActs });
  };

  const addActivity = () => {
    const lastItemType = formData.keyActivities[formData.keyActivities.length - 1]?.isTraining;
    setFormData({
      ...formData,
      keyActivities: [...formData.keyActivities, { 
        activityName: '', totalQuantity: 1, unit: '', remarks: '',
        isTraining: lastItemType || false, isNew: true,
        trainingDetails: { date: '', type: '' },
        specifications: ['']
      }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasErrors = Object.values(fieldErrors).some(err => err !== "");
    if (hasErrors) {
      alert("Please correct the validation errors in the form before proceeding.");
      return;
    }

    const token = localStorage.getItem("token");

    const backendInterventions = formData.keyActivities.map(act => {
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
          ? act.specifications.filter(s => s !== "" && s !== null).map(Number)
          : []
      };
    });

    // Mirroring array batch structure to coordinate cleanly with backend router
    const payload = {
      projectId: formData.projectId,
      year: parseInt(formData.year),
      dzongkhag: formData.dzongkhag,
      gewog: formData.gewog,
      village: formData.village,
      keyActivities: backendInterventions,
      beneficiaries: [{
        name: formData.name,
        cid: formData.cid,
        gender: formData.gender,
        houseNo:
        formData.houseNo?.trim() === ''
          ? null
          : formData.houseNo,

      thramNo:
        formData.thramNo?.trim() === ''
          ? null
          : Number(formData.thramNo), 
        indirectBeneficiaries: {
          male: formData.indirectBeneficiaries.male === '' ? 0 : parseInt(formData.indirectBeneficiaries.male),
          female: formData.indirectBeneficiaries.female === '' ? 0 : parseInt(formData.indirectBeneficiaries.female)
        }
      }]
    };

    try {
      await axios.put(
        `http://localhost:5000/api/beneficiaries/${beneficiary._id}`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-5xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header section matches design system header spacing exactly */}
            <div className="p-6 sm:p-8 pb-4 flex items-center justify-between border-b border-gray-100 bg-white z-10">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-800">Update Beneficiary Profile</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  Project Context: {selectedProject?.projectName || beneficiary?.projectName || "N/A"}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* Regional Configuration Container Block */}
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">1. Regional Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Reporting Year *</label>
                    <input required type="number" className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white ${fieldErrors.year ? 'border-red-400 bg-red-50/30' : ''}`} 
                      value={formData.year} onChange={e => handleInputChange('year', e.target.value)} />
                    {fieldErrors.year && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.year}</p>}
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-gray-700">Dzongkhag *</label>
                    <select required className={`w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white capitalize ${getTextColor(formData.dzongkhag)}`} 
                      value={formData.dzongkhag} onChange={e => handleInputChange('dzongkhag', e.target.value)}>
                      <option value="">Select Dzongkhag</option>
                      {availableDzongkhags.map((d, i) => (<option key={i} value={d.toLowerCase()}>{d}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-gray-700">Gender *</label>
                    <select required className={`w-full p-2.5 border text-sm rounded-lg outline-none appearance-none bg-white ${getTextColor(formData.gender)}`} 
                      value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Others">Others</option>

                    </select>
                    <ChevronDown className="absolute right-3 top-[32px] text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              {/* Profile Fields Identity Details Block */}
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">2. Profile Identity Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Full Name *</label>
                    <input required className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white ${fieldErrors.name ? 'border-red-400 bg-red-50/30' : ''}`} value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                    {fieldErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.name}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">CID Number *</label>
                    <input required maxLength={11} className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white ${fieldErrors.cid ? 'border-red-400 bg-red-50/30' : ''}`} value={formData.cid} onChange={e => handleInputChange('cid', e.target.value.replace(/[^0-9]/g, ''))} />
                    {fieldErrors.cid && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.cid}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Gewog *</label>
                    <input required className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white ${fieldErrors.gewog ? 'border-red-400 bg-red-50/30' : ''}`} value={formData.gewog} onChange={e => handleInputChange('gewog', e.target.value)} />
                    {fieldErrors.gewog && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.gewog}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Village *</label>
                    <input required className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white ${fieldErrors.village ? 'border-red-400 bg-red-50/30' : ''}`} value={formData.village} onChange={e => handleInputChange('village', e.target.value)} />
                    {fieldErrors.village && <p className="text-[10px] text-red-500 mt-0.5">{fieldErrors.village}</p>}
                  </div>
                  <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    House No
                  </label>

                  <input
                    className="w-full p-2.5 text-sm border rounded-lg outline-none bg-white text-black"
                    value={formData.houseNo}
                    onChange={e => handleInputChange('houseNo', e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    Thram No
                  </label>

                  <input
                    className={`w-full p-2.5 text-sm border rounded-lg outline-none bg-white text-black ${
                      fieldErrors.thramNo
                        ? 'border-red-400 bg-red-50/30'
                        : ''
                    }`}
                    value={formData.thramNo}
                    onChange={e =>
                      handleInputChange('thramNo', e.target.value)
                    }
                  />

                  {fieldErrors.thramNo && (
                    <p className="text-[10px] text-red-500 mt-0.5">
                      {fieldErrors.thramNo}
                    </p>
                  )}
                </div>

                </div>
              </div>

              {/* Indirect Beneficiaries Split View Block */}
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-600">3. Indirect Household Splits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Indirect Male</label>
                    <input type="number" min="0" placeholder="0" className="w-full p-2.5 text-sm border rounded-lg outline-none bg-white text-black" 
                      value={formData.indirectBeneficiaries.male === 0 ? '' : formData.indirectBeneficiaries.male} 
                      onChange={e => setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, male: Math.max(0, parseInt(e.target.value) || 0)}})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Indirect Female</label>
                    <input type="number" min="0" placeholder="0" className="w-full p-2.5 text-sm border rounded-lg outline-none bg-white text-black" 
                      value={formData.indirectBeneficiaries.female === 0 ? '' : formData.indirectBeneficiaries.female} 
                      onChange={e => setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, female: Math.max(0, parseInt(e.target.value) || 0)}})} />
                  </div>
                </div>
              </div>

              {/* Intervention Dynamic Rows Block */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Intervention</h3>
                  <button type="button" onClick={addActivity} className="text-blue-500 text-xs font-bold flex items-center gap-1 hover:bg-blue-50 p-1.5 px-3 border border-blue-200 rounded-lg transition-all">
                    <Plus size={14}/> {formData.keyActivities[formData.keyActivities.length - 1]?.isTraining ? "Add New Training" : "Add New Activity"}
                  </button>
                </div>
                {formData.keyActivities.map((act, idx) => (
                  <div key={idx} className="p-5 border border-dashed border-gray-200 rounded-2xl relative bg-gray-50/30 space-y-4">
                    {formData.keyActivities.length > 1 && (
                      <button type="button" onClick={() => setFormData({...formData, keyActivities: formData.keyActivities.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                    )}
                    
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`update-type-${idx}`} checked={!act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', false)} className="accent-blue-500" />
                        <span className="text-xs font-bold uppercase text-gray-900">Key Activity</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`update-type-${idx}`} checked={act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', true)} className="accent-blue-500" />
                        <span className="text-xs font-bold uppercase text-gray-900">Training</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">{act.isTraining ? 'Training Name' : 'Activity Name'}</label>
                      <input required placeholder={act.isTraining ? "Enter training name..." : "Enter activity name..."} className={`w-full p-2 border-b bg-transparent outline-none focus:border-blue-500 transition-all ${getTextColor(act.activityName)}`} value={act.activityName} onChange={e => handleActivityChange(idx, 'activityName', e.target.value)} />
                    </div>

                    {act.isTraining ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <div className="space-y-1">

                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Start Date
                        </label>

                        <input
                          required
                          type="date"
                          className={`w-full p-2 border rounded-lg outline-none ${
                            getTextColor(act.trainingDetails?.startDate)
                          }`}
                          value={
                            act.trainingDetails?.startDate
                              ? formatDate(act.trainingDetails.startDate)
                              : ""
                          }
                          onChange={e =>
                            handleActivityChange(
                              idx,
                              'trainingDetails.startDate',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="space-y-1">

                        <label className="text-xs font-bold text-gray-500 uppercase">
                          End Date
                        </label>

                        <input
                          required
                          type="date"
                          className={`w-full p-2 border rounded-lg outline-none ${
                            getTextColor(act.trainingDetails?.endDate)
                          }`}
                          value={
                            act.trainingDetails?.endDate
                              ? formatDate(act.trainingDetails.endDate)
                              : ""
                          }
                          onChange={e =>
                            handleActivityChange(
                              idx,
                              'trainingDetails.endDate',
                              e.target.value
                            )
                          }
                        />

                      </div>

                      <div className="space-y-1">

                        <label className="text-xs font-bold text-gray-500 uppercase">
                          Training Type
                        </label>

                        <input
                          required
                          placeholder="e.g. Technical, Financial"
                          className={`w-full p-2 border rounded-lg outline-none ${
                            getTextColor(act.trainingDetails?.type)
                          }`}
                          value={act.trainingDetails?.type || ""}
                          onChange={e =>
                            handleActivityChange(
                              idx,
                              'trainingDetails.type',
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1 relative">
                            <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                            <select required className={`w-full p-2 border rounded-lg outline-none appearance-none bg-white ${getTextColor(act.unit)}`} 
                              value={act.unit} onChange={e => handleActivityChange(idx, 'unit', e.target.value)}>
                              <option value="" disabled={!!act.unit}>Select Unit</option>
                              <option value="Nos" className="text-black">Nos</option>
                              <option value="Litres" className="text-black">Litres</option>
                              <option value="Acres" className="text-black">Acres</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-[35px] text-gray-400 pointer-events-none" size={14} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                            <input required type="number" min="0" className="w-full p-2 border rounded-lg outline-none text-black" 
                              value={act.totalQuantity === 0 ? '' : act.totalQuantity} 
                              onChange={e => handleActivityChange(idx, 'totalQuantity', e.target.value)} />
                          </div>
                        </div>
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
                              {act.specifications?.map((spec, sIdx) => (
                                <input 
                                  key={sIdx} 
                                  type="text"
                                  placeholder={act.unit === "Litres" ? "Enter capacity" : "Enter acres"} 
                                  className="p-2 border rounded-lg text-sm text-black outline-none focus:border-blue-400"
                                  value={spec} 
                                  onChange={e => handleActivityChange(idx, 'specifications', { sIdx, val: e.target.value })} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Sheet Modals Control Row */}
              <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-6">
                <button type="button" onClick={onClose} className="px-5 py-2.5 border rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm">Cancel</button>
                <button type="submit" className="bg-[#2EA1F2] text-white px-6 py-2.5 shadow-md font-bold text-sm rounded-xl flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors">
                  <Save size={16}/> Update Profile
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateBeneficiaryModal;