
import {useEffect, useState } from "react";
import { Users, FileText, MapPin, BarChart3 , FolderKanban ,Calendar,  TrendingUp, Activity, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "../../components/ui/StatCard";
import ChartCard from "../../components/ui/ChartCard";

import axios from "axios";

const programmeDistribution = [
  { name: "Social Development", value: 35, color: "#38bdf8" },
  { name: "Economic Development", value: 28, color: "#22c55e" },
  { name: "Environment", value: 20, color: "#facc15" },
  { name: "Research", value: 10, color: "#a855f7" },
  { name: "Advocacy", value: 7, color: "#ef4444" },
];

const dzongkhagData = [
  { name: "Thimphu", beneficiaries: 890 },
  { name: "Paro", beneficiaries: 650 },
  { name: "Punakha", beneficiaries: 520 },
  { name: "Bumthang", beneficiaries: 430 },
  { name: "Trashigang", beneficiaries: 380 },
  { name: "Wangdue", beneficiaries: 310 },
];

const projectData = [
  { name: "Social", value: 5200 },
  { name: "Economic", value: 4100 },
  { name: "Environment", value: 2600 },
  { name: "Research", value: 1200 },
  { name: "Advocacy", value: 2100 },
  { name: "Clubs", value: 2400 },
];

const colors = ["#38bdf8", "#22c55e", "#facc15", "#a855f7", "#ef4444", "#3b82f6"];



const Dashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
const [collapsed, setCollapsed] = useState(false);
const [beneficiariesCount, setBeneficiariesCount] = useState(0);
const [ProgrammeCount, setProgrammeCount] = useState(0);
const [ProjectCount, setProjectCount] = useState(0);
const [dzongkhagCount, setDzongkhagCount] = useState(0);
  const [view, setView] = useState('projects'); 

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;
  const roleName = user?.role?.roleName || "Admin";

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

const [leftFilter, setLeftFilter] = useState("programme");
const [rightFilter, setRightFilter] = useState("programme");

const [leftIdx, setLeftIdx] = useState(0);
const [rightIdx, setRightIdx] = useState(0);
const [activities, setActivities] = useState([]);


useEffect(() => {
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/recent-activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  };

  fetchActivities();
  // Optional: Poll every 60 seconds
  const interval = setInterval(fetchActivities, 60000);
  return () => clearInterval(interval);
}, []);


useEffect(() => {
  const fetchBeneficiaries = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/beneficiaries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) return;

      setBeneficiariesCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBeneficiaries();
}, []);
useEffect(()=>{
 const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/programmes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("programmes:",data)

      if (!res.ok) return;

      setProgrammeCount(data.programmes.length || 0);
    } catch (err) {
      console.error(err);
    }
  };

  fetchProgrammes();
}, []);

useEffect(()=>{
 const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("project",data)
const projects = Array.isArray(data.data) ? data.data : [];

const uniqueDzongkhags = new Set(
  projects
    .flatMap((p) => p.dzongkhag || [])
    .map((d) => d.toLowerCase().trim())
);

setDzongkhagCount(uniqueDzongkhags.size);

      setProjectCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  fetchProjects();
}, []);

const [dzFilter, setDzFilter] = useState("beneficiaries");
const [projectFilter, setProjectFilter] = useState("programme");




const dzData =
  dzFilter === "beneficiaries" ? dzongkhagData : dzongkhagProjects;

const projectChartData =
  projectFilter === "programme"
    ? projectData
    : projectFilter === "dzongkhag"
    ? projectsByDzongkhag
    : projectsByYear;




    useEffect(() => {
  const fetchStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?._id || user?.id;

      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/projects/dashboard-summary/Admin/${userId}`
      );

      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);


// const getPaginatedData = (chartSource, filterType, startIndex) => {
//   if (!chartSource || !chartSource[filterType]) return [];
//   return chartSource[filterType]
//     .slice(startIndex, startIndex + 6)
//     .map(item => ({
//       name: item.name || item._id || "N/A",
//       value: item.value || item.count || 0
//     }));
// };

  const filterOptions = [
    { id: 'programme', label: 'Programme' },
    { id: 'dzongkhag', label: 'Dzongkhag' },
    { id: 'year', label: 'Year' }
  ];

const getPaginatedData = (chartSource = {}, filterType, startIndex) => {
  const selectedData = chartSource?.[filterType] || [];

  return selectedData
    .slice(startIndex, startIndex + 6)
    .map((item) => ({
      name: item.name || item._id || "N/A",
      value: item.value || item.count || 0,
    }));
};


// if (loading || !data) {
//   return <div className="flex h-96 items-center justify-center">Loading Dashboard...</div>;
// }

const summary = data?.summary || {};
const charts = data?.charts || {};

const programmePieData = (charts?.beneficiaries?.programme || []).map(
  (item, index) => ({
    name: item.name || item._id || "N/A",
    value: item.value || item.count || 0,
    color: colors[index % colors.length],
  })
);

  return (
    
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">
    {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 capitalize">{view} Overview</h1>
          <p className="text-sm text-gray-500">Track and manage all project activities</p>
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


  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

{view === 'projects' ? (
        <>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

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



           {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
          {/* Pie */}
<div className="bg-white rounded-2xl shadow p-5">
  <h3 className="font-bold text-gray-700 text-xl mb-4">
    Programme Distribution
  </h3>

  {/* Changed to flex-col (mobile default) and md:flex-row (tablets/desktop) */}
  <div className="flex flex-col md:flex-row items-center gap-6">
    
    {/* Chart Container - full width on mobile, flex-1 on desktop */}
    <div className="w-full flex-1">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={programmePieData}
            dataKey="value"
            innerRadius={60}
            outerRadius={100}
          >
            {programmePieData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Data Labels - switches layout alignment automatically */}
    <div className="w-full md:w-auto space-y-2 text-sm min-w-[140px] px-2 md:px-0">
      {programmePieData.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full shrink-0" 
            style={{ backgroundColor: p.color }}
          />
          <p className="truncate">
            {p.name} - <span className="font-medium">{p.value}</span>
          </p>
        </div>
      ))}
    </div>

  </div>
</div>
            {/* Activity */}
                 {/* Recent Activity */}
<div className="bg-white rounded-xl shadow p-5">
  <h3 className="font-bold text-gray-700 text-lg mb-4">
    Recent Activity
  </h3>

  <div className="space-y-4 max-h-[400px] overflow-y-auto">
    {activities.length > 0 ? (
      activities.map((log) => (
        <div key={log._id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
            {/* Logic to show different icons based on entity */}
            {log.entity === 'beneficiaries' ? <Users size={16} /> : <FileText size={16} />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">
                {log.user?.name || "System"}
              </span>{" "}
              {log.details}
            </p>
            <span className="text-xs text-gray-400">
              {new Date(log.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-10 text-gray-400 text-sm">
        No recent activity recorded yet.
      </div>
    )}
  </div>
</div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

  {/* Beneficiaries Chart */}
  <div className="flex flex-col w-full">
     <ChartCard 
                title={`Beneficiaries by ${filterOptions.find(o => o.id === leftFilter)?.label}`}
                subtitle={`Filtered Beneficiaries by ${filterOptions.find(o => o.id === leftFilter)?.label}`}
                data={getPaginatedData(charts.beneficiaries, leftFilter, leftIdx)}
                filterOptions={filterOptions}
                activeFilterId={leftFilter}
                onOptionSelect={(id) => { setLeftFilter(id); setLeftIdx(0); }}
                yAxisLabel="No.of Beneficiaries"
                xAxisLabel={`${filterOptions.find(o => o.id === leftFilter)?.label} Categories`}
              />
  </div>

  {/* Projects Chart */}
  <div className="flex flex-col w-full">
  <ChartCard 
                title={`Projects by ${filterOptions.find(o => o.id === rightFilter)?.label}`}
                subtitle={`Filtered Projects by ${filterOptions.find(o => o.id === rightFilter)?.label}`}
                data={getPaginatedData(charts.projects, rightFilter, rightIdx)}
                filterOptions={filterOptions}
                activeFilterId={rightFilter}
                onOptionSelect={(id) => { setRightFilter(id); setRightIdx(0); }}
                yAxisLabel="No.of Projects"
                xAxisLabel={`${filterOptions.find(o => o.id === rightFilter)?.label} Categories`}
              />
  </div>

</div>
</>
 ) : (
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

          {/* Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;