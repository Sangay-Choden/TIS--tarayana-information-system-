import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, FileText, Sparkles, FileCheck, ChevronLeft } from "lucide-react";

const GenerateReport = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rootPath = pathname.split('/')[1];

  // Global UI States
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Report Settings States
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [format, setFormat] = useState("PDF Document");

  // Dynamic Filter Data
  const [programmes, setProgrammes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const BHUTAN_DZONGKHAGS = [
    "Bumthang", "Chukha", "Dagana", "Gasa", "Haa", 
    "Lhuentse", "Mongar", "Paro", "Pema Gatshel", "Punakha", 
    "Samdrup Jongkhar", "Samtse", "Sarpang", "Thimphu", "Trashigang", 
    "Trashi Yangtse", "Trongsa", "Tsirang", "Wangdue Phodrang", "Zhemgang"
  ];

  // Selection Filter States
  const [activeCategory, setActiveCategory] = useState(null); 
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDzongkhags, setSelectedDzongkhags] = useState([]);

  // Dropdown Visibility States
  const [open, setOpen] = useState(false);
  const [openProject, setOpenProject] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openDzongkhags, setOpenDzongkhags] = useState(false);

  // Validation Interception State & Node References
  const [touched, setTouched] = useState(false);
  const stepOneRef = useRef(null);

  // Refs for Outside Click Detection
  const progRef = useRef(null);
  const projRef = useRef(null);
  const userRef = useRef(null);
  const dzonRef = useRef(null);

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (progRef.current && !progRef.current.contains(event.target)) setOpen(false);
      if (projRef.current && !projRef.current.contains(event.target)) setOpenProject(false);
      if (userRef.current && !userRef.current.contains(event.target)) setOpenUsers(false);
      if (dzonRef.current && !dzonRef.current.contains(event.target)) setOpenDzongkhags(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch Programmes
  useEffect(() => {
    fetch("http://localhost:5000/api/programmes")
      .then((res) => res.json())
      .then((data) => setProgrammes(data.programmes || []))
      .catch((err) => {
        console.error(err);
        setProgrammes([]);
      });
  }, []);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/users");
        const data = await res.json();
        const allUsers = data.users || data.data || data || [];

        const filtered = allUsers.filter((u) => {
          const roleName = u.roleId?.roleName || u.roleId?.name || u.roleId?.code;
          return roleName === "ProgrammeOfficer" || roleName === "FieldOfficer";
        });
        setUsers(filtered);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Fetch Projects conditionally based on chosen Programme
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let allProjects = [];

        if (selectedProgrammes.length === 0) {
          const res = await fetch("http://localhost:5000/api/projects");
          const data = await res.json();
          allProjects = data.projects || data.data || data || [];
        } else {
          const requests = selectedProgrammes.map((id) =>
            fetch(`http://localhost:5000/api/projects/programme/${id}`).then((res) => res.json())
          );
          const results = await Promise.all(requests);
          allProjects = results.flatMap((res) => res.projects || res.data || res || []);
        }

        const uniqueProjects = Array.from(
          new Map(allProjects.map((p) => [p._id, p])).values()
        );
        setProjects(uniqueProjects);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    setSelectedProjects([]); 
  }, [selectedProgrammes]);

  // Extract Years dynamically from Projects
  const dynamicYears = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const yearSet = new Set();
    
    projects.forEach((proj) => {
      const dateSource = proj.startDate || proj.createdAt || proj.date;
      if (dateSource) {
        const parsedYear = new Date(dateSource).getFullYear().toString();
        yearSet.add(parsedYear);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [projects]);

  const getMinDate = () => (year ? `${year}-01-01` : "");
  const getMaxDate = () => (year ? `${year}-12-31` : "");

  const handleGenerate = async () => {
    setTouched(true);

    // Dynamic Validation Checkers
    const isQuarterlyMissingDates = type === "quarterly" && (!fromDate || !toDate);
    if (!type || !year || isQuarterlyMissingDates) {
      stepOneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        type,
        year,
        fromDate: type === "quarterly" ? fromDate : null,
        toDate: type === "quarterly" ? toDate : null,
        programmes: activeCategory === 'programme' ? (selectedProgrammes.length > 0 ? selectedProgrammes : "global") : null,
        projects: activeCategory === 'programme' ? (selectedProjects.length > 0 ? selectedProjects : "global") : null,
        officers: activeCategory === 'officer' ? (selectedUsers.length > 0 ? selectedUsers : "global") : null,
        dzongkhags: activeCategory === 'dzongkhag' ? (selectedDzongkhags.length > 0 ? selectedDzongkhags : "global") : null,
        format: format === "PDF Document" ? "pdf" : "excel",
      };

      const res = await fetch("http://localhost:5000/api/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMessage(err.message || "Report generation failed");
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 2000);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "PDF Document" ? `report-${year}.pdf` : `report-${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTouched(false); // Reset template indicators on successful resolution
    } catch (err) {
      console.error(err);
      setErrorMessage("Server error while generating report");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    navigate(`/${rootPath}/reports`);
  };

  return (
    <>
      <div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">
        <div className="w-full">
          <div className="space-y-6">
            {/* BACK BUTTON */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Reports
            </button>

            {/* TITLE */}
            <div>
              <h1 className="text-xl font-semibold">Generate Report</h1>
              <p className="text-sm text-gray-500">Configure and generate quarterly or annual reports</p>
            </div>

            {/* STEP 1: CHOOSE REPORT TYPE */}
            <div ref={stepOneRef} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#2EA1F2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">1</div>
                <h2 className="font-semibold">Choose Report <span className="text-red-500">*</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div
                  onClick={() => {
                    setType("quarterly");
                    setFromDate("");
                    setToDate("");
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    type === "quarterly" 
                      ? "border-[#2EA1F2] bg-blue-50 shadow transition-shadow glow" 
                      : touched && !type ? "border-red-400 bg-red-50/30" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={type === "quarterly" ? "text-blue-500" : "text-gray-400"} />
                    <div>
                      <h3 className="font-medium">Quarterly Report</h3>
                      <p className="text-sm text-gray-500">Progress for a specific quarter</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setType("annual")} 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    type === "annual" 
                      ? "border-[#2EA1F2] bg-blue-50 shadow transition-shadow glow" 
                      : touched && !type ? "border-red-400 bg-red-50/30" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={type === "annual" ? "text-blue-500" : "text-gray-400"} />
                    <div>
                      <h3 className="font-medium">Annual Report</h3>
                      <p className="text-sm text-gray-500">Full year overview & achievements</p>
                    </div>
                  </div>
                </div>
              </div>
              {touched && !type && <p className="text-xs text-red-500 font-semibold -mt-3">Report template configuration style selection is required.</p>}

              {/* DYNAMIC YEAR SELECTOR */}
              {type && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Select Year <span className="text-red-500">*</span></p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicYears.length > 0 ? (
                      dynamicYears.map((y) => (
                        <label
                          key={y}
                          className={`flex items-center gap-3 px-5 py-3 rounded-xl border cursor-pointer font-medium transition-all ${
                            year === y 
                              ? "border-blue-500 bg-blue-50 text-blue-600" 
                              : touched && !year ? "border-red-300 bg-red-50/30 hover:border-red-400" : "bg-white border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          <input type="checkbox" className="accent-blue-500" checked={year === y} onChange={() => setYear(y)} />
                          {y}
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No project years available for selection.</p>
                    )}
                  </div>
                  {touched && !year && <p className="text-xs text-red-500 font-semibold">Active operational context timeline tracking field required.</p>}
                </div>
              )}

              {/* DATE RANGE SELECTOR */}
              {type === "quarterly" && year && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Select Period <span className="text-red-500">*</span></p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <input 
                        type="date" 
                        value={fromDate} 
                        min={getMinDate()} 
                        max={toDate || getMaxDate()} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        className={`border p-3 rounded-lg outline-none transition-colors ${
                          touched && !fromDate ? "border-red-400 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                        }`} 
                      />
                      {touched && !fromDate && <p className="text-xs text-red-500 font-medium">Start metric range target date required</p>}
                    </div>

                    <div className="flex flex-col gap-1">
                      <input 
                        type="date" 
                        value={toDate} 
                        min={fromDate || getMinDate()} 
                        max={getMaxDate()} 
                        onChange={(e) => setToDate(e.target.value)} 
                        className={`border p-3 rounded-lg outline-none transition-colors ${
                          touched && !toDate ? "border-red-400 bg-red-50/20 focus:border-red-500" : "border-gray-200 focus:border-blue-400"
                        }`} 
                      />
                      {touched && !toDate && <p className="text-xs text-red-500 font-medium">Concluding audit evaluation deadline required</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: REPORT DETAILS & FILTERS */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#2EA1F2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">2</div>
                <h2 className="font-semibold">Report Details</h2>
                {activeCategory && (
                  <button 
                    onClick={() => {
                      setActiveCategory(null);
                      setSelectedProgrammes([]);
                      setSelectedProjects([]);
                      setSelectedUsers([]);
                      setSelectedDzongkhags([]);
                    }}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* PROGRAMME FILTER */}
                <div className="relative" ref={progRef}>
                  <div
                    onClick={() => {
                      if (!activeCategory || activeCategory === 'programme') {
                        setOpen(!open);
                        setActiveCategory('programme');
                      }
                    }}
                    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
                      activeCategory && activeCategory !== 'programme' ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
                    }`}
                  >
                    {selectedProgrammes.length === 0 ? "All Programmes" : programmes.filter(p => selectedProgrammes.includes(p._id)).map(p => p.programmeName).join(", ")}
                  </div>

                  {open && (
                    <div className="absolute z-20 bg-white border border-gray-100 rounded-2xl mt-2 w-full shadow-xl max-h-64 overflow-y-auto p-1">
                      <label className="flex gap-2 p-2 cursor-pointer font-medium border-b">
                        <input type="checkbox" checked={selectedProgrammes.length === 0} onChange={() => setSelectedProgrammes([])} />
                        All Programmes
                      </label>
                      {programmes.map((p) => (
                        <label key={p._id} className="flex gap-2 p-2 cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedProgrammes.includes(p._id)}
                            onChange={() => setSelectedProgrammes((prev) => prev.includes(p._id) ? prev.filter((id) => id !== p._id) : [...prev, p._id])}
                          />
                          {p.programmeName}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* PROJECTS FILTER */}
                <div className="relative" ref={projRef}>
                  <div
                    onClick={() => {
                      if (!activeCategory || activeCategory === 'programme') {
                        setOpenProject(!openProject);
                        setActiveCategory('programme');
                      }
                    }}
                    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
                      activeCategory && activeCategory !== 'programme' ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
                    }`}
                  >
                    {selectedProjects.length === 0 ? (selectedProgrammes.length === 0 ? "All Projects (Global)" : "All Projects (Selected)") : projects.filter((p) => selectedProjects.includes(p._id)).map((p) => p.projectName || p.name).join(", ")}
                  </div>

                  {openProject && (
                    <div className="absolute z-20 bg-white border border-gray-100 rounded-2xl mt-2 w-full shadow-xl max-h-64 overflow-y-auto p-1">
                      <label className="flex items-center gap-2 p-2 hover:bg-gray-50 font-medium border-b cursor-pointer">
                        <input type="checkbox" checked={selectedProjects.length === 0} onChange={() => setSelectedProjects([])} />
                        {selectedProgrammes.length === 0 ? "All Projects" : "All Projects in Selected Programmes"}
                      </label>
                      {projects.length > 0 ? (
                        projects.map((proj) => (
                          <label key={proj._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes(proj._id)}
                              onChange={() => setSelectedProjects((prev) => prev.includes(proj._id) ? prev.filter((id) => id !== proj._id) : [...prev, proj._id])}
                            />
                            <span className="text-sm">{proj.projectName || proj.name}</span>
                          </label>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-400 text-center">No projects found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* OFFICERS FILTER */}
                <div className="relative" ref={userRef}>
                  <div
                    onClick={() => {
                      if (!activeCategory || activeCategory === 'officer') {
                        setOpenUsers(!openUsers);
                        setActiveCategory('officer');
                      }
                    }}
                    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
                      activeCategory && activeCategory !== 'officer' ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
                    }`}
                  >
                    {selectedUsers.length === 0 ? "All Officers" : users.filter(u => selectedUsers.includes(u._id)).map(u => u.email).join(", ")}
                  </div>

                  {openUsers && (
                    <div className="absolute z-20 bg-white border border-gray-100 rounded-2xl mt-2 w-full shadow-xl max-h-64 overflow-y-auto p-1">
                      <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 cursor-pointer font-medium border-b">
                        <input type="checkbox" checked={selectedUsers.length === 0} onChange={() => setSelectedUsers([])} />
                        All Officers
                      </label>
                      {Array.isArray(users) && users.map((u) => (
                        <label key={u._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(u._id)}
                            onChange={() => setSelectedUsers((prev) => prev.includes(u._id) ? prev.filter((id) => id !== u._id) : [...prev, u._id])}
                          />
                          {u.email}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* DZONGKHAGS FILTER */}
                <div className="relative" ref={dzonRef}>
                  <div
                    onClick={() => {
                      if (!activeCategory || activeCategory === 'dzongkhag') {
                        setOpenDzongkhags(!openDzongkhags);
                        setActiveCategory('dzongkhag');
                      }
                    }}
                    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
                      activeCategory && activeCategory !== 'dzongkhag' ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
                    }`}
                  >
                    {selectedDzongkhags.length === 0 ? "All Dzongkhags" : selectedDzongkhags.join(", ")}
                  </div>

                  {openDzongkhags && (
                    <div className="absolute z-20 bg-white border border-gray-100 rounded-2xl mt-2 w-full shadow-xl max-h-64 overflow-y-auto p-1">
                      <label className="flex items-center gap-2 p-2 hover:bg-gray-50 border-b cursor-pointer font-medium">
                        <input type="checkbox" checked={selectedDzongkhags.length === 0} onChange={() => setSelectedDzongkhags([])} />
                        All Dzongkhags
                      </label>
                      {BHUTAN_DZONGKHAGS.map((dz) => (
                        <label key={dz} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDzongkhags.includes(dz)}
                            onChange={() => setSelectedDzongkhags((prev) => prev.includes(dz) ? prev.filter((item) => item !== dz) : [...prev, dz])}
                          />
                          <span className="text-sm">{dz}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* FILE FORMAT SELECT */}
                <select
                  className="border border-gray-200 px-4 h-[50px] rounded-xl bg-white text-gray-800 font-medium outline-none focus:border-blue-400 cursor-pointer"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option>PDF Document</option>
                  <option>Excel</option>
                </select>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button onClick={() => navigate(`/${rootPath}/reports`)} className="px-5 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full sm:w-auto px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 transition-colors ${
                  loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#2EA1F2] text-white hover:bg-[#298CD2]"
                }`}
              >
                <FileCheck size={18} />
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="text-purple-600" size={36} />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Report Generated Successfully</h2>
            <p className="text-gray-500 mt-2 text-sm">Your report has been generated successfully and is ready to view or download.</p>
            <p onClick={handleDone} className="mt-4 text-blue-500 cursor-pointer text-sm font-semibold hover:underline">
              Go to Reports
            </p>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-[#AA3333] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-700">Report Generation Failed</h2>
            <p className="text-gray-500 mt-2 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GenerateReport;