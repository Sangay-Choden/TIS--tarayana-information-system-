


// import { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { ChevronLeft, Filter, Layers, Mail, UserCircle2, Loader2 } from "lucide-react";

// const OfficerDetails = () => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [selectedYear, setSelectedYear] = useState("All");
//   const [recordsByYear, setRecordsByYear] = useState({});
//   const [loading, setLoading] = useState(true);
  
//   // NEW STATE: Dropdown panel trigger
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const { officerId } = useParams();
//   const navigate = useNavigate();
//   const { pathname, state } = useLocation();

//   const token = localStorage.getItem('token');
//   const rootPath = pathname.split("/")[1];
//   const archivesPath = `/${rootPath}/archives`;

//   const displayName = state?.officerName || "Officer Details";

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!token) {
//         navigate('auth/login');
//         return;
//       }

//       const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(officerId);
//       if (!isValidMongoId) {
//         console.error("Stopping fetch: ID is not a valid MongoID:", officerId);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);

//       const fetchOptions = {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       };

//       try {
//         const safeFetch = async (url) => {
//           const res = await fetch(url, fetchOptions);
//           if (res.status === 401) {
//             localStorage.clear();
//             navigate('/login');
//             return null;
//           }
//           if (!res.ok) return [];
//           const data = await res.json();
//           return Array.isArray(data?.data) ? data.data : [];
//         };

//         const [poProjects, foProjects] = await Promise.all([
//           safeFetch(`${API_URL}/api/projects/programme-officer/${officerId}`),
//           safeFetch(`${API_URL}/api/projects/field-officer/${officerId}`)
//         ]);

//         if (poProjects === null || foProjects === null) return;

//         const combined = [...poProjects, ...foProjects];
//         const uniqueProjects = Array.from(new Map(combined.map(p => [p._id, p])).values());

//         const grouped = uniqueProjects.reduce((acc, proj) => {
//           const formatDate = (dateStr) => {
//             if (!dateStr || dateStr === "N/A") return "N/A";
//             return dateStr.split('T')[0]; 
//           };

//           const year = proj?.endDate 
//             ? new Date(proj.endDate).getFullYear().toString() 
//             : "Active";

//           if (!acc[year]) acc[year] = [];

//           acc[year].push({
//             id: proj._id,
//             ID: proj._id.slice(-5).toUpperCase(),
//             PROJECTNAME: proj.projectName || "Untitled",
//             DZONGKHAG: Array.isArray(proj.dzongkhag) ? proj.dzongkhag[0] : (proj.dzongkhag || "N/A"),
//             STARTDATE: formatDate(proj.startDate),
//             ENDDATE: formatDate(proj.endDate),
//             STATUS: proj.status || "N/A",
//             YEAR: year
//           });

//           return acc;
//         }, {});

//         setRecordsByYear(grouped);
//       } catch (err) {
//         console.error("Fatal error:", err);
//       } finally {
//         loading && setLoading(false);
//       }
//     };

//     fetchData();
//   }, [officerId, token, navigate]);

//   const years = Object.keys(recordsByYear);
//   const currentRecords = selectedYear === "All" 
//     ? Object.values(recordsByYear).flat() 
//     : recordsByYear[selectedYear] || [];

//   if (loading) return (
//     <div className="flex justify-center items-center h-64 text-gray-400">
//       <Loader2 className="animate-spin mr-2" size={20} /> Loading projects...
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       <button onClick={() => navigate(archivesPath)} 
//         className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm hover:text-blue-500 transition"
//           >
//             <ChevronLeft size={14} />
//          <span>Back to Archives</span>
//       </button>

//       <section className="flex items-center gap-4 bg-white p-4 rounded-[22px] shadow-sm border border-gray-100">
//         <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><UserCircle2 size={24} /></div>
//         <div className="flex-1">
//           <h1 className="text-base font-bold text-gray-800 uppercase tracking-tight">{displayName}</h1>
//           <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-bold">
//             <span className="flex items-center gap-1"><Layers size={10} /> OFFICER RECORDS</span>
//             <span className="flex items-center gap-1 uppercase"><Mail size={10} /> ID: {officerId.slice(-6)}</span>
//           </div>
//         </div>
//       </section>

//       {/* REPLACED: NEW CLEAN CUSTOM YEAR DROPDOWN PANEL */}
//       <section className="flex justify-start">
//         <div className="relative">
//           <button
//             type="button"
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="flex items-center gap-10 pl-11 pr-5 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-2xl bg-white shadow-sm hover:bg-gray-50/80 transition-colors"
//           >
//             <span>{selectedYear === "All" ? "All Years" : selectedYear}</span>
//             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
//           </button>

//           {isDropdownOpen && (
//             <>
//               {/* Overlay background panel to close container instantly when clicking outside */}
//               <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
              
//               {/* Dropdown element menu */}
//               <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto scrollbar-hide transform origin-top-left transition-all">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedYear("All");
//                     setIsDropdownOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-2 text-xs transition-colors font-medium
//                     ${selectedYear === "All" 
//                       ? "bg-blue-50 text-blue-600 font-bold" 
//                       : "text-gray-600 hover:bg-gray-50"
//                     }
//                   `}
//                 >
//                   All Years
//                 </button>
//                 {years.sort((a, b) => b - a).map((y) => (
//                   <button
//                     key={y}
//                     type="button"
//                     onClick={() => {
//                       setSelectedYear(y);
//                       setIsDropdownOpen(false);
//                     }}
//                     className={`w-full text-left px-4 py-2 text-xs transition-colors font-medium
//                       ${selectedYear === y 
//                         ? "bg-blue-50 text-blue-600 font-bold" 
//                         : "text-gray-600 hover:bg-gray-50"
//                       }
//                     `}
//                   >
//                     {y}
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </section>

//      <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
//         <div className="w-full overflow-x-auto">
//           <table className="min-w-[900px] w-full text-left text-xs">
//             <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold">
//               <tr>
//                 <th className="px-6 py-5">Project Name</th>
//                 <th className="px-6 py-5">Dzongkhag</th>
//                 <th className="px-6 py-5">Start Date</th>
//                 <th className="px-6 py-5">End Date</th>
//                 <th className="px-6 py-5">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {currentRecords.map((record, i) => (
//                 <tr key={i} onClick={() => navigate(`/${rootPath}/archives/programme/view/project/${record.id}`)} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
//                   <td className="px-6 py-4 font-bold text-gray-800">{record.PROJECTNAME}</td>
//                   <td className="px-6 py-4 text-gray-500 font-medium">{record.DZONGKHAG}</td>
//                   <td className="px-6 py-4 text-gray-500 font-medium">{record.STARTDATE}</td>
//                   <td className="px-6 py-4 text-gray-500 font-medium">{record.ENDDATE}</td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`
//                         px-2 py-0.5 text-[10px] font-bold rounded-xl uppercase tracking-wider
//                         ${record.STATUS === "Completed"
//                             ? "bg-[#D7FFD3] text-green-500"
//                             : record.STATUS === "Ongoing"
//                             ? "bg-blue-50 text-blue-600"
//                             : "bg-gray-100 text-gray-500"
//                         }
//                       `}
//                     >
//                       {record.STATUS}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {currentRecords.length === 0 && (
//           <div className="p-16 text-center text-gray-400 text-xs font-medium">No projects found for this officer.</div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default OfficerDetails;



import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Filter, Layers, Mail, UserCircle2, Loader2 } from "lucide-react";

const OfficerDetails = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [selectedYear, setSelectedYear] = useState("All");
  const [recordsByYear, setRecordsByYear] = useState({});
  const [loading, setLoading] = useState(true);
  
  // NEW STATE: Dropdown panel trigger and pagination handling
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed

  const { officerId } = useParams();
  const navigate = useNavigate();
  const { pathname, state } = useLocation();

  const token = localStorage.getItem('token');
  const rootPath = pathname.split("/")[1];
  const archivesPath = `/${rootPath}/archives`;

  const displayName = state?.officerName || "Officer Details";

  // Reset pagination index whenever selected filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('auth/login');
        return;
      }

      const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(officerId);
      if (!isValidMongoId) {
        console.error("Stopping fetch: ID is not a valid MongoID:", officerId);
        setLoading(false);
        return;
      }

      setLoading(true);

      const fetchOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        const safeFetch = async (url) => {
          const res = await fetch(url, fetchOptions);
          if (res.status === 401) {
            localStorage.clear();
            navigate('/login');
            return null;
          }
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data?.data) ? data.data : [];
        };

        const [poProjects, foProjects] = await Promise.all([
          safeFetch(`${API_URL}/api/projects/programme-officer/${officerId}`),
          safeFetch(`${API_URL}/api/projects/field-officer/${officerId}`)
        ]);

        if (poProjects === null || foProjects === null) return;

        const combined = [...poProjects, ...foProjects];
        const uniqueProjects = Array.from(new Map(combined.map(p => [p._id, p])).values());

        const grouped = uniqueProjects.reduce((acc, proj) => {
          const formatDate = (dateStr) => {
            if (!dateStr || dateStr === "N/A") return "N/A";
            return dateStr.split('T')[0]; 
          };

          const year = proj?.endDate 
            ? new Date(proj.endDate).getFullYear().toString() 
            : "Active";

          if (!acc[year]) acc[year] = [];

          acc[year].push({
            id: proj._id,
            ID: proj._id.slice(-5).toUpperCase(),
            PROJECTNAME: proj.projectName || "Untitled",
            DZONGKHAG: Array.isArray(proj.dzongkhag) ? proj.dzongkhag[0] : (proj.dzongkhag || "N/A"),
            STARTDATE: formatDate(proj.startDate),
            ENDDATE: formatDate(proj.endDate),
            STATUS: proj.status || "N/A",
            YEAR: year
          });

          return acc;
        }, {});

        setRecordsByYear(grouped);
      } catch (err) {
        console.error("Fatal error:", err);
      } finally {
        loading && setLoading(false);
      }
    };

    fetchData();
  }, [officerId, token, navigate, API_URL]);

  const years = Object.keys(recordsByYear);
  const currentRecords = selectedYear === "All" 
    ? Object.values(recordsByYear).flat() 
    : recordsByYear[selectedYear] || [];

  // NEW: Slices matching datasets to create a clean paginated grid view matrix
  const paginatedRecords = useMemo(() => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return {
      data: currentRecords.slice(indexOfFirst, indexOfLast),
      total: currentRecords.length,
      indexOfFirst,
      indexOfLast
    };
  }, [currentRecords, currentPage]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-400">
      <Loader2 className="animate-spin mr-2" size={20} /> Loading projects...
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(archivesPath)} 
        className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm hover:text-blue-500 transition"
          >
            <ChevronLeft size={14} />
         <span>Back to Archives</span>
      </button>

      <section className="flex items-center gap-4 bg-white p-4 rounded-[22px] shadow-sm border border-gray-100">
        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><UserCircle2 size={24} /></div>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-800 uppercase tracking-tight">{displayName}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-bold">
            <span className="flex items-center gap-1"><Layers size={10} /> OFFICER RECORDS</span>
            <span className="flex items-center gap-1 uppercase"><Mail size={10} /> ID: {officerId.slice(-6)}</span>
          </div>
        </div>
      </section>

      {/* REPLACED: NEW CLEAN CUSTOM YEAR DROPDOWN PANEL */}
      <section className="flex justify-start">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-10 pl-11 pr-5 py-3 text-xs font-bold text-gray-600 border border-gray-200 rounded-2xl bg-white shadow-sm hover:bg-gray-50/80 transition-colors"
          >
            <span>{selectedYear === "All" ? "All Years" : selectedYear}</span>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay background panel to close container instantly when clicking outside */}
              <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
              
              {/* Dropdown element menu */}
              <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto scrollbar-hide transform origin-top-left transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear("All");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors font-medium
                    ${selectedYear === "All" 
                      ? "bg-blue-50 text-blue-600 font-bold" 
                      : "text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  All Years
                </button>
                {years.sort((a, b) => b - a).map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setSelectedYear(y);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors font-medium
                      ${selectedYear === y 
                        ? "bg-blue-50 text-blue-600 font-bold" 
                        : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

     <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-5">Project Name</th>
                <th className="px-6 py-5">Dzongkhag</th>
                <th className="px-6 py-5">Start Date</th>
                <th className="px-6 py-5">End Date</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedRecords.data.map((record, i) => (
                <tr key={i} onClick={() => navigate(`/${rootPath}/archives/programme/view/project/${record.id}`)} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-800">{record.PROJECTNAME}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{record.DZONGKHAG}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{record.STARTDATE}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{record.ENDDATE}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                        px-2 py-0.5 text-[10px] font-bold rounded-xl uppercase tracking-wider
                        ${record.STATUS === "Completed"
                            ? "bg-[#D7FFD3] text-green-500"
                            : record.STATUS === "Ongoing"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      {record.STATUS}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* NEW PAGINATION INTERACTION FOOTER COMPONENT */}
          {paginatedRecords.total > itemsPerPage && (
            <div className="flex flex-col items-left gap-2 ml-6 mt-4 mb-4">
              <p className="text-xs sm:text-sm text-gray-500">
                {paginatedRecords.indexOfFirst + 1}–{Math.min(paginatedRecords.indexOfLast, paginatedRecords.total)} of {paginatedRecords.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  Prev
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {currentPage} / {Math.ceil(paginatedRecords.total / itemsPerPage)}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(paginatedRecords.total / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(paginatedRecords.total / itemsPerPage)}
                  className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {paginatedRecords.total === 0 && (
          <div className="p-16 text-center text-gray-400 text-xs font-medium">No projects found for this officer.</div>
        )}
      </section>
    </div>
  );
};

export default OfficerDetails;