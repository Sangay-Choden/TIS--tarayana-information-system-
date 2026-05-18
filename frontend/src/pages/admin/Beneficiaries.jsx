// import { useEffect, useState, useMemo } from "react";
// import { useNavigate } from 'react-router-dom';
// import { Search, User, Loader2, ChevronLeft, ChevronRight} from "lucide-react";
// import { motion } from 'motion/react';
// import axios from 'axios';

// const Beneficiaries = () => {
//     const navigate = useNavigate();
//   const [collapsed, setCollapsed] = useState(false);
  
//   const [search, setSearch] = useState("");
//     // 🔐 SESSION & AUTH
//   const token = localStorage.getItem("token");
//   const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;


//   // Data States
//   const [beneficiaries, setBeneficiaries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   // 🔢 PAGINATION STATE
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10; // Fixed to 10 items as requested

//   // Modal States
//   const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');
//   const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

//     const [showErrorPopup, setShowErrorPopup] = useState(false);
// const [errorMessage, setErrorMessage] = useState("");

//   // 🛡️ AUTH GUARD
//   useEffect(() => {
//     if (!token || !storedUser) {
//       navigate("auth/login", { replace: true });
//     }
//   }, [token, storedUser, navigate]);

//   // 📡 FETCH DATA
// const fetchBeneficiaries = async () => {
//   if (!token) return;

//   setLoading(true);

//   try {
//     const config = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };

//     // ✅ Fetch ALL beneficiaries
//     const response = await axios.get(
//       "http://localhost:5000/api/beneficiaries",
//       config
//     );

//     const allBeneficiaries = response.data.data || [];

//     setBeneficiaries(allBeneficiaries);

//     console.log(allBeneficiaries);

//   } catch (err) {

//     setErrorMessage(
//       err.response?.data?.message ||
//       "Failed to load beneficiaries"
//     );

//     setShowErrorPopup(true);

//     setTimeout(() => {
//       setShowErrorPopup(false);
//     }, 2000);

//     console.error("Fetch error:", err);

//     if (err.response?.status === 401) {
//       navigate("auth/login");
//     }

//   } finally {
//     setLoading(false);
//   }
// };
// useEffect(() => {
//   fetchBeneficiaries();
// }, [token]);

//   // 🗑️ DELETE LOGIC
//   const handleDelete = async () => {
//     try {
//       await axios.delete(`http://localhost:5000/api/beneficiaries/${selectedBeneficiary._id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setIsDeleteModalOpen(false);
//       setSuccessMessage('Beneficiary Deleted Successfully');
//       setIsSuccessModalOpen(true);
//       fetchBeneficiaries();

//        // auto close success popup
//     setTimeout(() => {
//       setIsSuccessModalOpen(false);
//     }, 2000);
    
//     } catch (err) {

//   setErrorMessage(
//     err.response?.data?.message ||
//     "Failed to delete beneficiary"
//   );

//   setShowErrorPopup(true);

//   setTimeout(() => {
//     setShowErrorPopup(false);
//   }, 2000);
// }
//   };

//   // 🔍 FILTER & PAGINATION CALCULATION
//   const filteredData = beneficiaries.filter(b => {
//     const search = searchTerm.toLowerCase();
//     return (
//       b.name?.toLowerCase().includes(search) ||
//       b.cid?.toString().includes(search) ||
//       b.dzongkhag?.toLowerCase().includes(search) ||
//       b.projectName?.toLowerCase().includes(search)
//     );
//   });

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   // Reset to page 1 on search
//   useEffect(() => { setCurrentPage(1); }, [searchTerm]);

//   if (!token || !storedUser) return null;

//   return (
// <div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

//       {/* Main */}
// <div className="w-full ">
//   <div className="space-y-6">

   

//         {/* SEARCH */}
//         <div className="mt-4 mb-6">
//           <div className="relative w-full max-w-md">
//             <Search
//               size={16}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//             />
//             <input
//               type="text"
//               placeholder="Search by CID"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

 

// <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-full">
//    <div className="w-full overflow-x-auto rounded-b-2xl">
// <table className="min-w-[1400px] w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100">
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">CID</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Dzongkhag</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Project</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Gender</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">House No</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Thram No</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Village</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Gewog</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Year</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Indirect Beneficiary</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Intervention</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Nos</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Acres</th>
//                 <th className="px-4 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Capacity</th>

//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-50">
//               {loading ? (
//                 <tr>
//                   <td colSpan="16" className="p-20 text-center">
//                     <Loader2 className="animate-spin mx-auto text-[#3498db]" size={32} />
//                     <p className="mt-2 text-sm text-gray-400">Loading beneficiaries...</p>
//                   </td>
//                 </tr>
//               ) : currentItems.length === 0 ? (
//                 <tr>
//                   <td colSpan="16" className="p-20 text-center text-gray-500">
//                     <Users2 className="mx-auto text-gray-200 mb-2" size={48} />
//                     <p>No beneficiaries found.</p>
//                   </td>
//                 </tr>
//               ) : (
//                 currentItems.map((b) => (
//                   <motion.tr
//                     key={b._id}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="hover:bg-blue-50/30 transition-colors"
//                   >
//                     <td className="px-6 py-4 text-sm text-gray-600 font-medium">{b.cid}</td>
//                     <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{b.name}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.dzongkhag}</td>
//                     <td className="px-6 py-4 text-sm">
//                       <span className="text-[#3498db] font-semibold uppercase tracking-tight">
//                         {b.projectName}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.gender}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.houseNo}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.thramNo}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.village}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.gewog}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{b.year}</td>

//                     {/* 👥 Indirect Beneficiary [Total (M:X, F:Y)] */}
//                     <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
//                       {Number(b.indirectBeneficiaries?.male || 0) + Number(b.indirectBeneficiaries?.female || 0)} 
//                       <span className="text-xs text-gray-400 ml-1">
//                         [M:{b.indirectBeneficiaries?.male || 0}, F:{b.indirectBeneficiaries?.female || 0}]
//                       </span>
//                     </td>

//                     {/* 🛠️ Intervention (Activity Name or Training) */}
//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {b.keyActivities?.map((act, i) => (
//                         <div key={i} className={act.isTraining ? "text-orange-600 font-medium" : ""}>
//                           {act.isTraining ? `${act.activityName}` : act.activityName}
//                         </div>
//                       ))}
//                     </td>

//                     {/* 🔢 Nos Column (Training always 1, or if unit is Nos) */}
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {b.keyActivities?.map((act, i) => (
//                         <div key={i}>
//                           {act.isTraining ? "1" : (act.unit?.toLowerCase() === 'nos' ? act.specifications?.join(", ") || act.totalQuantity : "-")}
//                         </div>
//                       ))}
//                     </td>

//                     {/* 🌿 Acres Column */}
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {b.keyActivities?.map((act, i) => (
//                         <div key={i}>
//                           {!act.isTraining && act.unit?.toLowerCase() === 'acres' ? act.specifications?.join(", ") : "-"}
//                         </div>
//                       ))}
//                     </td>

//                     {/* 💧 Litres Column */}
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {b.keyActivities?.map((act, i) => (
//                         <div key={i}>
//                           {!act.isTraining && act.unit?.toLowerCase() === 'litres' ? act.specifications?.join(", ") : "-"}
//                         </div>
//                       ))}
//                     </td>

//                              </motion.tr>
//                 ))
//               )}
//             </tbody>         
//           </table>
//         </div>

//         {/* 🔢 PAGINATION FOOTER */}
//         {!loading && filteredData.length > 0 && (
//          <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
//             <div className="text-sm text-gray-500 font-medium">
//               Page <span className="text-[#3498db] font-bold">{currentPage}</span> / {totalPages || 1}
//             </div>
            
//             {/* <div className="flex items-center gap-2"> */}
//             <div className="flex items-center justify-center gap-1 sm:gap-2">
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className={`p-2 rounded-lg border border-gray-200 transition-all ${
//                   currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600'
//                 }`}
//               >
//                 <ChevronLeft size={18} />
//               </button>
              
//               {/* Desktop Page Numbers */}
//               <div className="hidden sm:flex gap-1">
//                 {[...Array(totalPages)].map((_, i) => (
//                   <button
//                     key={i + 1}
//                     onClick={() => setCurrentPage(i + 1)}
//                     className={`w-9 h-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
//                       currentPage === i + 1 
//                         ? 'bg-[#3498db] text-white shadow-md shadow-blue-200 scale-105' 
//                         : 'text-gray-500 hover:bg-gray-50 border border-transparent'
//                     }`}
//                   >
//                     {i + 1}
//                   </button>
//                 ))}
//               </div>

//               <button
//                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                 disabled={currentPage === totalPages || totalPages === 0}
//                 className={`p-2 rounded-lg border border-gray-200 transition-all ${
//                   currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600'
//                 }`}
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//       </div>
//     </div>
//   </div>
// );
// };

// export default Beneficiaries;



import { useEffect, useState, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { motion } from 'motion/react';
import axios from 'axios';

const Beneficiaries = () => {
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
  const [selectedIntervention, setSelectedIntervention] = useState("All");

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
        "http://localhost:5000/api/beneficiaries",
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
      await axios.delete(`http://localhost:5000/api/beneficiaries/${selectedBeneficiary._id}`, {
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

  {/* INTERVENTION FILTER DROPDOWN */}
  <div className="relative w-full sm:w-72">
    <select
      value={selectedIntervention}
      onChange={(e) => setSelectedIntervention(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#3498db] text-sm transition-all appearance-none cursor-pointer text-gray-700 font-medium"
    >
      <option value="All">All Interventions</option>
      {uniqueInterventions.map((intervention, index) => (
        <option key={index} value={intervention}>
          {intervention}
        </option>
      ))}
    </select>
    <Filter 
      size={16} 
      className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
    />
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