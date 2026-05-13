
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import { useAuth } from '../context/AuthContext';

const MrCdLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Determine sub-role (MR vs CD) based on current path prefix
  // This ensures that navigating to /mr paths shows the MR sidebar even if user object defaults to CD
  let role = user?.role || "CD Officer";
  if (location.pathname.startsWith('/mr')) {
    role = "MR Officer";
  } else if (location.pathname.startsWith('/cd')) {
    role = "CD Officer";
  }

  return (
   <div className="min-h-screen bg-gray-50">
      <Sidebar 
        role={role} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div
  className={`flex-1 transition-all duration-300 ${
    collapsed ? "lg:ml-[75px]" : "lg:ml-[265px]"
  }`}
>
        <Navbar 
          setMobileMenuOpen={setMobileMenuOpen} 
          userRole={role}
          userName={user?.name || "Pema Tshoki"}
        />
        
        <main className="p-4 lg:p-8 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MrCdLayout;
