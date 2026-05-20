

import { useState } from "react";
import { FileText, Eye, Download, Sparkles, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {  useEffect } from "react";

const Reports = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const location = useLocation();
    const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentReports = reports.slice(
  indexOfFirst,
  indexOfLast
);
   

useEffect(() => {
  fetch(`${API_URL}/api/report`)
    .then((res) => res.json())
    .then((data) => {
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.reports)
        ? data.reports
        : [];

      setReports(list);
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      setReports([]);
    });
}, []);

const handleView = (report) => {
  window.open(`${API_URL}${report.fileUrl}`, "_blank");
};

const handleDownload = (report) => {
  const link = document.createElement("a");
  link.href = `${API_URL}${report.fileUrl}`;
  link.download = report.title;
  link.click();
};
useEffect(() => {
  if (location.state?.newReport) {
    setReports((prev) => [location.state.newReport, ...prev]);
  }
}, [location.state]);



 
  return (
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">


          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              {/* <h1 className="text-xl font-semibold text-gray-800">
                Reports & M&E
              </h1>
              <p className="text-sm text-gray-500">
                Monitoring, evaluation & reporting
              </p> */}
            </div>

            <button
              onClick={() => navigate(`/${rootPath}/reports/generate`)}
             className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2  hover:bg-[#298CD2] transition-colors"
            >
              <FileCheck size={18} />
              Generate Report
            </button>
          </div>

          {/* REPORT LIST */}
          <div className="bg-white rounded-2xl shadow p-4 space-y-4">
            <h2 className="text-md font-semibold text-gray-700">
              Generated Reports
            </h2>

         {currentReports.map((r) => (
              <div
                key={r._id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-xl hover:shadow-md transition"
              >
                {/* LEFT */}
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800">
                      {r.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {r.fileUrl?.split(".").pop()?.toUpperCase()} • {r.year}
                    </p>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex gap-4 text-gray-500">
                  <Eye
                    onClick={() => handleView(r)}
                    className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-blue-600 transition"
                  />
                  <Download
                    onClick={() => handleDownload(r)}
                    className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-green-600 transition"
                  />

                </div>
              </div>
              
            ))}
            {/* PAGINATION */}
{reports.length > itemsPerPage && (
  <div className="flex flex-col items-start gap-2 mt-4 px-1">

    {/* TEXT */}
    <p className="text-xs sm:text-sm text-gray-500">
      {indexOfFirst + 1}–
      {Math.min(indexOfLast, reports.length)} of {reports.length}
    </p>

    {/* BUTTONS */}
    <div className="flex items-center gap-2">

      {/* PREV */}
      <button
        onClick={() =>
          setCurrentPage((p) => Math.max(p - 1, 1))
        }
        disabled={currentPage === 1}
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Prev
      </button>

      {/* PAGE */}
      <span className="text-sm font-medium text-gray-700">
        {currentPage} /{" "}
        {Math.ceil(reports.length / itemsPerPage)}
      </span>

      {/* NEXT */}
      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(
              p + 1,
              Math.ceil(reports.length / itemsPerPage)
            )
          )
        }
        disabled={
          currentPage ===
          Math.ceil(reports.length / itemsPerPage)
        }
        className="px-3 py-1 text-xs sm:text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Next
      </button>

    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;