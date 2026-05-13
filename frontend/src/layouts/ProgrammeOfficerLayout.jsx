import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import { cn } from '../lib/utils';

const ProgrammeOfficerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
       <div className="flex min-h-screen bg-gray-50 ">
      <Sidebar 
        role="Programme Officer" 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
        collapsed ? "lg:ml-[75px]" : "lg:ml-[265px]"
      )}>
        <Navbar setMobileMenuOpen={setMobileMenuOpen} userRole="Programme Officer" />
  <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProgrammeOfficerLayout;
