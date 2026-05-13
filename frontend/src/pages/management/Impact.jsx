import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Clock, 
  ChevronDown,
  Sparkles,
  Layers,
  MapPin,
  Shield,
  Briefcase
} from 'lucide-react';

const ManagementGenerateReport = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('quarterly');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Programmes</h1>
          <p className="text-sm text-gray-500 font-medium">View programmes & projects</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <Users size={20} />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800">Pema Tshoki</p>
            <p className="text-[10px] text-gray-400">Management</p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/mgmt/reports')}
        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Report
      </button>

      {/* Title Section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-500 shadow-inner shadow-blue-200/50">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Generate Report</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Configure and generate quarterly or annual reports</p>
        </div>
      </div>

      {/* Step 1: Choose Report */}
      <div className="bg-white p-6 sm:p-10 rounded-[40px] shadow-sm border border-gray-200 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-100">1</div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Choose Report</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setReportType('quarterly')}
            className={`cursor-pointer p-8 rounded-3xl border transition-all duration-300 ${reportType === 'quarterly' ? 'border-blue-400 bg-blue-50/20 shadow-lg shadow-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reportType === 'quarterly' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Quarterly Report</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Progress for a specific quarter</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setReportType('annual')}
            className={`cursor-pointer p-8 rounded-3xl border transition-all duration-300 ${reportType === 'annual' ? 'border-blue-400 bg-blue-50/20 shadow-lg shadow-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${reportType === 'annual' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800">Annual Report</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Full year overview & achievements</p>
              </div>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Calendar size={12} /> Select Year
          </div>
          <div className="flex flex-wrap gap-4">
            {['2026', '2025', '2024', '2023'].map((year) => (
              <label key={year} className="flex-1 min-w-[120px] bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-blue-500 focus:ring-blue-400" />
                <span className="text-sm font-bold text-gray-700">{year}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Period Selector */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <Calendar size={12} /> Select Period
          </div>
          <div className="flex flex-wrap gap-4">
            {['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'].map((period) => (
              <label key={period} className="flex-1 min-w-[150px] bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white hover:border-blue-200 transition-all">
                <input type="checkbox" className="w-5 h-5 rounded-md border-gray-300 text-blue-500 focus:ring-blue-400" />
                <span className="text-sm font-bold text-gray-700">{period}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Report Details */}
      <div className="bg-white p-6 sm:p-10 rounded-[40px] shadow-sm border border-gray-200 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-100">2</div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Report Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Programme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Layers size={12} /> Programme
            </div>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                <option>All Programme</option>
                <option>Social Development</option>
                <option>Economic Development</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Briefcase size={12} /> Project
            </div>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                <option>All Project</option>
                <option>Project 1</option>
                <option>Project 2</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Officer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Users size={12} /> Officer
            </div>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                <option>All Officer</option>
                <option>Officer 1</option>
                <option>Officer 2</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* District */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <MapPin size={12} /> District
            </div>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                <option>Select District</option>
                <option>Thimphu</option>
                <option>Paro</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              <Shield size={12} /> Format
            </div>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl text-sm font-bold text-gray-700 appearance-none outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent">
                <option>PDF Document</option>
                <option>Excel</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pb-12">
        <button 
          onClick={() => navigate('/mgmt/reports')}
          className="px-10 py-4 font-black text-gray-400 hover:text-gray-600 border border-gray-200 bg-white rounded-2xl transition-all"
        >
          Cancel
        </button>
        <button 
          className="px-10 py-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
        >
          <Sparkles size={18} /> Generate Report
        </button>
      </div>
    </div>
  );
};

export default ManagementGenerateReport;
