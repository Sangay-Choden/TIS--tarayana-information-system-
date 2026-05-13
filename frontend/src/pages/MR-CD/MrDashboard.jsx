import { useState } from "react";
// import BhutanMap from "./BhutanMap";

import {
  Users,
  FolderKanban,
  MapPin,
  TrendingUp,
} from "lucide-react";

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

// ✅ DATA (same style, can change later dynamically)
const programmeDistribution = [
  { name: "Social Development", value: 35, color: "#38bdf8" },
  { name: "Economic Development", value: 28, color: "#22c55e" },
  { name: "Environment", value: 20, color: "#facc15" },
  { name: "Research", value: 10, color: "#a855f7" },
  { name: "Advocacy", value: 7, color: "#ef4444" },
];

const beneficiariesByProject = [
  { name: "WASH", value: 5200 },
  { name: "Housing", value: 4100 },
  { name: "Food Security", value: 2600 },
  { name: "Scholarships", value: 3000 },
  { name: "Community Skill", value: 3500 },
  { name: "Credit Access", value: 4800 },
];

const beneficiariesByProgramme = [
  { name: "Social Dev", value: 4500 },
  { name: "Economic Dev", value: 3500 },
  { name: "Environment", value: 3000 },
  { name: "Research", value: 1200 },
  { name: "Advocacy", value: 2500 },
];

const projectsUnderProgramme = [
  { name: "Social Dev", value: 5000 },
  { name: "Economic Dev", value: 3800 },
  { name: "Environment", value: 3000 },
  { name: "Research", value: 1000 },
  { name: "Advocacy", value: 2700 },
];

const colors = [
  "#38bdf8",
  "#22c55e",
  "#facc15",
  "#a855f7",
  "#ef4444",
  "#3b82f6",
];

const MrDashboard = () => {
  const user = {
    name: "Tshoki",
    role: "MR Officer",
  };

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Total Beneficiaries",
                value: "12,000",
                icon: Users,
                color: "bg-blue-500",
              },
              {
                title: "Active Programme",
                value: "24",
                icon: FolderKanban,
                color: "bg-green-500",
              },
              {
                title: "Dzongkhags Covered",
                value: "20",
                icon: MapPin,
                color: "bg-yellow-500",
              },
              {
                title: "Project this Year",
                value: "47",
                icon: TrendingUp,
                color: "bg-purple-500",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow p-5 flex justify-between items-center hover:shadow-lg transition"
                >
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>
                    <h2 className="text-2xl font-bold mt-1">
                      {item.value}
                    </h2>
                  </div>
                  <div className={`p-3 rounded-xl text-white ${item.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROW 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Programme Distribution */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-semibold mb-4">
                Programme Distribution
              </h3>

              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={programmeDistribution}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {programmeDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 text-sm space-y-1">
                {programmeDistribution.map((p) => (
                  <p key={p.name}>
                    {p.name} - {p.value}%
                  </p>
                ))}
              </div>
            </div>

            {/* Beneficiaries by Project */}
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="font-semibold mb-4">
                Beneficiaries by Project
              </h3>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={beneficiariesByProject}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {beneficiariesByProject.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Beneficiaries by Programme */}
            <div className="bg-white rounded-2xl shadow p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  Beneficiaries by Programme
                </h3>
                <select className="border rounded-lg px-2 py-1 text-sm">
                  <option>All Programmes</option>
                </select>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={beneficiariesByProgramme}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {beneficiariesByProgramme.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Projects under Programme */}
            <div className="bg-white rounded-2xl shadow p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  Projects under Programme
                </h3>
                <select className="border rounded-lg px-2 py-1 text-sm">
                  <option>All Programmes</option>
                </select>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={projectsUnderProgramme}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {projectsUnderProgramme.map((_, i) => (
                      <Cell key={i} fill={colors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* MAP SECTION */}
            <div className="col-span-full">
              <BhutanMap />
            </div>
          </div>
        </div>
  );
};

export default MrDashboard;