import React from 'react';
import {
  LayoutGrid,
  FileText,
  Users,
  BarChart3,
  Calendar,
  UserCog,
  Settings,
  Shield,
  ClipboardList,
  PieChart,
  Archive
} from "lucide-react";

export const menuConfigs = {

  'Field Officer': [
    { name: "Dashboard", path: "/fo/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Projects", path: "/fo/projects", icon: <FileText size={20} /> },
    { name: "Beneficiaries", path: "/fo/beneficiaries", icon: <Users size={20} /> },
    { name: "Reports", path: "/fo/reports", icon: <BarChart3 size={20} /> },
   
  ],
  'Programme Officer': [
    { name: "Dashboard", path: "/po/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Programmes", path: "/po/programmes", icon: <FileText size={20} /> },
    { name: "Beneficiaries", path: "/po/beneficiaries", icon: <Users size={20} /> },
    { name: "Reports", path: "/po/reports", icon: <BarChart3 size={20} /> },
  ],
  'Admin': [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Programmes", path: "/admin/programmes", icon: <FileText size={20} /> },
    { name: "Beneficiaries", path: "/admin/beneficiaries", icon: <Users size={20} /> },
    { name: "Reports", path: "/admin/reports", icon: <BarChart3 size={20} /> },
    { name: "Annual Events", path: "/admin/annual-events", icon: <Calendar size={20} /> },
    { name: "User Management", path: "/admin/users", icon: <UserCog size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
    
  ],
  'Management': [
    { name: "Dashboard", path: "/mgmt/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Programmes", path: "/mgmt/programmes", icon: <FileText size={20} /> },
    { name: "Reports", path: "/mgmt/reports", icon: <BarChart3 size={20} /> },
  ],
  'CD Officer': [
    { name: "Dashboard", path: "/cd/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Validation Queue", path: "/cd/validation-queue", icon: <ClipboardList size={20} /> },
    { name: "Reports", path: "/cd/reports", icon: <BarChart3 size={20} /> },
    { name: "Archives", path: "/cd/archives", icon: <Archive size={20} /> },
  ],
  'MR Officer': [
    { name: "Dashboard", path: "/mr/dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Reports", path: "/mr/reports", icon: <BarChart3 size={20} /> },
    { name: "Archives", path: "/mr/archives", icon: <Archive size={20} /> },
  ],
};
