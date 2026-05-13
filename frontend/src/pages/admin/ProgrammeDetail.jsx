// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Users, FileText, MapPin, BarChart3 } from "lucide-react";

// const ProgrammeDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   // Programme Names
//   const programmeNames = {
//     1: "Social Development",
//     2: "Economic Development",
//     3: "Environment & Climate",
//   };

//   // ✅ UPDATED DUMMY PROJECT DATA (REALISTIC)
//   const projectsData = [
//     {
//       id: 1,
//       name: "Housing Improvement Project",
//       dzongkhag: "Thimphu",
//       startDate: "2023-01-10",
//       endDate: "2023-12-30",
//       donor: "UNDP",
//       partner: "MoWHS",
//     },
//     {
//       id: 2,
//       name: "Enterprise Development Program",
//       dzongkhag: "Paro",
//       startDate: "2022-03-15",
//       endDate: "2024-06-20",
//       donor: "World Bank",
//       partner: "MoEA",
//     },
//     {
//       id: 3,
//       name: "WASH Improvement Initiative",
//       dzongkhag: "Punakha",
//       startDate: "2021-07-01",
//       endDate: "2023-09-10",
//       donor: "UNICEF",
//       partner: "MoH",
//     },
//     {
//       id: 4,
//       name: "Climate Resilience Project",
//       dzongkhag: "Bumthang",
//       startDate: "2022-05-10",
//       endDate: "2025-01-15",
//       donor: "ADB",
//       partner: "NEC",
//     },
//   ];

//   return (
//     <div className="space-y-6">

//           {/* BACK */}
//           <button
//             onClick={() => navigate("/programmes")}
//             className="text-sm text-gray-500 hover:text-black"
//           >
//             ← Back to programmes
//           </button>

//           {/* TITLE */}
//           <div>
//             <h2 className="text-xl md:text-2xl font-semibold">
//               {programmeNames[id] || "Programme"}
//             </h2>
//             <p className="text-gray-500 text-sm mt-1 max-w-xl">
//               Improving living conditions through housing, WASH, food security,
//               scholarships, and development programs.
//             </p>
//           </div>

//           {/* KPI CARDS */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//             {[
//               {
//                 title: "Beneficiaries",
//                 value: "4,294",
//                 icon: <Users />,
//                 color: "bg-blue-100 text-blue-600",
//               },
//               {
//                 title: "Projects",
//                 value: projectsData.length,
//                 icon: <FileText />,
//                 color: "bg-green-100 text-green-600",
//               },
//               {
//                 title: "Dzongkhags",
//                 value: "15",
//                 icon: <MapPin />,
//                 color: "bg-yellow-100 text-yellow-600",
//               },
//               {
//                 title: "Budget",
//                 value: "Nu. 42,000",
//                 icon: <BarChart3 />,
//                 color: "bg-purple-100 text-purple-600",
//               },
//             ].map((item, i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-xl shadow p-4 md:p-5 flex justify-between items-center hover:shadow-lg transition"
//               >
//                 <div>
//                   <p className="text-sm text-gray-500">{item.title}</p>
//                   <h2 className="text-lg md:text-xl font-semibold mt-2">
//                     {item.value}
//                   </h2>
//                 </div>
//                 <div className={`p-3 rounded-lg ${item.color}`}>
//                   {item.icon}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* PROJECT TABLE */}
//           <div className="bg-white rounded-xl shadow p-4 md:p-5">

//             <h3 className="font-semibold text-gray-700 mb-4">
//               Projects
//             </h3>

//             {/* ✅ RESPONSIVE TABLE WRAPPER */}
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm min-w-[700px]">

//                 <thead>
//                   <tr className="text-gray-500 border-b text-left">
//                     <th className="py-3 px-3">Project Name</th>
//                     <th className="px-3">Dzongkhag</th>
//                     <th className="px-3">Start Date</th>
//                     <th className="px-3">End Date</th>
//                     <th className="px-3">Donor</th>
//                     <th className="px-3">Partner</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {projectsData.map((p) => (
//                     <tr
//                       key={p.id}
//                       className="border-b hover:bg-gray-50 transition"
//                     >
//                       {/* CLICKABLE NAME */}
//                       <td
//                         onClick={() => navigate(`/projects/${p.id}`)}
//                         className="py-3 px-3 text-blue-600 cursor-pointer hover:underline font-medium"
//                       >
//                         {p.name}
//                       </td>

//                       <td className="px-3">{p.dzongkhag}</td>
//                       <td className="px-3">{p.startDate}</td>
//                       <td className="px-3">{p.endDate}</td>
//                       <td className="px-3">{p.donor}</td>
//                       <td className="px-3">{p.partner}</td>
//                     </tr>
//                   ))}
//                 </tbody>

//               </table>
//             </div>
//           </div>

//     </div>
//   );
// };

// export default ProgrammeDetail;





import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import Navbar from "../../components/Navbar";
import { ChevronLeft,Users, FileText, MapPin, BarChart3, Pencil, Trash2, X } from "lucide-react";
import { useEffect } from "react";

const ProgrammeDetail = () => {
  const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

  const [collapsed, setCollapsed] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
const [projects, setProjects] = useState([]);
const [Beneficiaries, setBeneficiaries] = useState(0);

  const [programme, setProgramme] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
const [editProgrammeName, setEditProgrammeName] = useState("");
const [editProgrammeDescription, setEditProgrammeDescription] = useState("");
const [showEditSuccess, setShowEditSuccess] = useState(false);


    const [deleteItem, setDeleteItem] = useState(null);
const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
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

    setProjects(data.projects);

  } catch (err) {
    console.error(err);
  }
};
console.log("Projects:", projects);
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

     setBeneficiaries(data.count);

  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  fetchProjects(); 
   fetchBeneficiaries();
}, [id]);


console.log("Beneficiaries:", Beneficiaries);

// const uniqueDzongkhags = [
//   ...new Set(
//     projects.flatMap((p) => p.dzongkhag || [])
//   ),
// ];

const safeProjects = Array.isArray(projects) ? projects : [];

const uniqueDzongkhags = [
  ...new Set(
    safeProjects.flatMap(p => p.dzongkhag || [])
  )
];

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/programmes/${deleteItem._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message);
    }

    setDeleteItem(null);

    // SHOW SUCCESS POPUP
    setShowDeleteSuccess(true);

    // NAVIGATE AFTER 2s
    setTimeout(() => {
      setShowDeleteSuccess(false);
      navigate(`/${rootPath}/programmes`);
    }, 2000);

  } catch (error) {
    console.error(error);
  }
};


const handleUpdateProgramme = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/programmes/${programme._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      body: JSON.stringify({
  programmeName: editProgrammeName,
  programmeDescription: editProgrammeDescription,
}),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message);
    }

    setProgramme((prev) => ({
  ...prev,
  programmeName: editProgrammeName,
  programmeDescription: editProgrammeDescription,
}));

    setShowEditModal(false);

    // SUCCESS POPUP
    setShowEditSuccess(true);

    setTimeout(() => {
      setShowEditSuccess(false);
    }, 2000);

  } catch (err) {
    console.error(err);
  }
};


const dzongkhagCount = uniqueDzongkhags.length;

return (
  <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

          {/* BACK */}
          {/* <button
            onClick={() => navigate("/programmes")}
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to programmes
          </button>
          
   */}

   {/* BACK + ACTIONS */}
<div className="flex justify-between items-center">
  {/* LEFT: Back */}
  <button
    onClick={() => navigate(`/${rootPath}/programmes`)}
        className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    Back to programmes
  </button>

  {/* RIGHT: Edit + Delete */}
  <div className="flex items-center">
    {/* Edit */}
<button
  className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"
  title="Edit Programme"
  onClick={() => {
   setEditProgrammeName(programme?.programmeName || "");
setEditProgrammeDescription(programme?.programmeDescription || "");
    setShowEditModal(true);
  }}
>
  <Pencil size={17} />
</button>

    {/* Delete */}
    <button
      className="p-2 rounded-lg hover:bg-red-100 text-[#AA3333] "
      title="Delete Programme"
      onClick={() => console.log("Delete")}
    >
      <Trash2 size={17}  onClick={() => setDeleteItem(programme)} />
    </button>
  </div>
</div>
          {/* TITLE */}
       <div className="w-full max-w-4xl">
            <h2 className="text-xl md:text-xl font-bold">
              {programme?.programmeName }
            </h2>
            <p className="text-gray-500 text-sm mt-1 max-w-5xl">
              {programme?.programmeDescription}
            </p>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                title: "Beneficiaries",
               value: Beneficiaries || 0,
                icon: <Users />,
                color: "bg-blue-100 text-blue-600",
              },
              {
                title: "Projects",
                value: projects?.length || 0,
                icon: <FileText />,
                color: "bg-green-100 text-green-600",
              },
              {
                title: "Dzongkhags",
                value: dzongkhagCount,
                icon: <MapPin />,
                color: "bg-yellow-100 text-yellow-600",
              },
              // {
              //   title: "Budget",
              //   value: "Nu. 42,000",
              //   icon: <BarChart3 />,
              //   color: "bg-purple-100 text-purple-600",
              // },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow p-4 md:p-5 flex justify-between items-center hover:shadow-lg transition"
              >
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <h2 className="text-lg md:text-xl font-semibold mt-2">
                    {item.value}
                  </h2>
                </div>
                <div className={`p-3 rounded-lg ${item.color}`}>
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          {/* PROJECT TABLE */}
          <div className="bg-white rounded-xl shadow p-4 md:p-5">

            <h3 className="font-semibold text-gray-700 mb-4">
              Projects
            </h3>

            {/* ✅ RESPONSIVE TABLE WRAPPER */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">

                <thead>
                  <tr className="text-gray-700 border-b text-left">
                    <th className="py-3 px-3">Project Name</th>
                    <th className="px-3">Dzongkhag</th>
                    <th className="px-3">Start Date</th>
                    <th className="px-3">End Date</th>
                    <th className="px-3">Donor</th>
                    <th className="px-3">Partner</th>
                  </tr>
                </thead>
<tbody>
{(projects?.length || 0) === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-6 text-gray-400">
        No projects found
      </td>
    </tr>
  ) : (
    projects.map((p) => (
     
      <tr
        key={p._id}
        className="border-b hover:bg-gray-50 transition"
      >
        <td
          onClick={() => navigate(`/${rootPath}/programmes/projects/${p._id}`)}
          className="py-3 px-3 text-[#2EA1F2] hover:text-[#1D7BC1] cursor-pointer font-medium"
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
  {Array.isArray(p.donor) && p.donor.length > 0
    ? p.donor
        .map((d) => d?.name)
        .filter(Boolean)
        .join(", ")
    : "-"}
</td>

<td className="px-3">
  {Array.isArray(p.partner) && p.partner.length > 0
    ? p.partner
        .map((part) => part?.name)
        .filter(Boolean)
        .join(", ")
    : "-"}
</td>
      </tr>
    )
  )
  )}
</tbody>
              

              </table>
            </div>
          </div>

        </div>
      </div>

</div>
            {/* DELETE MODAL */}
      {deleteItem !== null && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow">
            <h2 className="text-lg font-semibold mb-2">Delete Programme?</h2>
            <p className="text-gray-500 text-sm mb-6">
             Are you sure you want to delete this programme? This action is permanent and cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
               onClick={confirmDelete}
                className="px-4 py-2 bg-[#AA3333] text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

{showDeleteSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
     <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Circle + Tick */}
      <div className="flex items-center justify-center mb-6">

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pop">

          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">

            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>
        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-xl font-semibold text-gray-700">
        Deleted Successfully
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        The programme has been deleted successfully.
      </p>

    </div>
  </div>
)}


{showEditModal && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-3">

    <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-2xl animate-popup">
    <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-gray-500"
            >
              <X />
            </button>
      {/* TITLE */}
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        Edit Programme
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Update the programme information below.
      </p>

      {/* PROGRAMME NAME */}
      <div className="mb-5">
        <label className="text-sm font-medium text-gray-600 block mb-2">
          Programme Name
        </label>

        <input
          type="text"
          value={editProgrammeName}
          onChange={(e) => setEditProgrammeName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#2EA1F2]"
          placeholder="Enter programme name"
        />
      </div>

      {/* DESCRIPTION */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-600 block mb-2">
          Programme Description
        </label>

        <textarea
          rows={4}
          value={editProgrammeDescription}
          onChange={(e) => setEditProgrammeDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-[#2EA1F2]"
          placeholder="Enter programme description"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">

        <button
          onClick={() => setShowEditModal(false)}
          className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateProgramme}
          className="px-5 py-2 bg-[#2EA1F2] hover:bg-[#1D7BC1] text-white font-semibold rounded-lg transition"
        >
          Save Changes
        </button>

      </div>
    </div>
  </div>
)}

{showEditSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
    <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Icon */}
      <div className="flex items-center justify-center mb-6">

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">

          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">

            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>
        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-xl font-semibold text-gray-700">
        Updated Successfully
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        The programme information has been updated successfully.
      </p>

    </div>
  </div>
)}


   </>
  );
};

export default ProgrammeDetail;