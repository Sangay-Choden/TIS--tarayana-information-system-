import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, FileText, Sparkles, FileCheck, ChevronLeft } from "lucide-react";
import axios from 'axios';

const GenerateReport = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const rootPath = pathname.split('/')[1];

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [programme, setProgramme] = useState("All Programmes");
  const [format, setFormat] = useState("PDF Document");
  const [programmes, setProgrammes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [openProject, setOpenProject] = useState(false);
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openUsers, setOpenUsers] = useState(false);
  
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const USER_ID = storedUser?.id || storedUser?._id;
  
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const token = localStorage.getItem("token")

  // Validation Interception State & Node References
  const [touched, setTouched] = useState(false);
  const stepOneRef = useRef(null);

  const BHUTAN_DZONGKHAGS = [
    "Bumthang", "Chukha", "Dagana", "Gasa", "Haa", 
    "Lhuentse", "Mongar", "Paro", "Pema Gatshel", "Punakha", 
    "Samdrup Jongkhar", "Samtse", "Sarpang", "Thimphu", "Trashigang", 
    "Trashi Yangtse", "Trongsa", "Tsirang", "Wangdue Phodrang", "Zhemgang"
  ];

  const [selectedDzongkhags, setSelectedDzongkhags] = useState([]);
  const [openDzongkhags, setOpenDzongkhags] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/programmes")
      .then((res) => res.json())
      .then((data) => {
        setProgrammes(data.programmes || []);
      })
      .catch((err) => {
        console.error(err);
        setProgrammes([]);
      });
  }, []);

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

  useEffect(() => {
    if (!USER_ID) return;
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let allProjects = [];

        if (selectedProgrammes.length === 0) {
     const res = await axios.get(
  `http://localhost:5000/api/projects/programme-officer/${USER_ID}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const data = res.data;

console.log("ALL PROJECTS FOR OFFICER:", data);

allProjects =
  data.projects ||
  data.data ||
  data ||
  [];
      } else{
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
  }, [selectedProgrammes, USER_ID]);

  const dynamicYears = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    const yearSet = new Set();
    projects.forEach((proj) => {
      const dateSource = proj.startDate || proj.createdAt || proj.date;
      if (dateSource) {
        const year = new Date(dateSource).getFullYear().toString();
        yearSet.add(year);
      }
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [projects]);

  const getMinDate = () => (year ? `${year}-01-01` : "");
  const getMaxDate = () => (year ? `${year}-12-31` : "");

  const handleGenerate = async () => {
    setTouched(true);

    // Contextual Blockers Instead of Disabling Buttons
    const isQuarterlyMissingDates = type === "quarterly" && (!fromDate || !toDate);
    if (!type || !year || isQuarterlyMissingDates) {
      stepOneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        type,
        year,
        fromDate: type === "quarterly" ? fromDate : null,
        toDate: type === "quarterly" ? toDate : null,
        programmes: selectedProgrammes,
        projects: selectedProjects.length > 0 ? selectedProjects : projects.map((p) => p._id),
        dzongkhags: selectedDzongkhags,
        officers: selectedUsers,
        format: format === "PDF Document" ? "pdf" : "excel",
      };

      const res = await fetch("http://localhost:5000/api/report/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      setTouched(false); // Reset template indicators on operational download resolution
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
        <div className="w-full ">
          <div className="space-y-6">
            {/* BACK */}
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Reports
            </button>

            {/* TITLE */}
            <div>
              <h1 className="text-xl font-semibold">Generate Report</h1>
              <p className="text-sm text-gray-500">Configure and generate quarterly or annual reports</p>
            </div>

            {/* STEP 1 */}
            <div ref={stepOneRef} className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#2EA1F2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">1</div>
                <h2 className="font-semibold">Choose Report <span className="text-red-500">*</span></h2>
              </div>

              {/* TYPE */}
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

              {/* YEAR */}
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
                          <input
                            type="checkbox"
                            className="accent-blue-500"
                            checked={year === y}
                            onChange={() => setYear(y)}
                          />
                          {y}
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">No project years available for selection.</p>
                    )}
                  </div>
                  {touched && !year && <p className="text-xs text-red-500 font-semibold"> Active operational context timeline tracking field required.</p>}
                </div>
              )}

              {/* DATE RANGE */}
              {type === "quarterly" && year && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Select Period <span className="text-red-500">*</span></p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* FROM */}
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
                      {touched && !fromDate && <p className="text-xs text-red-500 font-medium"> Start metric range target date required</p>}
                    </div>

                    {/* TO */}
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
                      {touched && !toDate && <p className="text-xs text-red-500 font-medium"> Concluding audit evaluation deadline required</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2 */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#2EA1F2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">2</div>
                <h2 className="font-semibold">Report Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Projects Dropdown */}
                <div className="relative">
                  <div
                    onClick={() => setOpenProject(!openProject)}
                    className="border border-gray-200 px-4 h-[50px] rounded-xl cursor-pointer bg-white flex items-center text-gray-800 font-medium hover:border-blue-300 transition-all overflow-hidden"
                  >
                    {selectedProjects.length === 0
                      ? selectedProgrammes.length === 0 ? "All My Projects" : "All Projects (Selected Programmes)"
                      : projects.filter((p) => selectedProjects.includes(p._id)).map((p) => p.projectName || p.name).join(", ")}
                  </div>

                  {openProject && (
                    <div className="absolute z-20 bg-white border border-gray-100 rounded-2xl mt-2 w-full shadow-xl max-h-64 overflow-y-auto p-1">
                      <label className="flex items-center gap-2 p-2 hover:bg-gray-50 font-medium border-b cursor-pointer">
                        <input type="checkbox" checked={selectedProjects.length === 0} onChange={() => setSelectedProjects([])} />
                        {selectedProgrammes.length === 0 ? "All My Projects" : "All Projects in Selected Programmes"}
                      </label>
                      {projects.length > 0 ? (
                        projects.map((proj) => (
                          <label key={proj._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes(proj._id)}
                              onChange={() =>
                                setSelectedProjects((prev) =>
                                  prev.includes(proj._id) ? prev.filter((id) => id !== proj._id) : [...prev, proj._id]
                                )
                              }
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

                {/* Format Selector */}
                <select
                  className="border border-gray-200 px-4 h-[50px] rounded-xl bg-white text-gray-800 font-medium outline-none focus:border-blue-400"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option>PDF Document</option>
                  <option>Excel</option>
                </select>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button onClick={() => navigate(`/${rootPath}/reports`)} className="px-5 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className={`w-full sm:w-auto text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 transition-colors ${
                  loading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#2EA1F2] hover:bg-[#298CD2]"
                }`}
              >
                <FileCheck size={18} />
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
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
            <p onClick={handleDone} className="mt-4 text-blue-500 cursor-pointer text-sm font-medium hover:underline">
              Go to Reports
            </p>
          </div>
        </div>
      )}

      {/* BACKEND EXCEPTION MODAL */}
      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
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