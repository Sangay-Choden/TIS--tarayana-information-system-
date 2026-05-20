import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, MapPin, TrendingUp, Activity, Layers, ChevronLeft, ChevronRight 
} from 'lucide-react';
import axios from 'axios';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';

const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [view, setView] = useState('projects'); 
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [leftFilter, setLeftFilter] = useState('programme');
  const [rightFilter, setRightFilter] = useState('programme');
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(0);

  // 🔐 Session Info
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;
  
  // Changed role logic for FO
  const roleName = user?.role?.roleName || "FieldOfficer";

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        // Using the same universal dashboard endpoint, but passing "FieldOfficer" role
        const response = await axios.get(
          `${API_URL}/api/projects/dashboard-summary/${roleName}/${userId}`
        );
        if (response.data.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error("FO Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId, roleName]);

  const filterOptions = [
    { id: 'programme', label: 'Programme' },
    { id: 'dzongkhag', label: 'Dzongkhag' },
    { id: 'year', label: 'Year' }
  ];

  const getPaginatedData = (chartSource, filterType, startIndex) => {
    if (!chartSource || !chartSource[filterType]) return [];
    return chartSource[filterType].slice(startIndex, startIndex + 6).map(item => ({
      name: item.name || item._id || 'N/A',
      value: item.value || item.count || 0
    }));
  };

  if (loading || !data) {
    return <div className="flex h-96 items-center justify-center font-medium text-gray-400 italic">Loading Field Data...</div>;
  }

  const { summary, charts } = data;

  return (
    <div className="space-y-8 p-4 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">Field {view}</h1>
          <p className="text-sm text-gray-500">Field Officer: <b>{user?.name || user?.email}</b></p>
        </div>
        
  <div className="w-full sm:w-auto flex p-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">

  <button 
    onClick={() => setView('projects')}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
      view === 'projects'
        ? 'bg-white shadow text-[#3498db]'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Layers size={18} />
    <span className="truncate">Projects</span>
  </button>

  <button 
    onClick={() => setView('interventions')}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${
      view === 'interventions'
        ? 'bg-white shadow text-[#3498db]'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Activity size={18} />
    <span className="truncate">Interventions</span>
  </button>

</div>
      </div>

      {view === 'projects' ? (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* <StatCard label="My Projects" value={summary.totalProjects} icon={TrendingUp} colorClass="bg-blue-50 text-blue-500" />
            <StatCard label="Direct Reach" value={summary.totalDirect} icon={Users} colorClass="bg-indigo-50 text-indigo-500" />
            <StatCard label="Indirect Reach" value={summary.totalIndirect} icon={Users} colorClass="bg-green-50 text-green-500" />
            <StatCard label="Programmes" value={summary.programmes} icon={FileText} colorClass="bg-purple-50 text-purple-500" />
            <StatCard label="Dzongkhags" value={summary.dzongkhags} icon={MapPin} colorClass="bg-orange-50 text-orange-500" /> */}
            <StatCard 
              label="Total Projects" 
              value={summary.totalProjects} 
              icon={TrendingUp} 
              colorClass="bg-blue-50 text-blue-500"
              subValue={
             <div className="flex flex-col gap-1 mt-3 text-[10px] font-medium leading-tight">
  <span className="flex items-center gap-1 text-green-600">
    ● Completed: {summary.completed}
  </span>
  <span className="flex items-center gap-1 text-blue-400">
    ● Ongoing: {summary.ongoing}
  </span>
</div>
              }
            />
            <StatCard label="Direct Beneficiaries" value={summary.totalDirect} icon={Users} colorClass="bg-indigo-50 text-indigo-500" />
            <StatCard 
              label="Indirect Beneficiaries" 
              value={summary.totalIndirect} 
              icon={Users} 
              colorClass="bg-green-50 text-green-500"
              subValue={
                <div className="flex gap-2 mt-3 text-[11px] font-semibold">
                  <span className="text-blue-600">M: {summary.totalIndirectMale}</span>
                  <span className="text-pink-600">F: {summary.totalIndirectFemale}</span>
                </div>
              }
            />
            <StatCard label="Programmes" value={summary.programmes} icon={FileText} colorClass="bg-purple-50 text-purple-500" />
            <StatCard label="Dzongkhags" value={summary.dzongkhags} icon={MapPin} colorClass="bg-orange-50 text-orange-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT CHART */}
            <div className="flex flex-col">
              <ChartCard 
                title={`Beneficiaries by ${filterOptions.find(o => o.id === leftFilter)?.label}`}
                subtitle="Field Statistics"
                data={getPaginatedData(charts.beneficiaries, leftFilter, leftIdx)}
                filterOptions={filterOptions}
                activeFilterId={leftFilter}
                onOptionSelect={(id) => { setLeftFilter(id); setLeftIdx(0); }}
                yAxisLabel="Beneficiaries"
                xAxisLabel="Categories"
              />
              {/* <div className="flex justify-center items-center gap-6 mt-4">
                <button disabled={leftIdx === 0} onClick={() => setLeftIdx(prev => Math.max(0, prev - 1))} className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20"><ChevronLeft size={24} /></button>
                <span className="text-[10px] font-bold text-gray-300 uppercase">Scroll</span>
                <button
  disabled={
    leftIdx + 6 >=
    ((charts?.beneficiaries?.[leftFilter] || []).length)
  }
   onClick={() => setLeftIdx(prev => prev + 1)} className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20"><ChevronRight size={24} /></button>
              </div> */}
            </div>

            {/* RIGHT CHART */}
            <div className="flex flex-col">
              <ChartCard 
                title={`Projects by ${filterOptions.find(o => o.id === rightFilter)?.label}`}
                subtitle="Field Coverage"
                data={getPaginatedData(charts.projects, rightFilter, rightIdx)}
                filterOptions={filterOptions}
                activeFilterId={rightFilter}
                onOptionSelect={(id) => { setRightFilter(id); setRightIdx(0); }}
                yAxisLabel="Projects"
                xAxisLabel="Categories"
              />
              {/* <div className="flex justify-center items-center gap-6 mt-4">
                <button disabled={rightIdx === 0} onClick={() => setRightIdx(prev => Math.max(0, prev - 1))} className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20"><ChevronLeft size={24} /></button>
                <span className="text-[10px] font-bold text-gray-300 uppercase">Scroll</span>
                <button
  disabled={
    rightIdx + 6 >=
    ((charts?.projects?.[rightFilter] || []).length)
  }
   onClick={() => setRightIdx(prev => prev + 1)} className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-20"><ChevronRight size={24} /></button>
              </div> */}
            </div>
          </div>
        </>
      ) : (
        /* INTERVENTIONS VIEW */
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
          {Object.entries(summary.activityTotals || {}).map(([name, info], idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md ${
                info.isTraining ? "bg-orange-50/40" : "bg-blue-50/40"
              }`}
            >
              <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
                Total Intervention
              </span>

              <h3 className={`text-base font-bold mb-3 uppercase tracking-tight line-clamp-2 min-h-[3rem] flex items-center justify-center ${
                info.isTraining ? "text-orange-600" : "text-blue-600"
              }`}>
                {name}
              </h3>
              
              <div className="flex flex-col items-center">
                <p className="text-4xl font-black text-gray-900 leading-none">
                  {info.count}
                </p>
                
              </div>

              {/* Conditional Capacity Sum & Unit Logic */}
              {(info.totalCapacity > 0 || (info.unit && info.unit !== 'N/A')) && (
                <div className="mt-4 pt-4 border-t border-white/50 w-full">
                  <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                    {info.totalCapacity > 0 ? `Sum: ${info.totalCapacity}` : ''}
                    {info.unit && info.unit !== 'N/A' ? ` ${info.unit}` : ''}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;