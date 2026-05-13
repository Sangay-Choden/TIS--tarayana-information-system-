import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Briefcase, 
  MapPin, 
  Wallet,
  FileText, ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { projectsData, programmesData, dzongkhagsData } from '../../data/mockData';

const DetailStatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const ProjectDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, id } = useParams();
     const { pathname } = useLocation();
     const rootPath = pathname.split('/')[1];
      // onClick={() => navigate(`/${rootPath}/programmes/${prog._id}`)}

  // Find the data based on type and id
  let title = "";
  let description = "";
  let stats = {
    beneficiaries: "4,294",
    projects: "12",
    dzongkhags: "15",
    budget: "Nu. 42,000"
  };

  if (type === 'programme') {
    const programme = programmesData.find(p => p.title === decodeURIComponent(id));
    title = programme?.title || id;
    description = programme?.description || "Improving living conditions through housing, WASH, food security, scholarships, and surgical camps.";
    stats.projects = programme?.count || "12";
  } else if (type === 'dzongkhag') {
    const dzongkhag = dzongkhagsData.find(d => d.name === decodeURIComponent(id));
    title = dzongkhag?.name || id;
    description = `Overview of projects and impact in ${title} region.`;
    stats.projects = dzongkhag?.count || "12";
  }

const handleProjectClick = (projectId) => {
  navigate(`/${rootPath}/projects/detail/${projectId}`, {
    state: {
      from: location.pathname,
      label: `Back to ${title}`
    }
  });
};

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(`/${rootPath}/projects`)}
                 className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to {type === 'programme' ? 'programmes' : 'dzongkhags'}</span>
      </button>

      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
          {description}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DetailStatCard 
          icon={Users} 
          label="Beneficiaries" 
          value={stats.beneficiaries} 
          colorClass="bg-blue-50 text-blue-500" 
        />
        <DetailStatCard 
          icon={Briefcase} 
          label="Projects" 
          value={stats.projects} 
          colorClass="bg-green-50 text-green-500" 
        />
        <DetailStatCard 
          icon={MapPin} 
          label="Dzongkhags" 
          value={stats.dzongkhags} 
          colorClass="bg-yellow-50 text-yellow-500" 
        />
        <DetailStatCard 
          icon={Wallet} 
          label="Budget" 
          value={stats.budget} 
          colorClass="bg-purple-50 text-purple-500" 
        />
      </div>

      {/* Projects Table Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Projects</h3>
          <p className="text-xs text-gray-400">Under this {type}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">CID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Project Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Dzongkhag</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Village</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Gewog</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projectsData.map((project, index) => (
                  <motion.tr 
                    key={project.cid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleProjectClick(project.cid)}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{project.cid}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{project.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{project.dzongkhag}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{project.village}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{project.gewog}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{project.year}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
