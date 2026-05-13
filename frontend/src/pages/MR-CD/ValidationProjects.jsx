import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, User2, Loader2, ChevronLeft } from "lucide-react";

const ValidationProjects = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { programme } = useParams();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Session & Auth Logic ---
  const token = localStorage.getItem('token');
  const rootPath = pathname.split('/')[1];

  useEffect(() => {
    const fetchProgrammeProjects = async () => {
      // Guard: No token found
      if (!token) {
        console.error("No authentication token found");
        navigate('/login');
        return;
      }

      setLoading(true);

      // Standard headers for all requests
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        // 1. Fetch Officer lists
        const [fieldOffRes, progOffRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/feild-officers", fetchOptions),
          fetch("http://localhost:5000/api/auth/programme-officers", fetchOptions)
        ]);

        // Catch expired session
        if (fieldOffRes.status === 401 || progOffRes.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        const fieldOffData = await fieldOffRes.json();
        const progOffData = await progOffRes.json();

        // 2. Fetch projects for all officers
        const fetchAll = async (officers, type) => {
          const results = await Promise.all(
            (officers || []).map(async (off) => {
              const endpoint = type === "Field" 
                ? `http://localhost:5000/api/projects/field-officer/${off._id}`
                : `http://localhost:5000/api/projects/programme-officer/${off._id}`;
              
              const res = await fetch(endpoint, fetchOptions);
              const json = await res.json();
              return json.data || [];
            })
          );
          return results.flat();
        };

        const fieldProjects = await fetchAll(fieldOffData.data, "Field");
        const progProjects = await fetchAll(progOffData.data, "Program");
        const masterList = [...fieldProjects, ...progProjects];

        // 3. Filter by the current Programme Name
        const filtered = masterList.filter(proj => {
          if (Array.isArray(proj.programme)) {
            return proj.programme.some(p => p.programmeName === programme);
          }
          return proj.programme?.programmeName === programme || proj.programme === programme;
        });

        // Remove duplicates
        const uniqueFiltered = Array.from(new Map(filtered.map(item => [item._id, item])).values());

        // 4. Map and fetch summary for each project
        const mappedProjects = await Promise.all(
          uniqueFiltered.map(async (proj) => {
            try {
              const summaryRes = await fetch(`http://localhost:5000/api/projects/summary/${proj._id}`, fetchOptions);
              const summaryData = await summaryRes.json();
              
              return {
                id: proj._id,
                name: proj.projectName,
                status: proj.status,              
                fo: proj.fieldOfficer?.[0]?.email
                  ? `FO ${proj.fieldOfficer[0].email.split("@")[0]}`
                  : "FO Not Assigned",
                count: summaryData?.beneficiaryList?.length?.toLocaleString() || "0",
              };
            } catch (err) {
              console.error("Error fetching summary:", err);
              return null;
            }
          })
        );

        setProjects(mappedProjects.filter(p => p !== null));
      } catch (error) {
        console.error("Error fetching validation projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammeProjects();
  }, [programme, token, navigate]);


  
  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={24} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
      className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Programme
      </button>

      {/* HEADER */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 mb-6">
       

        <div className="break-words">
          <h2 className="text-sm sm:text-lg font-bold text-gray-800">
            {programme}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-gray-500">
            {projects.length} Projects for Validation
          </p>
        </div>
      </div>

    {/* PROJECT GRID */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
  {projects.map((p, i) => (
    <div
      key={p.id}
      onClick={() => navigate(`/${rootPath}/validation-queue/project/${p.id}`)}
      className="bg-white p-5 rounded-xl border shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
    >
      {/* TOP */}
      <div className="flex justify-between items-start mb-4">
        <div
          className="
            w-12 h-12
            bg-blue-50
            text-[#2EA1F2]
            rounded-xl
            flex items-center justify-center
            group-hover:bg-[#2EA1F2]
            group-hover:text-white
            transition-all
            shrink-0
          "
        >
          <FileText size={24} />
        </div>

        <div className="text-right">
          <h2 className="text-lg font-black text-gray-800 leading-none">
            {p.count}
          </h2>
          <span className="text-[9px] font-bold text-gray-400 uppercase">
            Beneficiaries
          </span>
        </div>
      </div>

      {/* PROJECT NAME */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
          {p.name}
        </h3>
      </div>

      {/* STATUS */}
      <div className="mb-4">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            p.status?.toLowerCase() === "ongoing"
              ? "bg-blue-100 text-blue-600"
              : "bg-[#D7FFD3] text-green-500"
          }`}
        >
          {p.status}
        </span>
      </div>

      {/* OFFICERS */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-200 border flex items-center justify-center">
            <User2 size={9} />
          </div>

          <div className="w-5 h-5 rounded-full bg-blue-100 border flex items-center justify-center">
            <User2 size={9} />
          </div>
        </div>

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight flex flex-wrap gap-1">
          <span>{p.po}</span>
          <span>•</span>
          <span>{p.fo}</span>
        </p>
      </div>
    </div>
  ))}
</div>
{/* EMPTY STATE */}
{projects.length === 0 && (
  <div
    id="noProjectsFoundProgramme"
    className="bg-white p-12 rounded-2xl border border-dashed text-center"
  >
    <p className="text-gray-400 text-xs">
      No projects found for this programme.
    </p>
  </div>
)}
    </div>
  );
};

export default ValidationProjects;