import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, ChevronDown, FileText, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { cn } from '../../lib/utils';

const Projects = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
   const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];
    // onClick={() => navigate(`/${rootPath}/programmes/${prog._id}`)}
  // 🔐 SESSION RETRIEVAL
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const USER_ID = storedUser?.id || storedUser?._id;

  // 🛡️ AUTH CHECK
  useEffect(() => {
    if (!token || !storedUser) {
      navigate("/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  // States
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('projects'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProjects = async () => {
    if (!USER_ID || !token) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/projects/field-officer/${USER_ID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(response.data.data || []);
      console.log(response.data.data)
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [USER_ID, token]);

  const handleBoxClick = (value) => {
    setSearchTerm(value);
    setLayout('projects');
  };

  // --- FILTERING LOGIC ---
  const filteredProjects = projects.filter(project => {
    const search = searchTerm.toLowerCase();
    return (
      project.projectName?.toLowerCase().includes(search) ||
      project.dzongkhag?.some(d => d.toLowerCase().includes(search)) ||
      project.programme?.some(p => p.programmeName?.toLowerCase().includes(search)) ||
      project.programmeOfficer?.email?.toLowerCase().includes(search)
    );
  });

  // Summaries derived from filteredProjects so they update during search
  const programmesSummary = filteredProjects.reduce((acc, proj) => {
    proj.programme?.forEach(p => {
      const name = p.programmeName;
      if (!acc[name]) acc[name] = { name, count: 0 };
      acc[name].count++;
    });
    return acc;
  }, {});

  const dzongkhagsSummary = filteredProjects.reduce((acc, proj) => {
    proj.dzongkhag?.forEach(d => {
      if (!acc[d]) acc[d] = { name: d, count: 0 };
      acc[d].count++;
    });
    return acc;
  }, {});

  if (!token || !storedUser) return null;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {(searchTerm || layout !== 'projects') && (
            <button 
              onClick={() => { setSearchTerm(''); setLayout('projects'); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {/* <div>
            <h1 className="text-2xl font-bold text-gray-900">Assigned Projects</h1>
            <p className="text-sm text-gray-500">View and monitor your active project assignments</p>
          </div> */}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search projects, officers, or locations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-gray-600 min-w-[160px]"
          >
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <span className="text-sm font-medium capitalize">{layout}</span>
            </div>
            <ChevronDown className={cn("transition-transform", isDropdownOpen && "rotate-180")} size={16} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-2 w-full bg-white border rounded-xl shadow-xl z-20 overflow-hidden">
                {['projects', 'programmes', 'dzongkhags'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setLayout(opt); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 capitalize font-medium text-gray-600"
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse">Loading records...</div>
      ) : (
        <AnimatePresence mode="wait">
          {layout === 'projects' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider">Project Name</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider">Dzongkhag</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider">Programme</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider">Field Officer</th>

                      <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider text-blue-600">Programme Officer</th>
                      {/* <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider">End Date</th> */}
                    </tr> 
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-[13px]">
                    {filteredProjects.map((project) => (
                      <tr 
                        key={project._id} 
                        onClick={() => navigate(`/${rootPath}/projects/detail/${project._id}`)}
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-gray-900">{project.projectName}</td>
                        <td className="px-6 py-4 text-gray-600">{project.dzongkhag?.join(', ')}</td>
                        <td className="px-6 py-4 text-gray-600">{project.programme?.map(p => p.programmeName).join(', ')}</td>
                        <td className="px-6 py-4 text-gray-900">{project.fieldOfficer?.map(f => f.email).join(', ') }</td>

                        <td className="px-6 py-4 font-medium text-blue-700">
                          {typeof project.programmeOfficer === 'object' 
                                ? project.programmeOfficer.email 
                                : `ID: ${project.programmeOfficer?.substring(0, 8)}...`}
                        </td>
                        {/* <td className="px-6 py-4 text-gray-600">{new Date(project.endDate).toLocaleDateString()}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProjects.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm">No assigned projects found.</div>
              )}
            </motion.div>
          )}

          {(layout === 'programmes' || layout === 'dzongkhags') && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Check if the selected summary has any data */}
            {Object.values(layout === 'programmes' ? programmesSummary : dzongkhagsSummary).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(layout === 'programmes' ? programmesSummary : dzongkhagsSummary).map((item) => (
                  <div 
                    key={item.name}
                    onClick={() => handleBoxClick(item.name)}
                     className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border hover:border-blue-200 transition-all cursor-pointer group"
                  >
                   <div className="flex justify-between items-center mb-4">
                       <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-[#2EA1F2] group-hover:text-white transition-colors">
                      <FileText />
                   </div>
                        <span className="text-[9px] sm:text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tightext-xs bg-gray-100 px-2 py-1 rounded">
                      {item.count} project{item.count > 1 ? 's' : ''}
                    </span>
                  </div>
                      <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">{item.name}</h3>
                    </div>


                ))}
              </div>
            ) : (
              /* This is the "No projects found" message for the grid view */
              <div className="py-20 text-center text-gray-400 text-sm bg-white rounded-xl border border-dashed">
                No {layout} found matching your search.
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Projects;