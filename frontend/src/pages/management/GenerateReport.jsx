
import { useState, useEffect,useMemo } from "react";
import { useNavigate , useLocation} from "react-router-dom";
import { Calendar, FileText, Sparkles,FileCheck, ChevronLeft } from "lucide-react";

const GenerateReport = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

    const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

  // const [collapsed, setCollapsed] = useState(false);
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
  const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
// Add this outside or inside the component
const BHUTAN_DZONGKHAGS = [
  "Bumthang", "Chukha", "Dagana", "Gasa", "Haa", 
  "Lhuentse", "Mongar", "Paro", "Pema Gatshel", "Punakha", 
  "Samdrup Jongkhar", "Samtse", "Sarpang", "Thimphu", "Trashigang", 
  "Trashi Yangtse", "Trongsa", "Tsirang", "Wangdue Phodrang", "Zhemgang"
];

// Inside the GenerateReport component, add these states:
const [selectedDzongkhags, setSelectedDzongkhags] = useState([]);
const [openDzongkhags, setOpenDzongkhags] = useState(false);

// Add this with your other states
const [activeCategory, setActiveCategory] = useState(null); 
const handleCategoryClick = (category) => {
  if (activeCategory === category) return; // Already active

  // Reset all selections to "All" (empty arrays)
  setSelectedProgrammes([]);
  setSelectedProjects([]);
  setSelectedUsers([]);
  setSelectedDzongkhags([]);
  
  // Set the new active category
  setActiveCategory(category);
};
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
        const roleName =
          u.roleId?.roleName || u.roleId?.name || u.roleId?.code;

        return (
          roleName === "ProgrammeOfficer" ||
          roleName === "FieldOfficer"
        );
      });

      setUsers(filtered);
      console.log(filtered)
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  fetchUsers();
}, []);

useEffect(() => {
  const fetchProjects = async () => {
    try {
      setLoading(true);
      let allProjects = [];

      // If "All Programmes" (selectedProgrammes is empty)
      if (selectedProgrammes.length === 0) {
        const res = await fetch("http://localhost:5000/api/projects");
        const data = await res.json();
        allProjects = data.projects || data.data || data || [];
      } 
      // If specific programmes are selected
      else {
        const requests = selectedProgrammes.map((id) =>
          fetch(`http://localhost:5000/api/projects/programme/${id}`).then((res) => res.json())
        );
        const results = await Promise.all(requests);
        allProjects = results.flatMap((res) => res.projects || res.data || res || []);
      }

      // Unique projects by ID
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
  // We reset project selection so we don't have dangling IDs from other programmes
  setSelectedProjects([]); 
}, [selectedProgrammes]);

// Replace the static 'years' constant with this logic inside your component
const dynamicYears = useMemo(() => {
  if (!projects || projects.length === 0) return [];

  const yearSet = new Set();
  
  projects.forEach((proj) => {
    // Check for common date fields (adjust based on your API's schema)
    const dateSource = proj.startDate || proj.createdAt || proj.date;
    if (dateSource) {
      const year = new Date(dateSource).getFullYear().toString();
      yearSet.add(year);
    }
  });

  // Sort years descending (e.g., 2026, 2025...)
  return Array.from(yearSet).sort((a, b) => b - a);
}, [projects]);
  // 👉 restrict dates to selected year
  const getMinDate = () => (year ? `${year}-01-01` : "");
  const getMaxDate = () => (year ? `${year}-12-31` : "");

  const handleGenerate = async () => {
  if (!type || !year) return;
  if (type === "quarterly" && (!fromDate || !toDate)) return;

  try {
    setLoading(true);

    const token = localStorage.getItem("token");

  const payload = {
  type,
  year,
  fromDate: type === "quarterly" ? fromDate : null,
  toDate: type === "quarterly" ? toDate : null,

  programmes: activeCategory === 'programme' 
        ? (selectedProgrammes.length > 0 ? selectedProgrammes : "global") 
        : null,

      projects: activeCategory === 'programme' 
        ? (selectedProjects.length > 0 ? selectedProjects : "global") 
        : null,

      officers: activeCategory === 'officer' 
        ? (selectedUsers.length > 0 ? selectedUsers : "global") 
        : null,

      dzongkhags: activeCategory === 'dzongkhag' 
        ? (selectedDzongkhags.length > 0 ? selectedDzongkhags : "global") 
        : null,

  format: format === "PDF Document" ? "pdf" : "excel",
  
};
console.log("REPORT PAYLOAD:", payload);
console.log("SELECTED OFFICERS:", selectedUsers);
    const res = await fetch(
      "http://localhost:5000/api/report/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      }
    );

   if (!res.ok) {

  const err = await res.json();
  setErrorMessage(err.message || "Report generation failed");
  setShowErrorPopup(true);

  setTimeout(() => {
    setShowErrorPopup(false);

  }, 2000);

  setLoading(false);

  return;
}

    // 🔥 FILE DOWNLOAD HANDLING
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download =
      format === "PDF Document"
        ? `report-${year}.pdf`
        : `report-${year}.xlsx`;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

    setShowSuccess(true);
  } catch (err) {
    console.error(err);
    setErrorMessage("Server error while generating report");
setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);

  } finally {
    setLoading(false);
  }
};

  const handleDone = () => {

    navigate(`/${rootPath}/reports`);
  };

    const isGenerateDisabled =
  !type ||
  !year ||
  (type === "quarterly" && (!fromDate || !toDate));


  return (
    <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">
          {/* BACK */}
            <button onClick={() => navigate(-1)}
      className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Reports
            </button>

          {/* TITLE */}
          <div>
            <h1 className="text-xl font-semibold">Generate Report</h1>
            <p className="text-sm text-gray-500">
              Configure and generate quarterly or annual reports
            </p>
          </div>

          {/* STEP 1 */}
          <div className="
  bg-white
  p-5 sm:p-6
  rounded-3xl
  border border-gray-100
  shadow-sm
  space-y-6
">
            <div className="flex items-center gap-3">
               <div className="bg-[#2EA1F2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">
                1
              </div>
              <h2 className="font-semibold">Choose Report</h2>
            </div>

            {/* TYPE */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                onClick={() => {
                  setType("quarterly");
                  setFromDate("");
                  setToDate("");
                }}
                className={`p-4 rounded-xl border cursor-pointer ${
                  type === "quarterly"
                    ? "border-[#2EA1F2] bg-blue-50 shadow transition-shadow glow"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar />
                  <div>
                    <h3 className="font-medium">Quarterly Report</h3>
                    <p className="text-sm text-gray-500">
                      Progress for a specific quarter
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setType("annual")}
                className={`p-4 rounded-xl border cursor-pointer ${
                  type === "annual"
                    ? "border-[#2EA1F2] bg-blue-50 shadow transition-shadow glow"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText />
                  <div>
                    <h3 className="font-medium">Annual Report</h3>
                    <p className="text-sm text-gray-500">
                      Full year overview & achievements
                    </p>
                  </div>
                </div>
              </div>
            </div>

         
       {/* YEAR (dynamic based on projects) */}
{type && (
  <div>
    <p className="text-sm text-gray-600 mb-2">
      Select Year
    </p>

    <div className="flex flex-wrap gap-3">
      {dynamicYears.length > 0 ? (
        dynamicYears.map((y) => (
          <label
            key={y}
            className={`
              flex items-center gap-3
              px-5 py-3
              rounded-xl
              border
              cursor-pointer
              font-medium
              transition-all
              ${
                year === y
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "bg-white border-gray-200 hover:border-blue-200"
              }
            `}
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
        <p className="text-xs text-gray-400 italic">
          No project years available for selection.
        </p>
      )}
    </div>
  </div>
)}

            {/* DATE RANGE */}
            {type === "quarterly" && year && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Select Period
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* FROM */}
                  <input
                    type="date"
                    value={fromDate}
                    min={getMinDate()}
                    max={toDate || getMaxDate()}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border p-3 rounded-lg"
                  />

                  {/* TO */}
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || getMinDate()}
                    max={getMaxDate()}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border p-3 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2 */}
          <div className="
  bg-white
  p-5 sm:p-6
  rounded-3xl
  border border-gray-100
  shadow-sm
  space-y-6
">
            <div className="flex items-center gap-3">
              <div className="bg-[#2EA1F2] text-white w-7 h-7 flex items-center justify-center rounded-full text-sm">
                2
              </div>
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
          
             <div className="relative">
  {/* Trigger */}
  <div
  onClick={() => {
      if (!activeCategory || activeCategory === 'programme') {
        setOpen(!open);
        setActiveCategory('programme');
      }
    }}
    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
      activeCategory && activeCategory !== 'programme' 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
        : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
    }`}
  >
   {
  selectedProgrammes.length === 0
    ? "All Programmes"
    : programmes
        .filter(p => selectedProgrammes.includes(p._id))
        .map(p => p.programmeName)
        .join(", ")
}
  </div>

  {/* Dropdown */}
  {open && (
    <div className="
  absolute
  z-20
  bg-white
  border border-gray-100
  rounded-2xl
  mt-2
  w-full
  shadow-xl
  max-h-64
  overflow-y-auto
  p-1
">
      
      <label className="flex gap-2 p-2">
        <input
          type="checkbox"
          checked={selectedProgrammes.length === 0}
          onChange={() => setSelectedProgrammes([])}
        />
        All Programmes
      </label>

      {programmes.map((p) => (
        <label key={p._id} className="flex gap-2 p-2">
          <input
            type="checkbox"
            checked={selectedProgrammes.includes(p._id)}
            onChange={() =>
              setSelectedProgrammes((prev) =>
                prev.includes(p._id)
                  ? prev.filter((id) => id !== p._id)
                  : [...prev, p._id]
              )
            }
          />
          {p.programmeName}
        </label>
      ))}
    </div>
  )}
</div>
        <div className="relative">
  {/* Trigger */}
  <div
 onClick={() => {
      if (!activeCategory || activeCategory === 'programme') {
        setOpenProject(!openProject);
        setActiveCategory('programme');
      }
    }}
    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
      activeCategory && activeCategory !== 'programme' 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
        : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
    }`}
  
  >
    {selectedProjects.length === 0
      ? selectedProgrammes.length === 0 
        ? "All Projects (Global)" 
        : "All Projects (Selected Programmes)"
      : projects
          .filter((p) => selectedProjects.includes(p._id))
          .map((p) => p.projectName || p.name)
          .join(", ")}
  </div>

  {/* Dropdown */}
  {openProject && (
    <div className="
  absolute
  z-20
  bg-white
  border border-gray-100
  rounded-2xl
  mt-2
  w-full
  shadow-xl
  max-h-64
  overflow-y-auto
  p-1
">
      
      {/* "All" Label changes based on programme context */}
      <label className="flex items-center gap-2 p-2 hover:bg-gray-50 font-medium border-b cursor-pointer">
        <input
          type="checkbox"
          checked={selectedProjects.length === 0}
          onChange={() => setSelectedProjects([])}
        />
        {selectedProgrammes.length === 0 ? "All Projects" : "All Projects in Selected Programmes"}
      </label>

      {/* List of projects (either everything or programme-specific) */}
      {projects.length > 0 ? (
        projects.map((proj) => (
          <label key={proj._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedProjects.includes(proj._id)}
              onChange={() =>
                setSelectedProjects((prev) =>
                  prev.includes(proj._id)
                    ? prev.filter((id) => id !== proj._id)
                    : [...prev, proj._id]
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



               <div className="relative">
  {/* TRIGGER */}
  <div
    onClick={() => setOpenUsers(!openUsers)}
    onClick={() => {
      if (!activeCategory || activeCategory === 'officer') {
        setOpenUsers(!openUsers);
        setActiveCategory('officer');
      }
    }}
    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
      activeCategory && activeCategory !== 'officer' 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
        : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
    }`}
  >
    {selectedUsers.length === 0
      ? "All Officers"
      : users
          .filter(u => selectedUsers.includes(u._id))
          .map(u => u.email)
          .join(", ")}
  </div>

  {/* DROPDOWN */}
  {openUsers && (
    <div className="
  absolute
  z-20
  bg-white
  border border-gray-100
  rounded-2xl
  mt-2
  w-full
  shadow-xl
  max-h-64
  overflow-y-auto
  p-1
">

      {/* ALL */}
      <label className="
  flex
  items-center
  gap-3
  px-3
  py-2.5
  rounded-xl
  hover:bg-blue-50
  cursor-pointer
">
        <input
          type="checkbox"
          checked={selectedUsers.length === 0}
          onChange={() => setSelectedUsers([])}
        />
        All Officers
      </label>

      {/* USERS */}
      {Array.isArray(users) &&
        users.map((u) => (
          <label key={u._id} className="
  flex
  items-center
  gap-2
  p-2
  hover:bg-gray-50
  cursor-pointer
">
            <input
              type="checkbox"
              checked={selectedUsers.includes(u._id)}
              onChange={() =>
                setSelectedUsers((prev) =>
                  prev.includes(u._id)
                    ? prev.filter((id) => id !== u._id)
                    : [...prev, u._id]
                )
              }
            />
            {u.email}
          </label>
        ))}
    </div>
    
  )}
</div>

  <div className="relative">
  {/* TRIGGER */}
  <div
    onClick={() => setOpenDzongkhags(!openDzongkhags)}
   onClick={() => {
      if (!activeCategory || activeCategory === 'dzongkhag') {
        setOpenDzongkhags(!openDzongkhags);
        setActiveCategory('dzongkhag');
      }
    }}
    className={`border px-4 h-[50px] rounded-xl flex items-center font-medium transition-all overflow-hidden ${
      activeCategory && activeCategory !== 'dzongkhag' 
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
        : "cursor-pointer bg-white text-gray-800 hover:border-blue-300 border-gray-200"
    }`}
  >
    {selectedDzongkhags.length === 0
      ? "All Dzongkhags"
      : selectedDzongkhags.join(", ")}
  </div>

  {/* DROPDOWN */}
  {openDzongkhags && (
    <div className="
  absolute
  z-20
  bg-white
  border border-gray-100
  rounded-2xl
  mt-2
  w-full
  shadow-xl
  max-h-64
  overflow-y-auto
  p-1
">
      {/* ALL SELECT */}
      <label className="flex items-center gap-2 p-2 hover:bg-gray-50 border-b cursor-pointer font-medium">
        <input
          type="checkbox"
          checked={selectedDzongkhags.length === 0}
          onChange={() => setSelectedDzongkhags([])}
        />
        All Dzongkhags
      </label>

      {/* LIST */}
      {BHUTAN_DZONGKHAGS.map((dz) => (
        <label key={dz} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedDzongkhags.includes(dz)}
            onChange={() =>
              setSelectedDzongkhags((prev) =>
                prev.includes(dz)
                  ? prev.filter((item) => item !== dz)
                  : [...prev, dz]
              )
            }
          />
          <span className="text-sm">{dz}</span>
        </label>
      ))}
    </div>
  )}
</div>


              <select
               className="
  border border-gray-200
  px-4
  h-[50px]
  rounded-xl
  bg-white
  text-gray-800
  font-medium
  outline-none
  focus:border-blue-400
"
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
            <button
              onClick={() => navigate("/reports")}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            {/* <button
              onClick={handleGenerate}
              className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg"
            >
              <Sparkles size={18} />
              Generate Report
            </button> */}
            <button
  onClick={handleGenerate}
 disabled={loading || isGenerateDisabled}
 className={`w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors ${
    loading || isGenerateDisabled
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-[#2EA1F2] text-white hover:bg-[#298CD2]"
  }`}
>
  <FileCheck size={18} />
  {loading ? "Generating..." : "Generate Report"}
</button>
          </div>
        </div>
      </div>

      </div>

      {/* ✅ SUCCESS MODAL (MATCHED SIZE & STYLE) */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
            
            {/* ICON */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="text-purple-600" size={36} />
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700">
              Report Generated Successfully
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              Your report has been generated successfully and is
              ready to view or download.
            </p>

            {/* TEXT ONLY (no button) */}
            <p
              onClick={handleDone}
              className="mt-4 text-blue-500 cursor-pointer text-sm"
            >
              Go to Reports
            </p>
          </div>
        </div>
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
        Report Generation Failed
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

export default GenerateReport;