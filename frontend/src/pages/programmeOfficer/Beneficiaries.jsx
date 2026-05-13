import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Users2, Pencil, Trash2, 
  Loader2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';

// Modal Imports
import UpdateBeneficiaryModal from '../../components/modals/UpdateBeneficiaryModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import SuccessModal from '../../components/modals/SuccessModal';

const Beneficiaries = () => {
  const navigate = useNavigate();

  // 🔐 SESSION & AUTH
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const PO_ID = storedUser?.id || storedUser?._id;

  // Data States
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔢 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Fixed to 7 items as requested

  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

    const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

  // 🛡️ AUTH GUARD
  useEffect(() => {
    if (!token || !storedUser) {
      navigate("/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  // 📡 FETCH DATA
  const fetchBeneficiaries = async () => {
    if (!PO_ID || !token) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // 1. Get PO Projects
      const projectRes = await axios.get(
        `http://localhost:5000/api/projects/programme-officer/${PO_ID}`, 
        config
      );
      const projects = projectRes.data.data || [];

      if (projects.length === 0) {
        setBeneficiaries([]);
        return;
      }

      const projectNameMap = {};
      projects.forEach(proj => { projectNameMap[proj._id] = proj.projectName; });

      // 2. Get Beneficiaries for these projects
      const beneficiaryPromises = projects.map(project => 
        axios.get(`http://localhost:5000/api/beneficiaries/bene/${project._id}`, config)
      );

      const results = await Promise.all(beneficiaryPromises);
      const allBeneficiaries = results.flatMap((res, index) => {
        const projectData = res.data.data || [];
        return projectData.map(b => ({
          ...b,
          projectName: projectNameMap[projects[index]._id] || "Unknown Project"
        }));
      });
      
      setBeneficiaries(allBeneficiaries);
      console.log(allBeneficiaries)
    } catch (err) {
      setErrorMessage(
  err.response?.data?.message ||
  "Failed to load beneficiaries"
);

setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);

      console.error("Fetch error:", err);
      if (err.response?.status === 401) navigate("auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBeneficiaries(); }, [PO_ID, token]);

  // 🗑️ DELETE LOGIC
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/beneficiaries/${selectedBeneficiary._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      setSuccessMessage('Beneficiary Deleted Successfully');
      setIsSuccessModalOpen(true);
      fetchBeneficiaries();

       // auto close success popup
    setTimeout(() => {
      setIsSuccessModalOpen(false);
    }, 2000);
    
    } catch (err) {

  setErrorMessage(
    err.response?.data?.message ||
    "Failed to delete beneficiary"
  );

  setShowErrorPopup(true);

  setTimeout(() => {
    setShowErrorPopup(false);
  }, 2000);
}
  };

  // 🔍 FILTER & PAGINATION CALCULATION
  const filteredData = beneficiaries.filter(b => {
    const search = searchTerm.toLowerCase();
    return (
      b.name?.toLowerCase().includes(search) ||
      b.cid?.toString().includes(search) ||
      b.dzongkhag?.toLowerCase().includes(search) ||
      b.projectName?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 on search
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  if (!token || !storedUser) return null;

  return (
    <>
 <div className="space-y-4 w-full overflow-hidden">
      {/* Search and Action Bar */}
   <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, CID, or project..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#3498db] text-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => navigate('/po/beneficiaries/register')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3498db] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all hover:bg-[#2980b9] active:scale-95"
        >
          <Plus size={20} /> <span>New Beneficiary</span>
        </button>
      </div>

      {/* Table Container */}
      {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"> */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-full">
   <div className="w-full overflow-x-auto rounded-b-2xl">
<table className="min-w-[1400px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">CID</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Dzongkhag</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Project</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">House No</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Thram No</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Village</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Gewog</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Year</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Indirect Beneficiary</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Intervention</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Nos</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Acres</th>
                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Capacity</th>

                <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="16" className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#3498db]" size={32} />
                    <p className="mt-2 text-sm text-gray-400">Loading beneficiaries...</p>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="16" className="p-20 text-center text-gray-500">
                    <Users2 className="mx-auto text-gray-200 mb-2" size={48} />
                    <p>No beneficiaries found.</p>
                  </td>
                </tr>
              ) : (
                currentItems.map((b) => (
                  <motion.tr
                    key={b._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{b.cid}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{b.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.dzongkhag}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-[#3498db] font-semibold uppercase tracking-tight">
                        {b.projectName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.houseNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.thramNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.village}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.gewog}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.year}</td>

                    {/* 👥 Indirect Beneficiary [Total (M:X, F:Y)] */}
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {Number(b.indirectBeneficiaries?.male || 0) + Number(b.indirectBeneficiaries?.female || 0)} 
                      <span className="text-xs text-gray-400 ml-1">
                        [M:{b.indirectBeneficiaries?.male || 0}, F:{b.indirectBeneficiaries?.female || 0}]
                      </span>
                    </td>

                    {/* 🛠️ Intervention (Activity Name or Training) */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {b.keyActivities?.map((act, i) => (
                        <div key={i} className={act.isTraining ? "text-orange-600 font-medium" : ""}>
                          {act.isTraining ? `${act.activityName}` : act.activityName}
                        </div>
                      ))}
                    </td>

                    {/* 🔢 Nos Column (Training always 1, or if unit is Nos) */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.keyActivities?.map((act, i) => (
                        <div key={i}>
                          {act.isTraining ? "1" : (act.unit?.toLowerCase() === 'nos' ? act.specifications?.join(", ") || act.totalQuantity : "-")}
                        </div>
                      ))}
                    </td>

                    {/* 🌿 Acres Column */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.keyActivities?.map((act, i) => (
                        <div key={i}>
                          {!act.isTraining && act.unit?.toLowerCase() === 'acres' ? act.specifications?.join(", ") : "-"}
                        </div>
                      ))}
                    </td>

                    {/* 💧 Litres Column */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.keyActivities?.map((act, i) => (
                        <div key={i}>
                          {!act.isTraining && act.unit?.toLowerCase() === 'litres' ? act.specifications?.join(", ") : "-"}
                        </div>
                      ))}
                    </td>

                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setSelectedBeneficiary(b); setIsUpdateModalOpen(true); }}
                          className="p-2 bg-blue-50 text-[#3498db] hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedBeneficiary(b); setIsDeleteModalOpen(true); }}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>         
          </table>
        </div>

        {/* 🔢 PAGINATION FOOTER */}
        {!loading && filteredData.length > 0 && (
         <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Page <span className="text-[#3498db] font-bold">{currentPage}</span> / {totalPages || 1}
            </div>
            
            {/* <div className="flex items-center gap-2"> */}
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border border-gray-200 transition-all ${
                  currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Desktop Page Numbers */}
              <div className="hidden sm:flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-[#3498db] text-white shadow-md shadow-blue-200 scale-105' 
                        : 'text-gray-500 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-2 rounded-lg border border-gray-200 transition-all ${
                  currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modals */}
      {/* <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Beneficiary?"
        description="Are you sure? This will permanently remove the record."
      /> */}

   {/* DELETE MODAL */}
    {isDeleteModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow">
      <h2 className="text-lg font-semibold mb-2">
        Delete Beneficiary?
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete this beneficiary?
        This action is permanent and cannot be undone.
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-[#AA3333] text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}



      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />

      {selectedBeneficiary && (
        <UpdateBeneficiaryModal
          isOpen={isUpdateModalOpen}
          onClose={() => { setIsUpdateModalOpen(false); setSelectedBeneficiary(null); }}
          beneficiary={selectedBeneficiary}
          onUpdate={() => { 
            fetchBeneficiaries(); 
            setSuccessMessage('Beneficiary updated successfully'); 
            setIsSuccessModalOpen(true); 
          }}
        />
      )}

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

export default Beneficiaries;