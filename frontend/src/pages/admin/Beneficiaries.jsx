import { useEffect, useState, useMemo } from "react";
import { Search, User } from "lucide-react";

const Beneficiaries = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const [beneficiaries, setBeneficiaries] = useState([]);
  const itemsPerPage = 10;
useEffect(() => {
  fetchAllBeneficiaries();
}, []);
  
const filteredData = useMemo(() => {
  return beneficiaries.filter((item) =>
    item.cid.toLowerCase().includes(search.toLowerCase())
  );
}, [search, beneficiaries]);


const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentData = useMemo(() => {
  return filteredData.slice(indexOfFirst, indexOfLast);
}, [currentPage, filteredData]);



  const fetchAllBeneficiaries = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/beneficiaries", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) return;

    setBeneficiaries(data.data);

  } catch (err) {
    console.error(err);
  }
};


  return (
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

        {/* HEADER */}
        {/* <div className="mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
            Beneficiaries
          </h1>
          <p className="text-sm text-gray-500">
            Beneficiary records & households
          </p>
        </div> */}

        {/* SEARCH */}
        <div className="mt-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by CID"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ================= MOBILE VIEW ================= */}
        <div className="sm:hidden space-y-4">
          {currentData.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm p-4">

              <p className="text-blue-600 font-semibold">{item.cid}</p>
              <h2 className="text-gray-800 font-medium">{item.name}</h2>

              <div className="text-sm text-gray-500 mt-2 space-y-1">

                <p>Year: {item.year}</p>
<p>
 {item.gender === "M" 
    ? "Male" 
    : item.gender === "F" 
      ? "Female" 
      : "N/A"}
</p>

                <p>
                  Location: {item.dzongkhag}, {item.gewog}, {item.village}
                </p>

                <p>
                  House: {item.houseNo} | Thram: {item.thramNo}
                </p>

                <p>
                  Project: {item.projectId?.projectName || "N/A"}
                </p>

                <p>
                  Indirect: M({item.indirectBeneficiaries?.male ?? 0}) 
                  F({item.indirectBeneficiaries?.female ?? 0})
                </p>

                <p className="italic">
                  Activities:{" "}
                  {item.keyActivities?.map((a) => a.activityName).join(", ") || "N/A"}
                </p>

              </div>
            </div>
          ))}
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">

          <div className="min-w-[1200px]">

            {/* HEADER */}
            <div className="grid grid-cols-[1.2fr_1.5fr_0.8fr_1.2fr_1fr_1fr_0.8fr_0.8fr_1.3fr_1fr_1fr_1.5fr] gap-x-6 px-6 py-4 text-sm font-bold text-gray-700 border-b">


              <span>CID</span>
              <span>Name</span>
              <span>Year</span>
              <span>Dzongkhag</span>
              <span>Gewog</span>
              <span>Village</span>
              <span>House</span>
              <span>Thram</span>
              <span>Project</span>
              <span>Gender</span>
              <span>Indirect</span>
              <span>Activities</span>
            </div>

            {/* ROWS */}
            <div className="divide-y">
              {currentData.map((item) => (
                <div
                  key={item._id}
                  // className="grid grid-cols-12 px-6 py-4 text-sm items-center hover:bg-gray-50"
                  className="grid grid-cols-[1.2fr_1.5fr_0.8fr_1.2fr_1fr_1fr_0.8fr_0.8fr_1.3fr_1fr_1fr_1.5fr] gap-x-6 px-6 py-4 text-sm items-center hover:bg-blue-50/40 transition duration-200 group"
                >

                  <span className="text-blue-600 font-medium">
                    {item.cid}
                  </span>

                  {/* <span className="flex items-center gap-2">
                     <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                              <User size={14}/>
                            </div>
                    {item.name}
                  </span> */}
                  <span className="flex items-center gap-3">
  <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600">
    <User size={14}/>
  </div>

  <div className="flex flex-col">
    <span className="font-medium text-gray-800">{item.name}</span>
    {/* <span className="text-xs text-gray-400">ID: {item.cid.slice(-4)}</span> */}
  </div>
</span>

                  <span>{item.year}</span>
                  <span>{item.dzongkhag}</span>
                  <span>{item.gewog}</span>
                  <span>{item.village}</span>
                  <span>{item.houseNo}</span>
                  <span>{item.thramNo}</span>

                  <span>
                    {item.projectId?.projectName || "N/A"}
                  </span>

{/* <p>
  {item.gender === "M" 
    ? "Male" 
    : item.gender === "F" 
      ? "Female" 
      : "N/A"}
</p> */}
<span
  className={`inline-flex items-center justify-center px-3 py-1.5 text-xs rounded-full font-medium whitespace-nowrap ${
    item.gender === "M"
      ? "bg-blue-100 text-blue-600"
      : item.gender === "F"
      ? "bg-pink-100 text-pink-600"
      : "bg-gray-100 text-gray-500"
  }`}
>
  {item.gender === "M"
    ? "Male"
    : item.gender === "F"
    ? "Female"
    : "N/A"}
</span>

                  {/* <span>
                    M:{item.indirectBeneficiaries?.male ?? 0}{" "}
                    F:{item.indirectBeneficiaries?.female ?? 0}
                  </span> */}
                  <span className="text-xs font-medium">
  <span className="text-blue-600">
    M:{item.indirectBeneficiaries?.male ?? 0}
  </span>{" "}
  <span className="text-pink-600">
    F:{item.indirectBeneficiaries?.female ?? 0}
  </span>
</span>

                  <span className="truncate">
                    {item.keyActivities?.map((a) => a.activityName).join(", ") || "N/A"}
                  </span>

                </div>
              ))}
            </div>

        

          </div>
        </div>

{/* PAGINATION */}
{filteredData.length > itemsPerPage && (
  <div className="flex flex-col items-left gap-2 ml-4 mt-4 mb-4">

    {/* TEXT */}
    <p className="text-xs text-gray-500">
      {indexOfFirst + 1}–
      {Math.min(indexOfLast, filteredData.length)} of {filteredData.length}
    </p>

    {/* BUTTONS */}
    <div className="flex items-center gap-2">

      {/* PREV */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40"
      >
        Prev
      </button>

      {/* CURRENT PAGE */}
      <span className="text-sm font-medium text-gray-700">
        {currentPage} / {Math.ceil(filteredData.length / itemsPerPage)}
      </span>

      {/* NEXT */}
      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(
              p + 1,
              Math.ceil(filteredData.length / itemsPerPage)
            )
          )
        }
        disabled={
          currentPage ===
          Math.ceil(filteredData.length / itemsPerPage)
        }
        className="px-3 py-1 text-xs border rounded-lg disabled:opacity-40"
      >
        Next
      </button>

    </div>
  </div>
)}
      </div>
    </div>
  </div>
);
};

export default Beneficiaries;