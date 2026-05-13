import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const UpdateBeneficiaryModal = ({ isOpen, onClose, onUpdate, beneficiary }) => {
  const [projects, setProjects] = useState([]);
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
      specifications: [] // Added to track individual specs
    }]
  });

useEffect(() => {
    const fetchProjects = async () => {
      // 🔐 Get the real token
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/api/projects', {
          headers: {
            Authorization: `Bearer ${token}` // ✅ Add this
          }
        });
        setProjects(res.data.data || []);
      } catch (err) { 
        console.error("Fetch projects error:", err); 
      }
    };
    fetchProjects();
  }, []);


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
          // Sync specifications array with the specifications used in the UI
          const qty = act.totalQuantity || 0;
          const existingSpecs = act.specifications || [];
          const specifications = Array.from({ length: qty }, (_, i) => existingSpecs[i] || "");
          
          return { 
            ...act, 
            isTraining: act.isTraining || false,
            trainingDetails: {
              // FIX: Format the date here
              date: formatDate(act.trainingDetails?.date),
              type: act.trainingDetails?.type || ''
            },
            isNew: false,
            unit: act.unit || '',
            specifications: specifications,
            remarks: specifications.join(", ")
          };
        }) || []
      });
    }
  }, [beneficiary]);

  const getTextColor = (value) => value ? "text-black" : "text-gray-400";
  const selectedProject = projects.find(p => p._id === formData.projectId);
  const availableDzongkhags = selectedProject?.dzongkhag
    ? Array.isArray(selectedProject.dzongkhag) ? selectedProject.dzongkhag : [selectedProject.dzongkhag.toString()]
    : [];

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return isoString.split('T')[0]; // Takes "2026-04-25" from "2026-04-25T00:00:00.000Z"
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
      const clean = val.replace(/[^0-9]/g, ""); // Numbers only
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
    setFormData({
      ...formData,
      keyActivities: [...formData.keyActivities, { 
        activityName: '', totalQuantity: 1, unit: '', remarks: '',
        isTraining: false, isNew: true,
        trainingDetails: { date: '', type: '' },
        specifications: ['']
      }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");

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
              .filter(s => s !== "" && s !== null) // Remove empty inputs
              .map(s => Number(s))                // Convert "100" to 100
          : []
        };
      })
    };

    try {
      await axios.put(
        `http://localhost:5000/api/beneficiaries/${beneficiary._id}`, 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}` // ✅ Add this
          }
        }
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
            onClick={onClose} className="fixed inset-0 bg-black/40 "
             />
          
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
           className="
  relative
  bg-white
  w-full
  max-w-5xl
  h-[95vh] sm:h-auto
  max-h-[95vh]
  overflow-hidden
  rounded-xl
  p-4 sm:p-2
  shadow-xl
  flex flex-col
"
          >
            <div className="p-8 pb-0 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">Update Beneficiary</h3>
                <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">
                  Project: {selectedProject?.projectName || beneficiary?.projectName || "N/A"}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
            </div>

         <form
  onSubmit={handleSubmit}
  className="flex-1 overflow-y-auto p-8 space-y-6"
>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Reporting Year</label>
                  <input required type="number" className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.year)}`} 
                    value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-xs font-bold text-black uppercase">Dzongkhag</label>
                  <select required className={`w-full p-3 border rounded-xl outline-none appearance-none capitalize font-normal ${getTextColor(formData.dzongkhag)}`} 
                    value={formData.dzongkhag} onChange={e => setFormData({...formData, dzongkhag: e.target.value})}>
                    <option value="">Select Dzongkhag</option>
                    {availableDzongkhags.map((d, i) => (<option key={i} value={d.toLowerCase()}>{d}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-[34px] text-gray-400 pointer-events-none" size={18} />
                </div>

                <div className="space-y-1 relative">
                  <label className="text-xs font-bold text-black uppercase">Gender</label>
                  <select required className={`w-full p-3 border rounded-xl outline-none appearance-none font-normal ${getTextColor(formData.gender)}`} 
                    value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-[34px] text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Full Name</label>
                  <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.name)}`} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">CID</label>
                  <input required maxLength={11} className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.cid)}`} value={formData.cid} onChange={e => setFormData({...formData, cid: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Gewog</label>
                  <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.gewog)}`} value={formData.gewog} onChange={e => setFormData({...formData, gewog: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Village</label>
                  <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.village)}`} value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">House No</label>
                  <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.houseNo)}`} value={formData.houseNo} onChange={e => setFormData({...formData, houseNo: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Thram No</label>
                  <input required className={`w-full p-3 border rounded-xl outline-none font-normal ${getTextColor(formData.thramNo)}`} value={formData.thramNo} onChange={e => setFormData({...formData, thramNo: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Indirect Male</label>
                  <input type="number" min="0" placeholder="0" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(formData.indirectBeneficiaries.male)}`} 
                    value={formData.indirectBeneficiaries.male === 0 ? '' : formData.indirectBeneficiaries.male} 
                    onChange={e => setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, male: Math.max(0, parseInt(e.target.value) || 0)}})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black uppercase">Indirect Female</label>
                  <input type="number" min="0" placeholder="0" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(formData.indirectBeneficiaries.female)}`} 
                    value={formData.indirectBeneficiaries.female === 0 ? '' : formData.indirectBeneficiaries.female} 
                    onChange={e => setFormData({...formData, indirectBeneficiaries: {...formData.indirectBeneficiaries, female: Math.max(0, parseInt(e.target.value) || 0)}})} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Intervention</h3>
                  <button type="button" onClick={addActivity} className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 p-1 px-2 rounded-lg">
                    <Plus size={16}/> Add New Intervention
                  </button>
                </div>
                {formData.keyActivities.map((act, idx) => (
                  <div key={idx} className="p-4 border border-dashed border-gray-200 rounded-2xl relative bg-gray-50/30 space-y-3">
                    <button type="button" onClick={() => setFormData({...formData, keyActivities: formData.keyActivities.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-400"><Trash2 size={16}/></button>
                    
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase text-black cursor-pointer">
                        <input type="radio" checked={!act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', false)} className="accent-blue-500" /> Activity
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold uppercase text-black cursor-pointer">
                        <input type="radio" checked={act.isTraining} onChange={() => handleActivityChange(idx, 'isTraining', true)} className="accent-blue-500" /> Training
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-black uppercase">{act.isTraining ? 'Training Name' : 'Activity Name'}</label>
                      <input required className={`w-full p-2 border-b bg-transparent outline-none font-normal focus:border-blue-500 ${getTextColor(act.activityName)}`} value={act.activityName} onChange={e => handleActivityChange(idx, 'activityName', e.target.value)} />
                    </div>

                    {act.isTraining ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-black uppercase">Date</label>
                          <input required type="date" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(act.trainingDetails.date)}`} value={act.trainingDetails.date} onChange={e => handleActivityChange(idx, 'trainingDetails.date', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-black uppercase">Type</label>
                          <input required className={`w-full p-2 border rounded-lg font-normal ${getTextColor(act.trainingDetails.type)}`} value={act.trainingDetails.type} onChange={e => handleActivityChange(idx, 'trainingDetails.type', e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-black uppercase">Quantity</label>
                            <input required type="number" min="0" className={`w-full p-2 border rounded-lg font-normal ${getTextColor(act.totalQuantity)}`} 
                              value={act.totalQuantity === 0 ? '' : act.totalQuantity} 
                              onChange={e => handleActivityChange(idx, 'totalQuantity', e.target.value)} />
                          </div>
                          <div className="space-y-1 relative">
                            <label className="text-[10px] font-bold text-black uppercase">Unit</label>
                            <select required className={`w-full p-2 border rounded-lg font-normal appearance-none bg-white ${getTextColor(act.unit)}`} 
                              value={act.unit} onChange={e => handleActivityChange(idx, 'unit', e.target.value)}>
                              <option value="" disabled={!!act.unit}>Select Unit</option>
                              <option value="Nos" disabled={act.unit !== '' && act.unit !== 'Nos'} className="text-black">Nos</option>
                              <option value="Litres" disabled={act.unit !== '' && act.unit !== 'Litres'} className="text-black">Litres</option>
                              {/* <option value="Kg" disabled={act.unit !== '' && act.unit !== 'Kg'} className="text-black">Kg</option> */}
                              <option value="Acres" disabled={act.unit !== '' && act.unit !== 'Acres'} className="text-black">Acres</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-[24px] text-gray-400 pointer-events-none" size={14} />
                          </div>
                        </div>
                        {!act.isTraining && act.totalQuantity > 0 && (
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-black uppercase">Specifications (optional)</label>
                             <span className="block text-sm sm:text-base text-gray-400 italic leading-relaxed">
                              Please enter numeric values only. For capacity, use total liters (e.g., 500, 1000). 
                              For land area, use total acres (e.g., 2, 3.5, 10) based on legal deed measurements.
                            </span>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                               {act.specifications?.map((spec, sIdx) => (
                                 <input 
                                   key={sIdx} 
                                    
                                   placeholder="Enter amount" 
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

              <div className="flex justify-end gap-4 pt-6 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" 
                
              className="
  w-full
  sm:w-auto
  bg-[#2EA1F2]
  text-white
  px-5
  py-2.5
  shadow
  font-bold
  text-md
  rounded-lg
  flex
  justify-center
  items-center
  gap-2
  hover:bg-[#298CD2]
  transition-color
">
                  Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateBeneficiaryModal;