// import { useState, useEffect, useMemo } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { FileText, Search, Filter, ChevronLeft, ChevronRight, User, FolderOpen, Loader2 } from "lucide-react";

// const Archives = ({ role }) => {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [activeFilter, setActiveFilter] = useState("Programme");
//   const [officerType, setOfficerType] = useState("All");
//   const [selectedYear, setSelectedYear] = useState(2026);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
  
//   const [programmes, setProgrammes] = useState([]);
//   const [allOfficers, setAllOfficers] = useState([]);
//   const [yearlyRecords, setYearlyRecords] = useState({});
// const [isFilterOpen, setIsFilterOpen] = useState(false);

//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!token) {
//         navigate('/login');
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
//         const [progRes, fieldOffRes, progOffRes] = await Promise.all([
//           fetch(`${API_URL}/api/programmes/`, fetchOptions),
//           fetch(`${API_URL}/api/auth/feild-officers`, fetchOptions),
//           fetch(`${API_URL}/api/auth/programme-officers`, fetchOptions)
//         ]);

//         if (progRes.status === 401) {
//           localStorage.clear();
//           navigate('/login');
//           return;
//         }

//         const progData = await progRes.json();
//         const fieldOffData = await fieldOffRes.json();
//         const progOffData = await progOffRes.json();

//         const fetchAllProjects = async (officers, type) => {
//           return await Promise.all(
//             (officers || []).map(async (off) => {
//               const endpoint = type === "Field" 
//                 ? `${API_URL}/api/projects/field-officer/${off._id}`
//                 : `${API_URL}/api/projects/programme-officer/${off._id}`;
              
//               const res = await fetch(endpoint, fetchOptions);
//               const json = await res.json();
//               return { 
//                 officerId: off._id, 
//                 name: off.email.split('@')[0], 
//                 role: type === "Field" ? "Field Officer" : "Program Officer",
//                 projects: json.data || [] 
//               };
//             })
//           );
//         };

//         const fieldOfficerResults = await fetchAllProjects(fieldOffData.data, "Field");
//         const progOfficerResults = await fetchAllProjects(progOffData.data, "Program");

//         const allOfficersData = [...fieldOfficerResults, ...progOfficerResults];
//         const masterProjectList = allOfficersData.flatMap(off => off.projects);
//         const uniqueProjects = Array.from(new Map(masterProjectList.map(p => [p._id, p])).values());

//         setAllOfficers(allOfficersData.map(off => ({
//           id: off.officerId,
//           name: off.name,
//           type: off.role,
//           count: off.projects.length
//         })));

//         if (progData.programmes) {
//           setProgrammes(progData.programmes.map(p => ({
//             name: p.programmeName,
//             count: uniqueProjects.filter(proj => 
//                proj.programme?.some(pr => pr.programmeName === p.programmeName) || 
//                proj.programme === p.programmeName ||
//                proj.programme?.programmeName === p.programmeName
//             ).length
//           })));
//         }

//         const recordsByYear = uniqueProjects.reduce((acc, proj) => {
//           const year = proj.endDate ? new Date(proj.endDate).getFullYear().toString() : "2026";
//           if (!acc[year]) acc[year] = [];
//           acc[year].push({
//             id: proj._id, 
//             ID: proj._id.slice(-5).toUpperCase(),
//             PROJECTNAME: proj.projectName,
//             DZONGKHAG: Array.isArray(proj.dzongkhag) ? proj.dzongkhag[0] : (proj.dzongkhag || "N/A"),
//             YEAR: year,
//             STATUS: proj.status || "N/A",
//           });
//           return acc;
//         }, {});
//         setYearlyRecords(recordsByYear);

//       } catch (error) {
//         console.error("Aggregation Fetch Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [token, navigate]);

//   const displayedData = useMemo(() => {
//     const s = searchTerm.toLowerCase();
//     if (activeFilter === "Programme") return programmes.filter(p => p.name.toLowerCase().includes(s));
//     if (activeFilter === "Officer") {
//       const base = officerType === "All" ? allOfficers : allOfficers.filter(o => o.type === officerType);
//       return base.filter(o => o.name.toLowerCase().includes(s));
//     }
//     if (activeFilter === "Year") {
//       return (yearlyRecords[selectedYear] || []).filter(proj => 
//         proj.PROJECTNAME.toLowerCase().includes(s) || proj.ID.toLowerCase().includes(s)
//       );
//     }
//     return [];
//   }, [searchTerm, activeFilter, officerType, programmes, allOfficers, yearlyRecords, selectedYear]);

//   const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

//   if (loading) return (
//     <div className="flex h-64 items-center justify-center">
//       <Loader2 className="animate-spin text-blue-600" size={24} />
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         {/* <div>
//           <h1 className="text-xl font-bold text-gray-800">Records Repository</h1>
//           <p className="text-[13px] text-gray-500 font-medium">View {activeFilter}s and associated data</p>
//         </div> */}

//  {activeFilter === "Officer" && (
//   <div className="w-full md:w-auto">
//     {/* Grid on mobile layout, switches back to regular flex row on screens 'sm' and larger */}
//     <div className="grid grid-cols-3 sm:flex sm:flex-row bg-white border border-gray-100 p-1.5 rounded-lg shadow-sm gap-1">
//       {["All", "Program Officer", "Field Officer"].map((tab) => (
//         <button
//           key={tab}
//           onClick={() => setOfficerType(tab)}
//           className={`
//             w-full sm:w-auto
//             px-2 sm:px-4 lg:px-5
//             py-2 sm:py-1.5
//             text-[9px] sm:text-[10px]
//             font-bold
//             rounded-lg
//             uppercase
//             whitespace-nowrap
//             transition-all
//             duration-300
//             text-center
//             flex items-center justify-center

//             ${
//               officerType === tab
//                 ? "bg-[#2EA1F2] text-white shadow-sm"
//                 : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
//             }
//           `}
//         >
//           {tab}
//         </button>
//       ))}
//     </div>
//   </div>
// )}

//         {/* {activeFilter === "Year" && (
//           <div className="flex items-center bg-white border border-gray-100 rounded-xl shadow-sm">
//             <button onClick={() => setSelectedYear(prev => prev - 1)} className="p-2 hover:bg-gray-50 border-r border-gray-100 text-gray-400"><ChevronLeft size={14}/></button>
//             <span className="px-6 text-xs font-bold text-blue-600">{selectedYear}</span>
//             <button onClick={() => setSelectedYear(prev => prev + 1)} className="p-2 hover:bg-gray-50 border-l border-gray-100 text-gray-400"><ChevronRight size={14}/></button>
//           </div>
//         )} */}
//         {activeFilter === "Year" && (
//   <div className="flex items-center justify-between sm:justify-center bg-white border border-gray-100 rounded-xl shadow-sm w-full sm:w-auto overflow-hidden">

//     <button
//       onClick={() => setSelectedYear(prev => prev - 1)}
//       className="px-4 sm:px-3 py-3 hover:bg-gray-50 border-r border-gray-100 text-gray-400 transition-colors"
//     >
//       <ChevronLeft size={14} />
//     </button>

//     <span className="flex-1 sm:flex-none text-center px-4 sm:px-6 text-sm sm:text-xs font-bold text-blue-600 whitespace-nowrap">
//       {selectedYear}
//     </span>

//     <button
//       onClick={() => setSelectedYear(prev => prev + 1)}
//       className="px-4 sm:px-3 py-3 hover:bg-gray-50 border-l border-gray-100 text-gray-400 transition-colors"
//     >
//       <ChevronRight size={14} />
//     </button>

//   </div>
// )}
//       </div>

//       {/* <div className="flex gap-3 items-center">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
//           <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeFilter.toLowerCase()}...`} className="w-full h-11 pl-10 pr-4 text-xs border border-gray-200 rounded-2xl outline-none bg-white shadow-sm" />
//         </div>
//         <div className="relative">
//           <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setSearchTerm(""); }} className="pl-4 pr-10 py-2.5 text-xs border border-gray-200 rounded-xl bg-white outline-none cursor-pointer appearance-none font-bold text-gray-600 shadow-sm">
//             <option value="Programme">Programme</option>
//             <option value="Officer">Officer</option>
//             <option value="Year">Year</option>
//           </select>
//           <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
//         </div>
//       </div> */}
//       <div className="flex gap-3 items-center">
//   <div className="relative flex-1 max-w-md">
//     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
//     <input 
//       type="text" 
//       value={searchTerm} 
//       onChange={(e) => setSearchTerm(e.target.value)} 
//       placeholder={`Search ${activeFilter.toLowerCase()}...`} 
//       className="w-full h-11 pl-10 pr-4 text-xs border border-gray-200 rounded-2xl outline-none bg-white shadow-sm" 
//     />
//   </div>

//   {/* ULTRACLEAN CUSTOM STATEFUL DROPDOWN */}
//   <div className="relative">
//     <button
//       type="button"
//       onClick={() => setIsFilterOpen(!isFilterOpen)}
//       className="flex items-center gap-6 pl-4 pr-9 py-2.5 text-xs border border-gray-200 rounded-xl bg-white font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
//     >
//       <span>{activeFilter}</span>
//       <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
//     </button>

//     {isFilterOpen && (
//       <>
//         {/* Invisible backdrop layer to close dropdown when clicking anywhere outside */}
//         <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
        
//         {/* Dropdown Options Panel */}
//         <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-30 overflow-hidden transform origin-top-right transition-all">
//           {["Programme", "Officer", "Year"].map((option) => (
//             <button
//               key={option}
//               type="button"
//               onClick={() => {
//                 setActiveFilter(option);
//                 setSearchTerm("");
//                 setIsFilterOpen(false);
//               }}
//               className={`w-full text-left px-4 py-2 text-xs transition-colors font-medium
//                 ${activeFilter === option 
//                   ? "bg-blue-50 text-blue-600 font-bold" 
//                   : "text-gray-600 hover:bg-gray-50"
//                 }
//               `}
//             >
//               {option}
//             </button>
//           ))}
//         </div>
//       </>
//     )}
//   </div>
// </div>

//       {activeFilter === "Programme" ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {displayedData.map((prog, i) => (
//             <div key={i} onClick={() => navigate(`${basePath}/programme/${prog.name}`)} className="bg-white p-6 rounded-xl border  shadow-sm hover:border-blue-300 transition-all cursor-pointer group">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#2EA1F2] group-hover:text-white transition-all"><FileText size={22} /></div>
//                 <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-lg">{prog.count} Projects</span>
//               </div>
//               <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{prog.name}</h3>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

//   <div className="w-full overflow-x-auto">

//     <table className="min-w-[850px] w-full text-left text-xs">
//             <thead className="bg-gray-50/50 text-gray-700 uppercase text-[10px] font-bold border-b border-gray-50">
//               {activeFilter === "Officer" ? (
//                 <tr>
//                   <th className="px-8 py-5">Officer Name</th>
//                   <th className="px-8 py-5">Designation</th>
//                   <th className="px-8 py-5 text-right">Project Count</th>
//                 </tr>
//               ) : (
//                 <tr>
//                   <th className="px-6 py-5">ID</th>
//                   <th className="px-6 py-5">Project Name</th>
//                   <th className="px-6 py-5">Dzongkhag</th>
//                   {/* <th className="px-6 py-5 text-right">Year</th> */}
//                   <th className="px-6 py-5">Status</th>
//                 </tr>
//               )}
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {displayedData.map((item, i) => (
//                 <tr key={i} onClick={() => {
//                     if (activeFilter === "Year") {
//                       navigate(`${basePath}/programme/view/project/${item.id}`)
//                     } else {
//                       // CRITICAL FIX: Use item.id (the hex ID) for the URL
//                       navigate(`${basePath}/officer/${item.id}`, { state: { officerName: item.name } });
//                     }
//                   }} className="hover:bg-blue-50/40 transition-colors cursor-pointer group">
//                   {activeFilter === "Officer" ? (
//                     <>
//                       <td className="px-8 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><User size={16}/></div><span className="font-bold text-gray-700 uppercase">{item.name}</span></div></td>
//                       <td className="px-8 py-4 text-gray-700 font-bold uppercase text-[9px]">{item.type}</td>
//                       <td className="px-8 py-4 text-right font-black text-gray-800">{item.count}</td>
//                     </>
//                   ) : (
//                     <>
//                       <td className="px-6 py-4 font-bold text-blue-600">{item.ID}</td>
//                       <td className="px-6 py-4 font-bold text-gray-800">{item.PROJECTNAME}</td>
//                       <td className="px-6 py-4 text-gray-500">{item.DZONGKHAG}</td>
//                       {/* <td className="px-6 py-4 text-right font-bold text-gray-400">{item.YEAR}</td> */}
//                       {/* <td className="px-6 py-4 text-gray-500">{item.STATUS}</td> */}
//                       <td className="px-6 py-4">

//   <span
//     className={`
//       px-2 py-0.5 text-[10px] font-bold rounded-xl uppercase tracking-wider

//       ${
//         item.STATUS === "Completed"
//           ? "bg-[#D7FFD3] text-green-500"

//           : item.STATUS === "Ongoing"
//           ? "bg-blue-50 text-blue-600"

//           : "bg-gray-100 text-gray-500"
//       }
//     `}
//   >
//     {item.STATUS}
//   </span>

// </td>
//                     </>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Archives;


import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Search, Filter, ChevronLeft, ChevronRight, User, Loader2 } from "lucide-react";

const Archives = ({ role }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [activeFilter, setActiveFilter] = useState("Programme");
  const [officerType, setOfficerType] = useState("All");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [programmes, setProgrammes] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);
  const [yearlyRecords, setYearlyRecords] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed

  const { pathname } = useLocation();
  const token = localStorage.getItem('token');

  // Reset page whenever filters or search terms change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, officerType, searchTerm, selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
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
        const [progRes, fieldOffRes, progOffRes] = await Promise.all([
          fetch(`${API_URL}/api/programmes/`, fetchOptions),
          fetch(`${API_URL}/api/auth/feild-officers`, fetchOptions),
          fetch(`${API_URL}/api/auth/programme-officers`, fetchOptions)
        ]);

        if (progRes.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        const progData = await progRes.json();
        const fieldOffData = await fieldOffRes.json();
        const progOffData = await progOffRes.json();

        const fetchAllProjects = async (officers, type) => {
          return await Promise.all(
            (officers || []).map(async (off) => {
              const endpoint = type === "Field" 
                ? `${API_URL}/api/projects/field-officer/${off._id}`
                : `${API_URL}/api/projects/programme-officer/${off._id}`;
              
              const res = await fetch(endpoint, fetchOptions);
              const json = await res.json();
              return { 
                officerId: off._id, 
                name: off.email.split('@')[0], 
                role: type === "Field" ? "Field Officer" : "Program Officer",
                projects: json.data || [] 
              };
            })
          );
        };

        const fieldOfficerResults = await fetchAllProjects(fieldOffData.data, "Field");
        const progOfficerResults = await fetchAllProjects(progOffData.data, "Program");

        const allOfficersData = [...fieldOfficerResults, ...progOfficerResults];
        const masterProjectList = allOfficersData.flatMap(off => off.projects);
        const uniqueProjects = Array.from(new Map(masterProjectList.map(p => [p._id, p])).values());

        setAllOfficers(allOfficersData.map(off => ({
          id: off.officerId,
          name: off.name,
          type: off.role,
          count: off.projects.length
        })));

        if (progData.programmes) {
          setProgrammes(progData.programmes.map(p => ({
            name: p.programmeName,
            count: uniqueProjects.filter(proj => 
               proj.programme?.some(pr => pr.programmeName === p.programmeName) || 
               proj.programme === p.programmeName ||
               proj.programme?.programmeName === p.programmeName
            ).length
          })));
        }

        const recordsByYear = uniqueProjects.reduce((acc, proj) => {
          const year = proj.endDate ? new Date(proj.endDate).getFullYear().toString() : "2026";
          if (!acc[year]) acc[year] = [];
          acc[year].push({
            id: proj._id, 
            ID: proj._id.slice(-5).toUpperCase(),
            PROJECTNAME: proj.projectName,
            DZONGKHAG: Array.isArray(proj.dzongkhag) ? proj.dzongkhag[0] : (proj.dzongkhag || "N/A"),
            YEAR: year,
            STATUS: proj.status || "N/A",
          });
          return acc;
        }, {});
        setYearlyRecords(recordsByYear);

      } catch (error) {
        console.error("Aggregation Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, API_URL]);

  // Paginated data processor for Officer Filter
  const officerData = useMemo(() => {
    const base =
      officerType === "All"
        ? allOfficers
        : allOfficers.filter(o => o.type === officerType);

    const filtered = base.filter(o =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;

    return {
      data: filtered.slice(indexOfFirst, indexOfLast),
      total: filtered.length,
      indexOfFirst,
      indexOfLast
    };
  }, [allOfficers, officerType, searchTerm, currentPage]);

  // ADDED: Paginated data processor for Year Filter
  const yearlyData = useMemo(() => {
    const s = searchTerm.toLowerCase();
    const base = yearlyRecords[selectedYear] || [];
    
    const filtered = base.filter(proj => 
      proj.PROJECTNAME.toLowerCase().includes(s) || proj.ID.toLowerCase().includes(s)
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;

    return {
      data: filtered.slice(indexOfFirst, indexOfLast),
      total: filtered.length,
      indexOfFirst,
      indexOfLast
    };
  }, [yearlyRecords, selectedYear, searchTerm, currentPage]);

  // Combines current tab views to display cleaner maps
  const displayedData = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (activeFilter === "Programme") return programmes.filter(p => p.name.toLowerCase().includes(s));
    if (activeFilter === "Officer") return officerData.data;
    if (activeFilter === "Year") return yearlyData.data; // CHANGED: Now references our paginated dataset
    return [];
  }, [searchTerm, activeFilter, programmes, officerData.data, yearlyData.data]);

  const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={24} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {activeFilter === "Officer" && (
          <div className="w-full md:w-auto">
            <div className="grid grid-cols-3 sm:flex sm:flex-row bg-white border border-gray-100 p-1.5 rounded-lg shadow-sm gap-1">
              {["All", "Program Officer", "Field Officer"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOfficerType(tab)}
                  className={`
                    w-full sm:w-auto px-2 sm:px-4 lg:px-5 py-2 sm:py-1.5 text-[9px] sm:text-[10px] font-bold rounded-lg uppercase whitespace-nowrap transition-all duration-300 text-center flex items-center justify-center
                    ${officerType === tab ? "bg-[#2EA1F2] text-white shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"}
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeFilter === "Year" && (
          <div className="flex items-center justify-between sm:justify-center bg-white border border-gray-100 rounded-xl shadow-sm w-full sm:w-auto overflow-hidden">
            <button
              type="button"
              onClick={() => setSelectedYear(prev => prev - 1)}
              className="px-4 sm:px-3 py-3 hover:bg-gray-50 border-r border-gray-100 text-gray-400 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="flex-1 sm:flex-none text-center px-4 sm:px-6 text-sm sm:text-xs font-bold text-blue-600 whitespace-nowrap">
              {selectedYear}
            </span>

            <button
              type="button"
              onClick={() => setSelectedYear(prev => prev + 1)}
              className="px-4 sm:px-3 py-3 hover:bg-gray-50 border-l border-gray-100 text-gray-400 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder={`Search ${activeFilter.toLowerCase()}...`} 
            className="w-full h-11 pl-10 pr-4 text-xs border border-gray-200 rounded-2xl outline-none bg-white shadow-sm" 
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-6 pl-4 pr-9 py-2.5 text-xs border border-gray-200 rounded-xl bg-white font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span>{activeFilter}</span>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsFilterOpen(false)} />
              
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-30 overflow-hidden transform origin-top-right transition-all">
                {["Programme", "Officer", "Year"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setActiveFilter(option);
                      setSearchTerm("");
                      setCurrentPage(1); // CHANGED: Reset page counter explicitly here
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors font-medium
                      ${activeFilter === option ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600 hover:bg-gray-50"}
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {activeFilter === "Programme" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedData.map((prog, i) => (
            <div key={i} onClick={() => navigate(`${basePath}/programme/${prog.name}`)} className="bg-white p-6 rounded-xl border shadow-sm hover:border-blue-300 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#2EA1F2] group-hover:text-white transition-all"><FileText size={22} /></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-2.5 py-1 rounded-lg">{prog.count} Projects</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{prog.name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-xs">
              <thead className="bg-gray-50/50 text-gray-700 uppercase text-[10px] font-bold border-b border-gray-50">
                {activeFilter === "Officer" ? (
                  <tr>
                    <th className="px-8 py-5">Officer Name</th>
                    <th className="px-8 py-5">Designation</th>
                    <th className="px-8 py-5 text-right">Project Count</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Project Name</th>
                    <th className="px-6 py-5">Dzongkhag</th>
                    <th className="px-6 py-5">Status</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedData.map((item, i) => (
                  <tr key={i} onClick={() => {
                      if (activeFilter === "Year") {
                        navigate(`${basePath}/programme/view/project/${item.id}`)
                      } else {
                        navigate(`${basePath}/officer/${item.id}`, { state: { officerName: item.name } });
                      }
                    }} className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {activeFilter === "Officer" ? (
                      <>
                        <td className="px-8 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><User size={16}/></div><span className="font-bold text-gray-700 uppercase">{item.name}</span></div></td>
                        <td className="px-8 py-4 text-gray-700 font-bold uppercase text-[9px]">{item.type}</td>
                        <td className="px-8 py-4 text-right font-black text-gray-800">{item.count}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-bold text-blue-600">{item.ID}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{item.PROJECTNAME}</td>
                        <td className="px-6 py-4 text-gray-500">{item.DZONGKHAG}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`
                              px-2 py-0.5 text-[10px] font-bold rounded-xl uppercase tracking-wider
                              ${item.STATUS === "Completed" ? "bg-[#D7FFD3] text-green-500" : item.STATUS === "Ongoing" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}
                            `}
                          >
                            {item.STATUS}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination for Officer View */}
            {activeFilter === "Officer" && officerData.total > itemsPerPage && (
              <div className="flex flex-col items-left gap-2 ml-4 mt-4 mb-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  {officerData.indexOfFirst + 1}–{Math.min(officerData.indexOfLast, officerData.total)} of {officerData.total}
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
                    {currentPage} / {Math.ceil(officerData.total / itemsPerPage)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(officerData.total / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(officerData.total / itemsPerPage)}
                    className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* ADDED: Pagination for Year View */}
            {activeFilter === "Year" && yearlyData.total > itemsPerPage && (
              <div className="flex flex-col items-left gap-2 ml-4 mt-4 mb-4">
                <p className="text-xs sm:text-sm text-gray-500">
                  {yearlyData.indexOfFirst + 1}–{Math.min(yearlyData.indexOfLast, yearlyData.total)} of {yearlyData.total}
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
                    {currentPage} / {Math.ceil(yearlyData.total / itemsPerPage)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(yearlyData.total / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(yearlyData.total / itemsPerPage)}
                    className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Archives;