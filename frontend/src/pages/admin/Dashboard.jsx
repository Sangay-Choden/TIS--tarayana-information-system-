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

const recentActivities = [
  {
    action: "New programme 'Advocacy & Network' created",
    actor: "Programme Officer",
    date: "Mar 14, 2026",
    icon: FolderKanban,
    color: "bg-blue-100 text-blue-600",
  },
  {
    action: "New project 'WASH Installation' created",
    actor: "Field Officer",
    date: "Mar 13, 2026",
    icon: FolderKanban,
    color: "bg-green-100 text-green-600",
  },
  {
    action: "Quarterly report Q1 2026 generated",
    actor: "M&R Officer",
    date: "Mar 12, 2026",
    icon: FileText,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    action: "New beneficiary registered",
    actor: "Field Officer",
    date: "Mar 11, 2026",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
];

const Dashboard = () => {
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
      const res = await fetch("http://localhost:5000/api/auth/recent-activity", {
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

      const res = await fetch("http://localhost:5000/api/beneficiaries", {
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

      const res = await fetch("http://localhost:5000/api/programmes", {
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

      const res = await fetch("http://localhost:5000/api/projects", {
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
        `http://localhost:5000/api/projects/dashboard-summary/Admin/${userId}`
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
                <div className="flex gap-2 mt-3 text-[11px] font-semibold">
                  <span className="text-green-600">Done: {summary.completed}</span>
                  <span className="text-blue-400">Live: {summary.ongoing}</span>
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
              <h3 className="font-semibold mb-4">
                Programme Distribution
              </h3>

     <ResponsiveContainer width="100%" height={220}>
  <PieChart>
    <Pie
      data={programmePieData}
      dataKey="value"
      innerRadius={50}
      outerRadius={80}
    >
      {programmePieData.map((entry, index) => (
        <Cell key={index} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>

<div className="mt-3 space-y-1 text-sm">
  {programmePieData.map((p) => (
    <p key={p.name}>
      {p.name} - {p.value}
    </p>
  ))}
</div>
            </div>

            {/* Activity */}
                 {/* Recent Activity */}
<div className="bg-white rounded-xl shadow p-5">
  <h3 className="font-semibold text-gray-700 mb-4">
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