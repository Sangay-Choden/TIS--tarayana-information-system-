import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Search, Loader2 } from "lucide-react";

const ManagementProgrammes = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Session Logic ---
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token'); // Retrieve the JWT token
  const rootPath = pathname.split('/')[1];

  useEffect(() => {
    const fetchData = async () => {
      // If no token exists, redirect to login or show error
      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Configuration for fetch with Authorization header
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

        // Check if any request returned 401 Unauthorized
        if (progRes.status === 401 || fieldOffRes.status === 401) {
             localStorage.clear();
             navigate('/login');
             return;
        }

        const progData = await progRes.json();
        const fieldOffData = await fieldOffRes.json();
        const progOffData = await progOffRes.json();

        const fetchAllProjects = async (officers, type) => {
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

        const fieldProjects = await fetchAllProjects(fieldOffData.data, "Field");
        const progProjects = await fetchAllProjects(progOffData.data, "Program");

        const combinedList = [...fieldProjects, ...progProjects];
        const uniqueMasterList = Array.from(new Map(combinedList.map(p => [p._id, p])).values());

        if (progData.programmes) {
          const mappedProgrammes = progData.programmes.map(p => {
            const progProjectCount = uniqueMasterList.filter(proj => 
               proj.programme?.some(pr => pr.programmeName === p.programmeName) || 
               proj.programme === p.programmeName ||
               proj.programme?.programmeName === p.programmeName
            ).length;

            return {
              name: p.programmeName,
              count: progProjectCount
            };
          });

          setProgrammes(mappedProgrammes);
        }

      } catch (error) {
        console.error("Aggregation Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Rest of your component UI (filteredProgrammes, return statement, etc.) remains the same
  const filteredProgrammes = programmes.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={24} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* <header className="mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Programme Overview</h1>
        <p className="text-xs sm:text-[13px] text-gray-500 font-medium">Overview of all Programmes and projects</p>
      </header> */}

      <div className="relative mb-6 w-full sm:max-w-sm">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search programmes..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredProgrammes.map((p, i) => (
          <div
            key={i}
            onClick={() => navigate(`/mgmt/programmes/${p.name}`)}
            className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border  hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-[#2EA1F2] group-hover:text-white transition-colors">
                <FileText size={18} />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tight">
                {p.count} projects
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">
              {p.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagementProgrammes;
