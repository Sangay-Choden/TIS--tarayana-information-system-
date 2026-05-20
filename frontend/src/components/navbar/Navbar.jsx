import React, { useState , useEffect} from 'react';
import { useRef } from "react";
import {useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  User, 
  ChevronDown, 
  LogOut, 
  Key ,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from "jwt-decode";
import logo from "../../assets/logo.png";

const Navbar = ({ setMobileMenuOpen, userRole = "Field Officer", userName = "Phuntsho Wangmo" }) => {

const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
const [showError, setShowError] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;



  const getPageInfo = () => {
    const path = location.pathname;

    // Admin Routes
    // if (path.startsWith('/admin')) return { title: 'Admin Panel', desc: 'System management' };
    if (path.startsWith('/admin/dashboard')) return { title: 'Admin Dashboard', desc: 'Overview of all operations' };
    if (path.startsWith('/admin/programmes')) return { title: 'Programmes', desc: 'Manage programmes & projects' };
    if (path.startsWith('/admin/beneficiaries')) return { title: 'Beneficiaries', desc: 'Beneficiary records & key activities' };
    if (path.startsWith('/admin/reports')) return { title: 'Report & M&E', desc: 'Recent reports & exports' };
    if (path.startsWith('/admin/annual-events')) return { title: 'Annual Events', desc: 'Manage annual events' };
    if (path.startsWith('/admin/users')) return { title: 'User Management', desc: 'Roles & access control' };
    if (path.startsWith('/admin/settings')) return { title: 'Settings', desc: 'System preferences & configuration' };


    // Field Officer Routes
    if (path.startsWith('/fo/dashboard')) return { title: 'Dashboard', desc: 'Overview of all operations' };
    if (path.startsWith('/fo/projects/')) return { title: 'Projects', desc: 'Manage projects' };
    if (path.startsWith('/fo/projects')) return { title: 'Projects', desc: 'Manage projects' };
    if (path.startsWith('/fo/beneficiaries')) return { title: 'Beneficiaries', desc: 'Beneficiary records & households' };
    if (path.startsWith('/fo/reports')) return { title: 'Report & M&E', desc: 'Recent reports & exports' };
    // if (path.startsWith('/fo/events')) return { title: 'Annual Events', desc: 'Manage annual events' };
    
    // Programme Officer Routes
    if (path.startsWith('/po/dashboard')) return { title: 'Dashboard', desc: 'Overview of all operations' };
    if (path.startsWith('/po/programmes')) return { title: 'Programmes', desc: 'Manage programmes & projects' };
    if (path.startsWith('/po/beneficiaries')) return { title: 'Beneficiaries', desc: 'Beneficiary records & key activities' };
    if (path.startsWith('/po/reports')) return { title: 'Report & M&E', desc: 'Recent reports & exports' };
    

    
    // CD Routes
    if (path.startsWith('/cd/dashboard')) return { title: 'Dashboard', desc: 'Monitoring & Reporting, Communication & Documentation' };
    if (path.startsWith('/cd/validation-queue')) return { title: 'Validation Queue', desc: 'Key actitvity validation' };
    if (path.startsWith('/cd/reports')) return { title: 'Reports', desc: 'Recent reports & exports' };
    if (path.startsWith('/cd/archives')) return { title: 'Project Repository', desc: 'View all projects and officers' };


    
    // MR Routes
    if (path.startsWith('/mr')) return { title: 'MR Dashboard', desc: 'Monitoring & Reporting' };
    
    // Management Routes
    if (path.startsWith('/mgmt/dashboard')) return { title: 'Management Dashboard', desc: 'Strategic Overview' };
    if (path.startsWith('/mgmt/programmes')) return { title: 'Programmes', desc: 'Overview of all programmes & projects' };
    if (path.startsWith('/mgmt/reports')) return { title: 'Reports', desc: 'Recent reports & exports' };
    


    // Viewer Routes
    if (path.startsWith('/viewer')) return { title: 'Data Viewer', desc: 'Read-only access' };
    
    return { title: 'Tarayana', desc: 'Information System' };
  };

  const { title, desc } = getPageInfo();
  // State for user info from token

const [userData, setUserData] = useState({
  name: "",
  email: "",
  role: "",
  id: ""
});

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const decoded = jwtDecode(token); // ✅ ONLY defined here

    console.log("DECODED:", decoded);

    const email =
      decoded.email ||
      decoded.user?.email ||
      "";

    const name =
      decoded.name ||
      decoded.user?.name ||
      (email ? email.split("@")[0] : decoded.role || "User");

    const role =
      decoded.roleName ||
      decoded.role ||
      decoded.user?.roleName ||
      "No Role";

    setUserData({
      name,
      email: email || "No Email",
      role,
      id: decoded.id || decoded._id || ""
    });

  } catch (err) {
    console.error("Decode error:", err);
  }
}, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!currentPassword) newErrors.currentPassword = "Current password is required";
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword = "Min 8 chars, 1 letter, 1 number, 1 special char";
    }
    if (confirmPassword !== newPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- UPDATED: Handle Submit (Backend Integration) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/change-password/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();
if (!res.ok) {
  setErrorMessage(data.message || "Failed to update password");
  setShowError(true);

  setTimeout(() => {
    setShowError(false);
  }, 2500);

  return;
}

      setShowModal(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.clear();

  navigate(" ", { replace: true });

        // Optional: Logout user or redirect
      }, 2000);
   } catch (err) {
  setErrorMessage("Server error. Please try again later.");
  setShowError(true);

  setTimeout(() => {
    setShowError(false);
  }, 2500);
}
  };


const handleSignOut = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.clear();

  navigate("/auth/login", { replace: true });

  // PREVENT BACK BUTTON ACCESS
  setTimeout(() => {
    window.location.reload();
  }, 100);
};



  return (
    // <header className=" bg-[#F6F6F6] border-b border-gray-100 px-4 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-30 ">
   <header className="sticky top-0 z-[50] bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-[10px] lg:text-xs text-gray-500 uppercase tracking-wider font-medium">
            {desc}
          </p>
        </div>
      </div>
      <div className="relative">
        <button 
          className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded-xl transition-all"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        >
          <div className="text-right hidden sm:block">
  <p className="text-sm font-bold text-gray-900">
    {userData.name}
  </p>
  <p className="text-xs text-gray-500">
    {userData.role}
  </p>
</div>
          
          <ChevronDown size={16} className={cn("text-gray-400 transition-transform", profileDropdownOpen && "rotate-180")} />
        </button>

        {/* Profile Dropdown */}
        {profileDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setProfileDropdownOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[100]"
            >
                 <div className="px-4 py-3 border-b border-gray-50 mb-1">
  {/* NAME */}
  <p className="text-sm font-bold text-gray-900">
    {userData.name}
  </p>

  {/* EMAIL */}
  <p className="text-xs text-gray-500">
    {userData.email}
  </p>

  {/* ROLE */}
  <p className="text-xs text-gray-400 mt-1">
    {userData.role}
  </p>
</div>
              
              
              <button onClick={() => { setShowModal(true); setOpen(false); }}  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Key size={18} />
                <span>Change Password</span>
              </button>
              
              <div className="h-px bg-gray-50 my-1" />
              
           <button
  onClick={handleSignOut}
  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-all"
>
  <LogOut size={18} />
  <span>Sign Out</span>
</button>
            </motion.div>
          </>
        )}
      </div>
  {/* MODAL & FORM */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-3">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full md:max-w-3xl px-6 py-8 text-center">
            <img src={logo} className="w-20 mx-auto mb-3" alt="Logo" />
               <h2 className="text-xl sm:text-xl font-bold text-center text-gray-700">
          Tarayana Information System
        </h2>
             <p className="text-center text-gray-500 text-sm mt-1 mb-6 font-semibold">Change Password</p>
            
            {/* Show server-side errors (like "Incorrect old password") */}
            {/* {errors.server && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{errors.server}</p>} */}
            {showError && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="text-left space-y-4">
              <div className="relative w-[90%] mx-auto">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg  border ${errors.currentPassword ? "border-red-400" : "border-gray-300"}`}
                />
                {/* <span onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-3 cursor-pointer">
                  {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
                </span> */}
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
              </div>

              <div className="relative w-[90%] mx-auto">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg  border ${errors.newPassword ? "border-red-400" : "border-gray-300"}`}
                />
                {/* <span onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3 cursor-pointer">
                  {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                </span> */}
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>

              <div className="relative w-[90%] mx-auto">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border ${errors.confirmPassword ? "border-red-400" : "border-gray-300"}`}
                />
                {/* <span onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 cursor-pointer">
                  {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
                </span> */}
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button className="w-[90%] mx-auto block bg-[#2EA1F2] hover:bg-[#298CD2] text-white py-3 rounded-lg font-semibold mb-3 transition">
                Update Password
              </button>
              <p 
        onClick={handleSignOut}
        className="text-center text-sm text-gray-500 mt-5 cursor-pointer ">
          Forgot your Password?
        </p>
            </form>
          </div>
        </div>
      )}
      


{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Background overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

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
        Password Updated Successfully!
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        Redirecting to login page... Please log in with your new password.
      </p>

    </div>
  </div>
)}

      {/* ERROR POPUP */}
{showError && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
      <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Error Icon */}
      <div className="flex justify-center mb-5">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">

          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">

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


      {/* Animation */}
      <style>
        {`
        .animate-scaleIn {
          animation: scaleIn 0.3s ease;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        `}
      </style>

    </header>
  );
};

export default Navbar;
