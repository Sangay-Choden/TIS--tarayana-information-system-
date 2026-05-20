import { useState } from "react";
import logo from "../../assets/logo.png";
import {
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { menuConfigs } from "./sidebarConfig";
import SidebarItem from "./SidebarItem";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role = 'Field Officer', collapsed, setCollapsed, mobileMenuOpen, setMobileMenuOpen }) => {
  const menuItems = menuConfigs[role] || menuConfigs['Field Officer'];

  const navigate = useNavigate();

const handleSignOut = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  sessionStorage.clear();

  navigate(" ", { replace: true });

  // PREVENT BACK BUTTON ACCESS
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

  return (
    <div>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-[70] h-screen bg-[#1E1E1E] text-white 
        transition-all duration-300
        ${collapsed ? "w-[75px]" : "w-[265px]"} 
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
          <img
            src={logo}
            alt="logo"
            className={`rounded-full transition-all duration-300 
             ${collapsed ? "w-11 h-9 mx-auto" : "w-14 h-14"}`}
          />

          {!collapsed && (
            <div className="leading-tight">
              <h1 className="text-[20px] font-bold">Tarayana</h1>
              <p className="text-[15px] text-gray-400">
                Information System
              </p>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="flex-1 mt-4 space-y-1 px-2">
          {menuItems.map((item, index) => (
            <SidebarItem key={index} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-700 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-all duration-300">
            <LogOut size={18} className="text-red-400"   onClick={handleSignOut}  />
            {!collapsed && (
              <span
                  onClick={handleSignOut}
                className="text-red-400"
              >
                Sign Out
              </span>
            )}
          </div>

          <div
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-all duration-300"
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
            {!collapsed && <span>Collapse</span>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;