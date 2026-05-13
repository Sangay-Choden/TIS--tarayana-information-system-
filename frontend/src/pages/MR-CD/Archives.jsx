import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Search, Filter, ChevronLeft, ChevronRight, User, FolderOpen, Loader2 } from "lucide-react";

const Archives = ({ role }) => {
  const [activeFilter, setActiveFilter] = useState("Programme");
  const [officerType, setOfficerType] = useState("All");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [programmes, setProgrammes] = useState([]);
  const [allOfficers, setAllOfficers] = useState([]);
  const [yearlyRecords, setYearlyRecords] = useState({});

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem('token');

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
          fetch("http://localhost:5000/api/programmes/", fetchOptions),
          fetch("http://localhost:5000/api/auth/feild-officers", fetchOptions),
          fetch("http://localhost:5000/api/auth/programme-officers", fetchOptions)
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
                ? `http://localhost:5000/api/projects/field-officer/${off._id}`
                : `http://localhost:5000/api/projects/programme-officer/${off._id}`;
              
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
  }, [token, navigate]);

  const displayedData = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (activeFilter === "Programme") return programmes.filter(p => p.name.toLowerCase().includes(s));
    if (activeFilter === "Officer") {
      const base = officerType === "All" ? allOfficers : allOfficers.filter(o => o.type === officerType);
      return base.filter(o => o.name.toLowerCase().includes(s));
    }
    if (activeFilter === "Year") {
      return (yearlyRecords[selectedYear] || []).filter(proj => 
        proj.PROJECTNAME.toLowerCase().includes(s) || proj.ID.toLowerCase().includes(s)
      );
    }
    return [];
  }, [searchTerm, activeFilter, officerType, programmes, allOfficers, yearlyRecords, selectedYear]);

  const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={24} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* <div>
          <h1 className="text-xl font-bold text-gray-800">Records Repository</h1>
          <p className="text-[13px] text-gray-500 font-medium">View {activeFilter}s and associated data</p>
        </div> */}

        {activeFilter === "Officer" && (
          <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
            {["All", "Program Officer", "Field Officer"].map((tab) => (
              <button key={tab} onClick={() => setOfficerType(tab)} className={`px-4 py-1.5 text-[10px] font-bold rounded-xl uppercase transition-all ${officerType === tab ? "bg-[#2EA1F2] text-white shadow-md" : "text-gray-400 hover:text-gray-600"}`}>
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* {activeFilter === "Year" && (
          <div className="flex items-center bg-white border border-gray-100 rounded-xl shadow-sm">
            <button onClick={() => setSelectedYear(prev => prev - 1)} className="p-2 hover:bg-gray-50 border-r border-gray-100 text-gray-400"><ChevronLeft size={14}/></button>
            <span className="px-6 text-xs font-bold text-blue-600">{selectedYear}</span>
            <button onClick={() => setSelectedYear(prev => prev + 1)} className="p-2 hover:bg-gray-50 border-l border-gray-100 text-gray-400"><ChevronRight size={14}/></button>
          </div>
        )} */}
        {activeFilter === "Year" && (
  <div className="flex items-center justify-between sm:justify-center bg-white border border-gray-100 rounded-xl shadow-sm w-full sm:w-auto overflow-hidden">

    <button
      onClick={() => setSelectedYear(prev => prev - 1)}
      className="px-4 sm:px-3 py-3 hover:bg-gray-50 border-r border-gray-100 text-gray-400 transition-colors"
    >
      <ChevronLeft size={14} />
    </button>

    <span className="flex-1 sm:flex-none text-center px-4 sm:px-6 text-sm sm:text-xs font-bold text-blue-600 whitespace-nowrap">
      {selectedYear}
    </span>

    <button
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
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={`Search ${activeFilter.toLowerCase()}...`} className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl outline-none bg-white shadow-sm" />
        </div>
        <div className="relative">
          <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setSearchTerm(""); }} className="pl-4 pr-10 py-2.5 text-xs border border-gray-200 rounded-xl bg-white outline-none cursor-pointer appearance-none font-bold text-gray-600 shadow-sm">
            <option value="Programme">Programme</option>
            <option value="Officer">Officer</option>
            <option value="Year">Year</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={12} />
        </div>
      </div>

      {activeFilter === "Programme" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedData.map((prog, i) => (
            <div key={i} onClick={() => navigate(`${basePath}/programme/${prog.name}`)} className="bg-white p-6 rounded-xl border  shadow-sm hover:border-blue-300 transition-all cursor-pointer group">
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
                  <th className="px-6 py-5 text-right">Year</th>
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
                      // CRITICAL FIX: Use item.id (the hex ID) for the URL
                      navigate(`${basePath}/officer/${item.id}`, { state: { officerName: item.name } });
                    }
                  }} className="hover:bg-blue-50/40 transition-colors cursor-pointer group">
                  {activeFilter === "Officer" ? (
                    <>
                      <td className="px-8 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0"><User size={16}/></div><span className="font-bold text-gray-700 uppercase">{item.name}</span></div></td>
                      <td className="px-8 py-4 text-gray-400 font-bold uppercase text-[9px]">{item.type}</td>
                      <td className="px-8 py-4 text-right font-black text-gray-800">{item.count}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-bold text-blue-600">{item.ID}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{item.PROJECTNAME}</td>
                      <td className="px-6 py-4 text-gray-500">{item.DZONGKHAG}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-400">{item.YEAR}</td>
                      {/* <td className="px-6 py-4 text-gray-500">{item.STATUS}</td> */}
                      <td className="px-6 py-4">

  <span
    className={`
      px-2 py-0.5 text-[10px] font-bold rounded-xl uppercase tracking-wider

      ${
        item.STATUS === "Completed"
          ? "bg-[#D7FFD3] text-green-500"

          : item.STATUS === "Ongoing"
          ? "bg-blue-50 text-blue-600"

          : "bg-gray-100 text-gray-500"
      }
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Archives;