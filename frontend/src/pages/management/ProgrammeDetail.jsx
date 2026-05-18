// import { useState, useEffect } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { ChevronLeft, FileText, User2, Loader2 } from "lucide-react";

// const ManagementProgrammeDetail = ({ role }) => {
//   const { programmeName } = useParams();
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // --- Session Logic ---
//   const token = localStorage.getItem('token');
//   const rootPath = pathname.split('/')[1];
//   const archivesPath = `/${rootPath}/programmes`;

//   useEffect(() => {
//     const fetchProgrammeProjects = async () => {
//       // Guard: Check if token exists
//       if (!token) {
//         console.error("No authentication token found");
//         navigate('/login');
//         return;
//       }

//       setLoading(true);

//       // Standard headers for all requests
//       const fetchOptions = {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       };

//       try {
//         // 1. Fetch Officer lists
//         const [fieldOffRes, progOffRes] = await Promise.all([
//           fetch("http://localhost:5000/api/auth/feild-officers", fetchOptions),
//           fetch("http://localhost:5000/api/auth/programme-officers", fetchOptions)
//         ]);

//         // Check for session expiry (401)
//         if (fieldOffRes.status === 401 || progOffRes.status === 401) {
//           localStorage.clear();
//           navigate('/login');
//           return;
//         }

//         const fieldOffData = await fieldOffRes.json();
//         const progOffData = await progOffRes.json();

//         // 2. Fetch projects for all officers
//         const fetchAll = async (officers, type) => {
//           const results = await Promise.all(
//             (officers || []).map(async (off) => {
//               const endpoint = type === "Field" 
//                 ? `http://localhost:5000/api/projects/field-officer/${off._id}`
//                 : `http://localhost:5000/api/projects/programme-officer/${off._id}`;
              
//               const res = await fetch(endpoint, fetchOptions);
//               const json = await res.json();
//               return json.data || [];
//             })
//           );
//           return results;
//         };

//         const allProjectArrays = await Promise.all([
//           fetchAll(fieldOffData.data, "Field"),
//           fetchAll(progOffData.data, "Program")
//         ]);

//         const masterList = allProjectArrays.flat(2);

//         // 3. Filter by current Programme
//         const filtered = masterList.filter(proj => {
//           if (Array.isArray(proj.programme)) {
//             return proj.programme.some(p => p.programmeName === programmeName);
//           }
//           return proj.programme?.programmeName === programmeName || proj.programme === programmeName;
//         });

//         // Remove duplicates based on ID
//         const uniqueFiltered = Array.from(new Map(filtered.map(p => [p._id, p])).values());

//         // 4. Map to UI structure with REAL beneficiary counts
//         const mappedProjects = await Promise.all(
//           uniqueFiltered.map(async (proj) => {
//             try {
//               const summaryRes = await fetch(
//                 `http://localhost:5000/api/projects/summary/${proj._id}`,
//                 fetchOptions
//               );
//               const summaryData = await summaryRes.json();

//               return {
//                 id: proj._id,
//                 name: proj.projectName,              
//                 fo: proj.fieldOfficer?.[0]?.email
//                   ? `FO ${proj.fieldOfficer[0].email.split("@")[0]}` // Corrected Label to FO
//                   : "FO Not Assigned",
//                 count: summaryData?.beneficiaryList?.length?.toLocaleString() || "0",
//                 originalPo: proj.programmeOfficer?.email?.split("@")[0] || "",
//                 originalFo: proj.fieldOfficer?.[0]?.email?.split("@")[0] || "",
//               };
//             } catch (err) {
//               console.error("Error fetching project summary:", proj._id, err);
//               return {
//                 id: proj._id,
//                 name: proj.projectName,
//                 fo: "Error",
//                 count: "0",
//                 originalPo: "",
//                 originalFo: "",
//               };
//             }
//           })
//         );

//         setProjects(mappedProjects);
//       } catch (error) {
//         console.error("Error fetching programme projects:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProgrammeProjects();
//   }, [programmeName, token, navigate]);


//   if (loading) return (
//     <div className="flex h-64 items-center justify-center">
//       <Loader2 className="animate-spin text-blue-600" size={24} />
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       {/* BACK BUTTON */}
//       <button
//         onClick={() => navigate(archivesPath)}
//         className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm hover:text-blue-500 transition"
//       >
//         <ChevronLeft size={14} />
//         Back to programme
//       </button>

//       {/* HEADER */}
//       <div className="bg-white p-4 sm:p-5 rounded-2xl border shadow-sm flex items-start sm:items-center gap-3 sm:gap-4">
      

//         <div className="break-words">
//           <h1 className="text-sm sm:text-lg font-bold text-gray-800">
//             {programmeName}
//           </h1>
//           <p className="text-[10px] sm:text-[11px] text-gray-500">
//             {projects.length} Projects total
//           </p>
//         </div>
//       </div>

//       {/* PROJECT LIST */}
//     {/* PROJECT GRID */}
// <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//   {projects.map((proj, i) => (
//     <div
//       key={i}
//       onClick={() =>
//         navigate(`/mgmt/programmes/${programmeName}/projects/${proj.id}`, {
//           state: {
//             from: pathname,
//             label: `Back to ${programmeName} programme`,
//           },
//         })
//       }
//       className="bg-white p-5 rounded-xl border shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
//     >
//       {/* TOP */}
//       <div className="flex justify-between items-start mb-4">
//         <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#2EA1F2] group-hover:text-white transition-all shrink-0">
//           <FileText size={20} />
//         </div>

//         <div className="text-right">
//           <h2 className="text-lg font-black text-gray-800 leading-none">
//             {proj.count}
//           </h2>

//           <span className="text-[9px] font-bold text-gray-400 uppercase">
//             Beneficiaries
//           </span>
//         </div>
//       </div>

//       {/* PROJECT NAME */}
//       <div className="mb-4">
//         <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
//           {proj.name}
//         </h3>
//       </div>

//       {/* OFFICERS */}
//       <div className="flex items-center gap-2 flex-wrap">
//         <div className="flex -space-x-1.5">
//           <div className="w-5 h-5 rounded-full bg-gray-200 border flex items-center justify-center">
//             <User2 size={9} />
//           </div>

//           <div className="w-5 h-5 rounded-full bg-blue-100 border flex items-center justify-center">
//             <User2 size={9} />
//           </div>
//         </div>

//         <p className="text-[10px] font-semibold text-gray-400 uppercase flex flex-wrap gap-1">
//           <span className="hover:text-blue-600">
//             {proj.po}
//           </span>

//           <span>•</span>

//           <span className="hover:text-blue-600">
//             {proj.fo}
//           </span>
//         </p>
//       </div>
//     </div>
//   ))}
// </div>

// {/* EMPTY STATE */}
// {projects.length === 0 && (
//   <div
//     id="noProjectsFoundProgramme"
//     className="bg-white p-12 rounded-2xl border border-dashed text-center"
//   >
//     <p className="text-gray-400 text-xs">
//       No projects found for this programme.
//     </p>
//   </div>
// )}
//     </div>
//   );
// };




// export default ManagementProgrammeDetail;



import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Users, FileText, MapPin } from "lucide-react";

const ManagementProgrammeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const rootPath = pathname.split("/")[1];

  const [programme, setProgramme] = useState(null);
  const [projects, setProjects] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH PROGRAMME
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchProgramme = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/programmes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load programme");
          return;
        }

        setProgramme(data.programme);
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProgramme();
  }, [id]);

  // =========================
  // FETCH PROJECTS
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/projects/programme/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          return;
        }

        setProjects(data.projects || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, [id]);

  // =========================
  // FETCH BENEFICIARIES
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchBeneficiaries = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/beneficiaries/programme/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          return;
        }

        setBeneficiaries(data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBeneficiaries();
  }, [id]);

  const safeProjects = Array.isArray(projects) ? projects : [];

  const uniqueDzongkhags = [
    ...new Set(safeProjects.flatMap((p) => p.dzongkhag || [])),
  ];

  const dzongkhagCount = uniqueDzongkhags.length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

        {/* BACK */}
        <button
          onClick={() => navigate(`/${rootPath}/programmes`)}
          className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500"
        >
          <ChevronLeft size={16} />
          Back to programmes
        </button>

        {/* TITLE */}
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-bold">
            {programme?.programmeName}
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {programme?.programmeDescription}
          </p>
        </div>

        {/* KPI CARDS (same admin style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="bg-white rounded-xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Beneficiaries</p>
              <h2 className="text-xl font-semibold mt-2">
                {beneficiaries}
              </h2>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <h2 className="text-xl font-semibold mt-2">
                {safeProjects.length}
              </h2>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <FileText />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5 flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Dzongkhags</p>
              <h2 className="text-xl font-semibold mt-2">
                {dzongkhagCount}
              </h2>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
              <MapPin />
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow p-5">

          <h3 className="font-semibold mb-4">Projects</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">

              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-3">Project Name</th>
                  <th className="px-3">Dzongkhag</th>
                  <th className="px-3">Start</th>
                  <th className="px-3">End</th>
                  <th className="px-3">Donor</th>
                  <th className="px-3">Partner</th>
                </tr>
              </thead>

              <tbody>
                {safeProjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-400">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  safeProjects.map((p) => (
                    <tr key={p._id} className="border-b hover:bg-gray-50">

                      <td
                        onClick={() =>
                          navigate(`/${rootPath}/programmes/projects/${p._id}`)
                        }
                        className="py-3 px-3 text-blue-500 cursor-pointer"
                      >
                        {p.projectName}
                      </td>

                      <td className="px-3">
                        {p.dzongkhag?.join(", ")}
                      </td>

                      <td className="px-3">
                        {new Date(p.startDate).toLocaleDateString()}
                      </td>

                      <td className="px-3">
                        {new Date(p.endDate).toLocaleDateString()}
                      </td>

                      <td className="px-3">
                        {p.donor?.map((d) => d?.name).join(", ") || "-"}
                      </td>

                      <td className="px-3">
                        {p.partner?.map((d) => d?.name).join(", ") || "-"}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>

        </div>

      </div>
    </>
  );
};

export default ManagementProgrammeDetail;
