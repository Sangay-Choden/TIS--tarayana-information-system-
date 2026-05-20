import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Calendar, Globe, Users, ChevronLeft, ChevronRight } from 'lucide-react';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { projectsData, beneficiariesData } from '../../data/mockData';


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

const SpecificProjectDetail = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

const { pathname } = useLocation();
const rootPath = pathname.split('/')[1];
  // Pagination States
  const [actPage, setActPage] = useState(1);
  const [benPage, setBenPage] = useState(1);
  const itemsPerPage = 5;

const backPath = location.state?.from || '/projects';
  const backLabel = location.state?.label || 'Back to Projects';

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/projects/summary/${id}`);
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
      <button onClick={() => navigate(`/${rootPath}/projects`)}
              className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
     <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
         <span>{backLabel}</span>
      </button>

      {/* Project Header */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">{project.description}</p>
        <div className="pt-2">
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
            <thead className="bg-gray-200/50">
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
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{act.activityName}</td>
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
              <thead className="bg-gray-200/50">
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


export default SpecificProjectDetail;
