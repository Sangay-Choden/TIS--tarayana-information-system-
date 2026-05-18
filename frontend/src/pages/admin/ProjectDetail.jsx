// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { FileText } from "lucide-react";

// const ProjectDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const projectData = {
//     1: {
//       name: "Climate Resilient Housing Improvement",
//       description:
//         "Improving housing resilience against climate impacts in rural communities.",
//       programme: "Social Development",
//       dzongkhag: "Trashigang",
//       duration: "1 year",
//       endDate: "Dec 31, 2025",
//       donor: "UNDP",
//       budget: "Nu. 12,000",
//     },
//   };

//   const project = projectData[id] || projectData[1];

//   // ✅ UPDATED BENEFICIARY DATA
//   const beneficiaries = [
//     {
//       cid: "11605003464",
//       name: "Phuntsho Wangmo",
//       dob: "1995-06-12",
//       dzongkhag: "Thimphu",
//       village: "Babesa",
//       gewog: "Kawang",
//       houseNo: "H12",
//       thramNo: "T45",
//       phone: "17123456",
//       project: "Housing Improvement",
//       indirect: "No",
//       support: "Built water tank",
//     },
//     {
//       cid: "11605003465",
//       name: "Tempel Gyeltshen",
//       dob: "1990-03-20",
//       dzongkhag: "Paro",
//       village: "Shaba",
//       gewog: "Shaba",
//       houseNo: "H8",
//       thramNo: "T12",
//       phone: "17654321",
//       project: "Enterprise Dev",
//       indirect: "Yes",
//       support: "Enterprise training",
//     },
//   ];

//   return (
//     <div className="space-y-6">

//           {/* BACK */}
//           <button
//             onClick={() => navigate(-1)}
//             className="text-sm text-gray-500 hover:text-black"
//           >
//             ← Back to Programme
//           </button>

//           {/* TITLE */}
//           <div className="bg-white rounded-xl p-5 shadow">
//             <h2 className="text-lg md:text-xl font-semibold">
//               {project.name}
//             </h2>
//             <p className="text-gray-500 text-sm mt-1">
//               {project.description}
//             </p>
//           </div>

//           {/* PROJECT INFO */}
//           <div className="bg-white rounded-xl p-5 shadow">
//             <h3 className="font-semibold text-gray-700 mb-4">
//               Project information
//             </h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 { label: "Programme", value: project.programme },
//                 { label: "Dzongkhag", value: project.dzongkhag },
//                 { label: "Duration", value: project.duration },
//                 { label: "End Date", value: project.endDate },
//                 { label: "Donor", value: project.donor },
//                 { label: "Budget", value: project.budget },
//               ].map((item, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border"
//                 >
//                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
//                     <FileText size={18} />
//                   </div>

//                   <div>
//                     <p className="text-xs text-gray-500">{item.label}</p>
//                     <p className="text-sm font-medium">{item.value}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* ✅ UPDATED BENEFICIARIES TABLE */}
//           <div className="bg-white rounded-xl shadow p-5">
//             <h3 className="font-semibold text-gray-700 mb-4">
//               Beneficiaries
//             </h3>

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm min-w-[1100px]">

//                 <thead>
//                   <tr className="text-gray-500 border-b text-left">
//                     <th className="py-3 px-3">CID</th>
//                     <th className="px-3">Name</th>
//                     <th className="px-3">DOB</th>
//                     <th className="px-3">Dzongkhag</th>
//                     <th className="px-3">Village</th>
//                     <th className="px-3">Gewog</th>
//                     <th className="px-3">House No</th>
//                     <th className="px-3">Thram No</th>
//                     <th className="px-3">Phone</th>
//                     <th className="px-3">Project</th>
//                     <th className="px-3">Indirect</th>
//                     <th className="px-3">Support</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {beneficiaries.map((b, index) => (
//                     <tr
//                       key={index}
//                       className="border-b hover:bg-gray-50 transition"
//                     >
//                       <td className="py-3 px-3">{b.cid}</td>
//                       <td className="px-3 font-medium whitespace-nowrap">{b.name}</td>
//                       <td className="px-3 whitespace-nowrap">{b.dob}</td>
//                       <td className="px-3">{b.dzongkhag}</td>
//                       <td className="px-3">{b.village}</td>
//                       <td className="px-3">{b.gewog}</td>
//                       <td className="px-3">{b.houseNo}</td>
//                       <td className="px-3">{b.thramNo}</td>
//                       <td className="px-3">{b.phone}</td>
//                       <td className="px-3">{b.project}</td>
//                       <td className="px-3">{b.indirect}</td>
//                       <td className="px-3">{b.support}</td>
//                     </tr>
//                   ))}
//                 </tbody>

//               </table>
//             </div>
//           </div>

//     </div>
//   );
// };

// export default ProjectDetail;






// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// // import Sidebar from "../../components/Sidebar";
// // import Navbar from "../../components/Navbar";
// import {ChevronLeft, FileText , User} from "lucide-react";

// const ProjectDetail = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [project, setProject] = useState(null);
//   const [beneficiaries, setBeneficiaries] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // =========================
//   // FETCH PROJECT
//   // =========================
//   useEffect(() => {
//     const fetchProject = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await fetch(
//           `http://localhost:5000/api/projects/summary/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const data = await res.json();
//         console.log(data)

//         if (!res.ok) {
//           console.error(data.message);
//           return;
//         }

//         setProject(data.project);
//         setBeneficiaries(data.beneficiaryList || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProject();
//   }, [id]);

//   // =========================
//   // FETCH BENEFICIARIES
//   // =========================
//   useEffect(() => {
//     const fetchBeneficiaries = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const res = await fetch(
//           `http://localhost:5000/api/beneficiaries/project/${id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const data = await res.json();
//   console.log(data)
//         if (!res.ok) return;

//         setBeneficiaries(data.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     fetchBeneficiaries();
//   }, [id]);

//   // =========================
//   // PROJECT INFO STRUCTURE
//   // =========================
// const projectInfo = [
//   { label: "Programme", value: project?.programme?.programmeName },
//   { label: "Project Name", value: project?.projectName },
//   { label: "Field Officer", value: project?.fieldOfficer?.email },
//   { label: "Start Date", value: project?.startDate },
//   { label: "End Date", value: project?.endDate },
//   { label: "Donor", value: project?.donor?.map(d => d.name).join(", ") },
//   { label: "Partner", value: project?.partner?.map(p => p.name).join(", ") },
//   { label: "Dzongkhag", value: project?.dzongkhag?.join(", ") },
// ];

//   return (
// <div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

//       {/* Main */}
// <div className="w-full ">
//   <div className="space-y-6">

//           {/* BACK BUTTON */}
//           <button
//             onClick={() => navigate(-1)}
//         className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors"
//           >
//        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
//              Back to Programme
//           </button>

//           {/* PROJECT HEADER */}
//           <div className="bg-white rounded-xl p-5 shadow">
//             <h2 className="text-lg md:text-xl font-semibold">
//               {project?.projectName }
//             </h2>
//             <p className="text-gray-500 text-sm mt-1">
//               {project?.description }
//             </p>
//           </div>

//           {/* PROJECT INFO */}
//           <div className="bg-white rounded-xl p-5 shadow">
//             <h3 className="font-semibold text-gray-700 mb-4">
//               Project information
//             </h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {projectInfo.map((item, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border"
//                 >
//                   <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
//                     <FileText size={18} />
//                   </div>

//                   <div>
//                     <p className="text-xs text-gray-500">{item.label}</p>
//                     <p className="text-sm font-medium">
//                       {item.value ?? "-"}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//     {/* BENEFICIARIES TABLE */}
// <div className="bg-white rounded-xl shadow p-5">
//   <h3 className="font-semibold text-gray-700 mb-4">
//     Beneficiaries
//   </h3>

//   <div className="overflow-x-auto">
//     <table className="w-full text-sm min-w-[1100px] border-separate border-spacing-y-2">

//       {/* HEADER */}
//       <thead>
//         <tr className="text-gray-500 text-xs uppercase tracking-wide">
//           <th className="px-3 text-left">CID</th>
//           <th className="px-3 text-left">Name</th>
//           <th className="px-3 text-left">Gender</th>
//           <th className="px-3 text-left">Dzongkhag</th>
//           <th className="px-3 text-left">Village</th>
//           <th className="px-3 text-left">Gewog</th>
//           <th className="px-3 text-left">House No</th>
//           <th className="px-3 text-left">Thram No</th>
//           <th className="px-3 text-left">Indirect</th>
//         </tr>
//       </thead>

//       {/* BODY */}
//       <tbody>
//         {beneficiaries.map((b, index) => (
//           <tr
//             key={index}
//             className="bg-gray-50 hover:bg-gray-100 transition rounded-xl"
//           >

//             {/* CID */}
//             <td className="px-3 py-3 text-blue-600 font-medium">
//               {b.cid}
//             </td>

//             {/* NAME + ICON */}
//             <td className="px-3 py-3">
//               <div className="flex items-center gap-2">
//                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
//                               <User size={14}/>
//                             </div>
//                 {b.name}
//               </div>
//             </td>

//             {/* GENDER */}
//             <td className="px-3 py-3">
//               <span className="px-2 py-1 text-xs rounded-full bg-gray-200">
//                 {b.gender === "M" ? "Male" : "Female"}

//               </span>
//             </td>

//             {/* LOCATION */}
//             <td className="px-3 py-3">{b.dzongkhag}</td>
//             <td className="px-3 py-3">{b.village}</td>
//             <td className="px-3 py-3">{b.gewog}</td>

//             {/* HOUSE / THRAM */}
//             <td className="px-3 py-3">{b.houseNo}</td>
//             <td className="px-3 py-3">{b.thramNo}</td>

//             {/* INDIRECT */}
//             <td className="px-3 py-3 text-gray-600">
//               M: {b.indirectBeneficiaries?.male ?? 0}{" "}
//               F: {b.indirectBeneficiaries?.female ?? 0}
//             </td>

//           </tr>
//         ))}
//       </tbody>

//     </table>
//   </div>
// </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetail;





import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Globe, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const InfoCard = ({ icon: Icon, label, value, valueColor = "text-sm font-bold text-gray-900" }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Icon size={24} /></div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={valueColor}>{value}</p>
    </div>
  </div>
);

// --- Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
      <div className="text-sm text-gray-500 font-medium">
        Page <span className="text-[#3498db] font-bold">{currentPage}</span> / {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border border-gray-200 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600'}`}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[#3498db] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border border-gray-200 transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-600'}`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
    const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [actPage, setActPage] = useState(1);
  const [benPage, setBenPage] = useState(1);
  const itemsPerPage = 5;

  const backPath = location.state?.from || '/po/programmes';
  const backLabel = location.state?.label || 'Back to Projects';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/summary/${id}`);
        setData(response.data);
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading detailed summary...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Project not found.</div>;

  const { project, projectSummary, geographicBreakdown, beneficiaryList } = data;

  const getDuration = (start, end) => {
    if (!start || !end) return "N/A";
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24));
    return `${Math.floor(diffDays / 30)} months, ${diffDays % 30} days`;
  };

  const indirectTotal = (projectSummary.totalIndirectMale || 0) + (projectSummary.totalIndirectFemale || 0);

  // --- Logic for Key Activities Table (Flattening & Row Spanning) ---
  const flattenedActivities = geographicBreakdown.flatMap(geo => 
    geo.activities.map(act => ({ ...act, location: geo.location }))
  );
  
  const totalActPages = Math.ceil(flattenedActivities.length / itemsPerPage);
  const currentActs = flattenedActivities.slice((actPage - 1) * itemsPerPage, actPage * itemsPerPage);

  // --- Logic for Beneficiary Table ---
  const totalBenPages = Math.ceil(beneficiaryList.length / itemsPerPage);
  const currentBens = beneficiaryList.slice((benPage - 1) * itemsPerPage, benPage * itemsPerPage);

  return (
    <div className="space-y-8 pb-10">
      {/* <button onClick={() => navigate(backPath)} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium">
        <ArrowLeft size={16} /> <span>{backLabel}</span>
      </button> */}
  <button
    onClick={() => navigate(`/${rootPath}/programmes/${project.programme?.[0]?._id || ''}`, { state: { from: location.pathname, label: 'Back to Programme' } })}
        className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    Back to projects
  </button>
      {/* Project Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">{project.description}</p>
        <div className="pt-2">
            {/* <span className="px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {project.status}
            </span> */}
             <span
  className={`
    px-2 py-1 text-[10px] font-bold rounded-xl uppercase tracking-wider
    ${
      project?.status === "Completed"
        ? "bg-[#D7FFD3] text-green-500"
        : project?.status === "Ongoing"
        ? "bg-blue-50 text-blue-600"
        : "bg-gray-100 text-gray-500"
    }
  `}
>
  {project.status}
</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard icon={FileText} label="Programme" value={project.programme?.map(p => p.programmeName).join(', ')} />
          <InfoCard icon={Users} label="Direct Beneficiaries" value={`${projectSummary.totalDirect}`} />
          <InfoCard icon={Users} label="Indirect Beneficiaries" value={`${indirectTotal} (M:${projectSummary.totalIndirectMale} F:${projectSummary.totalIndirectFemale})`} />
          <InfoCard 
  icon={Calendar} 
  label="Start Date" 
  value={
    project.startDate
      ? new Date(project.startDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A"
  } 
/>

<InfoCard 
  icon={Calendar} 
  label="End Date" 
  value={
    project.endDate
      ? new Date(project.endDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A"
  } 
/>
          <InfoCard icon={Calendar} label="Duration" value={getDuration(project.startDate, project.endDate)} />
          <InfoCard icon={Globe} label="Donor" value={project.donor?.length > 0 ? project.donor.map(d => d.name).join(', ') : "None"} />
          <InfoCard icon={Globe} label="Partner" value={project.partner?.length > 0 ? project.partner.map(p => p.name).join(', ') : "None"} />
        </div>
      </div>

      {/* Key Activities Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Key Activities Breakdown</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase">Dzongkhag</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase">Gewog</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase">Village</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase">Activity Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase text-center">Total Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase text-center">Total Capacity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase text-center">Total Beneficiary</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentActs.map((act, idx) => {
                // Show Dzongkhag only for the first occurrence in the current slice
                const isFirstDzo = idx === 0 || currentActs[idx - 1].location.dzongkhag !== act.location.dzongkhag;
                return (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {isFirstDzo ? act.location.dzongkhag : ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{act.location.gewog}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{act.location.village}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{act.activityName}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{act.displayTotal}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{act.totalCapacitySum || '-'} {act.unit}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{act.directBeneficiariesCount}</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <Pagination currentPage={actPage} totalPages={totalActPages} onPageChange={setActPage} />
        </div>
      </div>

      {/* Registered Beneficiaries Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Registered Beneficiaries</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">CID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Dzongkhag</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Gender</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Thram No</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">House No</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Village</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Gewog</th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Indirect Beneficiary</th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Intervention</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Nos</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Acres</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider text-center">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentBens.map((ben) => (
                  <tr key={ben._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{ben.cid}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{ben.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{ben.dzongkhag}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{ben.gender}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{ben.thramNo}</td>  
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{ben.houseNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{ben.village}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{ben.gewog}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-center">{ben.year}</td>

                                        
                    
                    {/* Indirect Beneficiary [Total (M:X, F:Y)] */}
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap font-medium">
                      {Number(ben.indirectBeneficiaries?.male || 0) + Number(ben.indirectBeneficiaries?.female || 0)} 
                      <span className="text-[10px] text-gray-400 ml-1">
                        [M:{ben.indirectBeneficiaries?.male || 0}, F:{ben.indirectBeneficiaries?.female || 0}]
                      </span>
                    </td>

                    {/* Intervention */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {ben.keyActivities?.map((act, i) => (
                        <div key={i} className={act.isTraining ? "text-orange-600 text-xs font-bold" : "text-xs"}>
                          {act.isTraining ? `[Training] ${act.activityName}` : act.activityName}
                        </div>
                      ))}
                    </td>

                    {/* Nos Column */}
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {ben.keyActivities?.map((act, i) => (
                        <div key={i}>{act.isTraining ? "1" : (act.unit?.toLowerCase() === 'nos' ? act.specifications?.join(", ") || act.totalQuantity : "-")}</div>
                      ))}
                    </td>

                    {/* Acres Column */}
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {ben.keyActivities?.map((act, i) => (
                        <div key={i}>{!act.isTraining && act.unit?.toLowerCase() === 'acres' ? act.specifications?.join(", ") : "-"}</div>
                      ))}
                    </td>

                    {/* Litres Column */}
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">
                      {ben.keyActivities?.map((act, i) => (
                        <div key={i}>{!act.isTraining && act.unit?.toLowerCase() === 'litres' ? act.specifications?.join(", ") : "-"}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={benPage} totalPages={totalBenPages} onPageChange={setBenPage} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;