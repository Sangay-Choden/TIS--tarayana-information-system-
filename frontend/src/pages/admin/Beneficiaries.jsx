
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

const Beneficiaries = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  // 🔐 SESSION & AUTH
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  // Data States
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔍 INTERVENTION FILTER STATE
  // const [selectedIntervention, setSelectedIntervention] = useState("All");
// 🔍 INTERVENTION FILTER DROPDOWN STATE
  const [selectedIntervention, setSelectedIntervention] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // 🔢 PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

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
      navigate("auth/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  // 📡 FETCH DATA
  const fetchBeneficiaries = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `${API_URL}/api/beneficiaries`,
        config
      );

      const allBeneficiaries = response.data.data || [];
      setBeneficiaries(allBeneficiaries);

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

      if (err.response?.status === 401) {
        navigate("auth/login");
      }

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchBeneficiaries();
  }, [token]);
    console.log(beneficiaries)

  // 🗑️ DELETE LOGIC
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/beneficiaries/${selectedBeneficiary._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteModalOpen(false);
      setSuccessMessage('Beneficiary Deleted Successfully');
      setIsSuccessModalOpen(true);
      fetchBeneficiaries();

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

  // 🧪 DYNAMICALLY EXTRACT UNIQUE INTERVENTIONS
  const uniqueInterventions = useMemo(() => {
    const interventionsSet = new Set();
    beneficiaries.forEach((b) => {
      b.keyActivities?.forEach((act) => {
        if (act.activityName) {
          interventionsSet.add(act.activityName.trim());
        }
      });
    });
    return Array.from(interventionsSet).sort();
  }, [beneficiaries]);

  // 🔍 FILTER & PAGINATION CALCULATION
  const filteredData = useMemo(() => {
    return beneficiaries.filter((b) => {
      const search = searchTerm.toLowerCase();

      // 1. Check textual search term
      const matchesSearch = 
        String(b.name || "").toLowerCase().includes(search) ||
        String(b.cid || "").toLowerCase().includes(search) ||
        String(b.dzongkhag || "").toLowerCase().includes(search) ||
      String(b.projectId?.projectName || "")
      .toLowerCase()
      .includes(search)
  

      // 2. Check selected Intervention category dropdown
      const matchesIntervention = 
        selectedIntervention === "All" ||
        (b.keyActivities && b.keyActivities.some(act => act.activityName?.trim() === selectedIntervention));

      return matchesSearch && matchesIntervention;
    });
  }, [beneficiaries, searchTerm, selectedIntervention]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 on filter or search parameters switching
useEffect(() => { 
    setCurrentPage(1); 
  }, [searchTerm, selectedIntervention]);

  if (!token || !storedUser) return null;

  return (
    <div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">
      {/* Main */}
      <div className="w-full ">
        <div className="space-y-6">

         {/* CONTROLS: SEARCH & UNIQUE INTERVENTION FILTER */}
{/* <div className="mt-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
  <div className="relative w-full max-w-md">
    <Search
      size={16}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
    />
    <input
      type="text"
      placeholder="Search by Name, CID, Dzongkhag, or Project"
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#3498db] text-sm transition-all"
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
<div className="relative w-48 sm:w-52">
  <select
    value={selectedIntervention}
    onChange={(e) => setSelectedIntervention(e.target.value)}
    className="w-full pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#3498db] text-sm transition-all appearance-none cursor-pointer text-gray-700 font-medium shadow-sm"
  >
    <option value="All">All Interventions</option>
    {uniqueInterventions.map((intervention, index) => (
      <option key={index} value={intervention}>
        {intervention}
      </option>
    ))}
  </select>
  <Filter 
    size={14} 
    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
  />
</div>
</div> */}
{/* CONTROLS: SEARCH & UNIQUE INTERVENTION FILTER */}
          <div className="mt-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* SEARCH BOX */}
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by Name, CID, Dzongkhag, or Project"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#3498db] text-sm transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* UPGRADED INTERVENTION FILTER DROPDOWN */}
            <div className="relative w-full sm:w-52">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between pl-4 pr-3.5 py-2.5 bg-white border rounded-xl focus:outline-none text-sm font-medium transition-all cursor-pointer shadow-sm text-gray-700
                  ${isDropdownOpen ? 'border-[#3498db] ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <span className="truncate">
                  {selectedIntervention === "All" ? "All Interventions" : selectedIntervention}
                </span>
                <Filter 
                  size={14} 
                  className={`ml-2 shrink-0 transition-colors ${isDropdownOpen ? 'text-[#3498db]' : 'text-gray-400'}`} 
                />
              </button>

              {/* Dropdown Options Context Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    {/* Background overlay click catcher */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50 max-h-64 overflow-y-auto"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedIntervention("All");
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors font-medium truncate
                          ${selectedIntervention === "All" 
                            ? "bg-blue-50 text-[#3498db] font-semibold" 
                            : "text-gray-600 hover:bg-gray-50"}`}
                      >
                        All Interventions
                      </button>
                      
                      {uniqueInterventions.map((intervention, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSelectedIntervention(intervention);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors font-medium truncate
                            ${selectedIntervention === intervention 
                              ? "bg-blue-50 text-[#3498db] font-semibold" 
                              : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          {intervention}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* TABLE CONTAINER */}
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
                        <p className="font-medium text-base">No beneficiaries found matching current criteria.</p>
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
                          {b.projectId?.projectName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.gender}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.houseNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.thramNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.village}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.gewog}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{b.year}</td>

                        {/* 👥 Indirect Beneficiary */}
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {Number(b.indirectBeneficiaries?.male || 0) + Number(b.indirectBeneficiaries?.female || 0)} 
                          <span className="text-xs text-gray-400 ml-1">
                            [M:{b.indirectBeneficiaries?.male || 0}, F:{b.indirectBeneficiaries?.female || 0}]
                          </span>
                        </td>

                        {/* 🛠️ Intervention */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {b.keyActivities?.map((act, i) => (
                            <div key={i} className={act.isTraining ? "text-orange-600 font-medium" : ""}>
                              {act.activityName}
                            </div>
                          ))}
                        </td>

                        {/* 🔢 Nos Column */}
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
      </div>
    </div>
  );
};

export default Beneficiaries;