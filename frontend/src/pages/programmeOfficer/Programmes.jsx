import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Plus, ChevronDown, Edit2, Trash2, FileText, ArrowLeft, ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { cn } from '../../lib/utils';
import UpdateProjectModal from '../../components/modals/UpdateProjectModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import SuccessModal from '../../components/modals/SuccessModal';


const Programmes = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

  // 🔐 REAL SESSION RETRIEVAL
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  // Extract ID from the real user object
  const PO_ID = storedUser?.id || storedUser?._id;

  // 🛡️ AUTHENTICATION CHECK
  useEffect(() => {
    if (!token || !storedUser) {
      console.warn("No active session found. Redirecting to login...");
      navigate("/login", { replace: true });
    }
  }, [token, storedUser, navigate]);

  // Core Data States
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState('projects');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
  // --- API CALLS ---

  const fetchProjects = async () => {
    // Only fetch if we have both values
    if (!PO_ID || !token) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/projects/programme-officer/${PO_ID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Fixed: Using real token
          },
        }
      );

      console.log("📥 PO Projects:", response.data.data);
      setProjects(response.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching PO projects:", error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchProjects();
  }, [PO_ID, token]); // Re-run if credentials change


  const handleUpdate = async (updatedData) => {
    try {
      console.log("📤 Sending update data:", updatedData);

      const response = await axios.put(
        `${API_URL}/api/projects/update/${selectedProject._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Fixed: Using real token
          },
        }
      );

      console.log("✅ Update Response:", response.data);

      // UI updates
      setIsUpdateModalOpen(false);
      setSuccessMessage('Project Updated Successfully');
      setIsSuccessModalOpen(true);

      await fetchProjects(); // refresh list

      setTimeout(() => setIsSuccessModalOpen(false), 2000);

    } catch (error) {
      console.error("❌ Update failed:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update project");
      setShowErrorPopup(true);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/projects/${selectedProject._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Fixed: Using real token
          },
        }
      );
      setIsDeleteModalOpen(false);
      setSuccessMessage('Project Deleted Successfully');
      setIsSuccessModalOpen(true);
      fetchProjects();
      setTimeout(() => setIsSuccessModalOpen(false), 2000);
    } catch (error) {
      console.error("Delete failed:", error);
      setErrorMessage(error.response?.data?.message || "Failed to delete project");
      setShowErrorPopup(true);
    }
  };

  // --- LOGIC ---

  const handleEditClick = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteClick = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleBoxClick = (value) => {
    setSearchTerm(value);
    setLayout('projects');
  };

  const filteredProjects = projects.filter(project => {
    const search = searchTerm.toLowerCase();
    return (
      project.projectName?.toLowerCase().includes(search) ||
      project.dzongkhag?.some(d => d.toLowerCase().includes(search)) ||
      project.programme?.some(p => p.programmeName?.toLowerCase().includes(search))
    );
  });

  const programmesSummary = projects.reduce((acc, proj) => {
    if (proj.programme?.length > 0) {
      proj.programme.forEach(p => {
        const name = p.programmeName;
        if (!acc[name]) acc[name] = { name, count: 0 };
        acc[name].count++;
      });
    } else {
      if (!acc['Unassigned']) acc['Unassigned'] = { name: 'Unassigned', count: 0 };
      acc['Unassigned'].count++;
    }
    return acc;
  }, {});

  const dzongkhagsSummary = projects.reduce((acc, proj) => {
    proj.dzongkhag?.forEach(d => {
      if (!acc[d]) acc[d] = { name: d, count: 0 };
      acc[d].count++;
    });
    return acc;
  }, {});

  // Guard Clause for rendering
  if (!token || !storedUser) return null;



  return (
    <>
   <div className="w-full space-y-6 min-w-0">
      {/* Header Section */}
     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Back Arrow - Only shows if searching or not in default projects layout */}
          {(searchTerm || layout !== 'projects') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setLayout('projects');
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              title="Back to all projects"
            >
                    {/* className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors"> */}
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              {/* <ArrowLeft size={20} /> */}
            </button>
          )}

        <div>
          {/* <h1 className="text-2xl font-bold text-gray-900">Programmes</h1> */}
          {/* <p className="text-sm text-gray-500">Manage your system projects</p>
           */}
          <p className="text-md font-bold text-gray-700">
              {searchTerm ? `Showing results for "${searchTerm}"` : "Manage your system projects"}
          </p>
        </div>
      </div>

        <button 
          onClick={() => navigate('/po/programmes/add')}
          className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
   <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
           className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-gray-600 w-full sm:w-auto sm:min-w-[160px]"
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

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 animate-pulse">Fetching records...</div>
      ) : (
        <AnimatePresence mode="wait">
          {layout === 'projects' && (
           <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full"
>
              {/* RESPONSIVE TABLE WRAPPER */}
<div className="w-full max-w-full overflow-x-auto">

  <table className="w-max min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b">
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Project Name</th>
                    <th className="px-4 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Dzongkhag</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Programme</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">Field Officer</th>
                    {/* <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">End Date</th> */}
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
                  </tr> 
                </thead>
                <tbody className="divide-y divide-gray-50 text-[13px]">
                  {filteredProjects.map((project) => (
                    <tr 
                      key={project._id} 
                      onClick={() => navigate(`/po/programmes/detail/${project._id}`)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-4 text-gray-900 whitespace-nowrap">{project.projectName}</td>
                      <td className="px-6 py-4 text-gray-900">{project.dzongkhag?.join(', ')}</td>
                      <td className="px-6 py-4 text-gray-900">{project.programme?.map(p => p.programmeName).join(', ')}</td>
                      <td className="px-6 py-4 text-gray-900">{project.fieldOfficer?.map(f => f.email).join(', ') }</td>
                      {/* <td className="px-6 py-4 text-gray-900">{new Date(project.endDate).toLocaleDateString()}</td> */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button 
                          onClick={(e) => handleEditClick(e, project)} 
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors shadow-sm"
                          title="Edit Project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteClick(e, project)} 
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shadow-sm"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {filteredProjects.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm">No projects found matching your criteria.</div>
              )}
            </motion.div>
          )}

          {(layout === 'programmes' || layout === 'dzongkhags') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                                    <span
className="text-[9px] sm:text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tightext-xs bg-gray-100 px-2 py-1 rounded"
>
  {item.count} {item.count === 1 ? "project" : "projects"}
</span>
                  </div>

                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">{item.name}</h3>
                  </div>





//        <div className="flex justify-between items-center mb-4">
//                   <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-[#2EA1F2] group-hover:text-white transition-colors">
//                     <FileText />
//                   </div>
//                   <span className="text-[9px] sm:text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tightext-xs bg-gray-100 px-2 py-1 rounded">
//   {prog.projectCount || 0} projects
// </span>
//                 </div>

//                 <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">
//                   {prog.programmeName}
//                 </h3>


              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      </div>

      {/* Modals */}
      <UpdateProjectModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
        project={selectedProject} 
        onUpdate={handleUpdate} 
      />
      {/* <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDelete} 
        title="Delete Project?" 
        description="This will permanently remove the project from the database."
      /> */}


{isDeleteModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow">
      
      <h2 className="text-lg font-semibold mb-2">
        Delete Project?
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Are you sure you want to delete this project?
        This action is permanent and cannot be undone.
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-[#AA3333] text-white rounded-lg"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
)}


      {/* <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        message={successMessage} 
      /> */}

{/* SUCCESS */}
{isSuccessModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Background overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Popup Card */}
 {/* Popup Card */}
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
                className="tick-path"
              />
            </svg>
          </div>

        </div>
      </div>

      {/* Text */}
   <h2 className="text-xl font-semibold text-gray-700">
  {successMessage}
</h2>

      {/* <p className="text-gray-500 mt-2 text-sm">
        The event has been successfully created.
      </p> */}

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
       Action Failed
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

export default Programmes;