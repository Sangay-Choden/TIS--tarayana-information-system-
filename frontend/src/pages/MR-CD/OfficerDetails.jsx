import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Filter, Layers, Mail, UserCircle2, Loader2 } from "lucide-react";

const OfficerDetails = () => {
  const [selectedYear, setSelectedYear] = useState("All");
  const [recordsByYear, setRecordsByYear] = useState({});
  const [loading, setLoading] = useState(true);

  const { officerId } = useParams();
  const navigate = useNavigate();
  const { pathname, state } = useLocation();

  const token = localStorage.getItem('token');
  const rootPath = pathname.split("/")[1];
  const archivesPath = `/${rootPath}/archives`;

  // Display name from state (passed during navigate) or fallback to ID
  const displayName = state?.officerName || officerId;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      // 1. Anti-500 Guard: Ensure ID is a valid MongoDB ObjectId (24 chars hex)
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

        // 2. Fetch from BOTH endpoints in parallel to cover all roles
        const [poProjects, foProjects] = await Promise.all([
          safeFetch(`http://localhost:5000/api/projects/programme-officer/${officerId}`),
          safeFetch(`http://localhost:5000/api/projects/field-officer/${officerId}`)
        ]);

        if (poProjects === null || foProjects === null) return;

        // Combine and deduplicate projects by _id
        const combined = [...poProjects, ...foProjects];
        const uniqueProjects = Array.from(new Map(combined.map(p => [p._id, p])).values());

        const grouped = uniqueProjects.reduce((acc, proj) => {
  // Helper to format date: "2026-04-10T00:00:00.000Z" -> "2026-04-10"
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
          // Apply formatting here
          STARTDATE: formatDate(proj.startDate),
          ENDDATE: formatDate(proj.endDate),
          STATUS: proj.status || "N/A",
          YEAR: year
        });

        return acc;
      }, {});

        setRecordsByYear(grouped);
        console.log(grouped)
      } catch (err) {
        console.error("Fatal error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [officerId, token, navigate]);

  const years = Object.keys(recordsByYear);
  const currentRecords = selectedYear === "All" 
    ? Object.values(recordsByYear).flat() 
    : recordsByYear[selectedYear] || [];

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-400">
      <Loader2 className="animate-spin mr-2" size={20} /> Loading projects...
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(archivesPath)} className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
       <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
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

      <section className="flex justify-start">
        <div className="relative">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="pl-12 pr-12 py-3 text-sm font-bold text-gray-600 border border-gray-200 rounded-2xl bg-white outline-none cursor-pointer appearance-none shadow-sm">
            <option value="All">All Years</option>
            {years.sort((a,b) => b-a).map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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

              <th className="px-6 py-5 text-right">Year</th>
              <th className="px-6 py-5">Status</th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentRecords.map((record, i) => (
              <tr key={i} onClick={() => navigate(`/${archivesPath}/programme/view/project/${record.id}`)} className="hover:bg-blue-50/40 cursor-pointer transition-colors group">
                <td className="px-6 py-4 font-bold text-gray-800">{record.PROJECTNAME}</td>
                <td className="px-6 py-4 text-gray-500 font-medium">{record.DZONGKHAG}</td>
                <td className="px-6 py-4 text-gray-500 font-medium">{record.STARTDATE}</td>
                <td className="px-6 py-4 text-gray-500 font-medium">{record.ENDDATE}</td>

                <td className="px-6 py-4 text-right text-gray-400 font-bold">{record.YEAR}</td>
                {/* <td className="px-6 py-4 text-gray-500 font-medium">{record.STATUS}</td> */}
                <td className="px-6 py-4">

  <span
    className={`
      px-2 py-0.5 text-[10px] font-bold rounded-xl uppercase tracking-wider

      ${
        record.STATUS === "Completed"
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

  </div>

{currentRecords.length === 0 && (
          <div className="p-16 text-center text-gray-400 text-xs font-medium">No projects found for this officer.</div>
        )}
      </section>
    </div>
  );
};

export default OfficerDetails;