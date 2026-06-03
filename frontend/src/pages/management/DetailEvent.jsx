import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

const DetailEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [innerData, setInnerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/annual-event/event/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json();

        if (!res.ok) {
          console.error(result.message);
          return;
        }

        const raw = result.data || result;

        const data =
          Array.isArray(raw) && raw.length > 0
            ? raw[0].data
            : raw?.data || raw;

        setInnerData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEventDetails();
  }, [id, API_URL]);


  if (loading)
    return <div className="p-6 text-center text-gray-400">Loading...</div>;

  if (!innerData)
    return <div className="p-6 text-center text-gray-400">No Data Found</div>;

  // Global ignore list for database metadata
  const systemKeys = ["_id", "__v", "createdAt", "updatedAt"];

  // Helper to accurately format values or handle alternative date string formats
  const formatValue = (key, value) => {
    if (value == null) return "-";
    if (typeof value === "string" && key.toLowerCase().includes("date") && value.includes("-")) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-GB"); // Renders as DD/MM/YYYY
      }
    }
    return String(value);
  };
  console.log(innerData)
  // 1. Separate flat key-value pairs dynamically (Theme, Date, Member counts, etc.)
  const simpleFields = Object.entries(innerData).filter(
    ([key, value]) => !systemKeys.includes(key) && typeof value !== "object" && !Array.isArray(value)
  );

  // 2. Identify array-based collections dynamically (districts, gameStalls, sponsors, etc.)
  const arrayFields = Object.entries(innerData).filter(
    ([key, value]) => !systemKeys.includes(key) && Array.isArray(value) && value.length > 0
  );

  return (
    <div className="w-full px-4 pb-6 flex justify-center">
      <div className="w-full space-y-8">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 text-sm hover:text-blue-500 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {/* DETAILS CONTAINER */}
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-8">
          
          <h2 className="text-xl font-bold border-b pb-3 text-gray-800">
            {innerData.Title || innerData.theme || "Event Details"}
          </h2>

          {/* ================= DYNAMIC TOP LEVEL METADATA ================= */}
          {simpleFields.length > 0 && (
            <div className="space-y-4">
              {simpleFields.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[280px_1fr] gap-4 items-start text-sm">
                  <div className="font-bold text-gray-800 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()} :
                  </div>
                  <div className="text-gray-600 italic break-words">
                    {formatValue(key, value)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= DYNAMIC COMPLEX ARRAYS / TABLES ================= */}
          {arrayFields.map(([arrayKey, arrayData]) => {
            
            // --- A. SPECIAL STRUCTURAL CASE: DISTRICT BREAKDOWN ---
            if (arrayKey === "districts") {
              return (
                <div key={arrayKey} className="space-y-6 border-t pt-6">
                  <div className="grid grid-cols-[280px_1fr] gap-4">
                    <span className="font-bold text-gray-800 text-sm">No. of Different Districts Breakdown :</span>
                    <div>
                      {/* Parent Earnings Subtable */}
                      <div className="grid grid-cols-2 text-sm font-bold text-gray-800 mb-2">
                        <span>District</span>
                        <span>Total Amount Earned(Nu)</span>
                      </div>
                      {arrayData.map((district, dIndex) => {
                        const totalEarned = Array.isArray(district.communities)
                          ? district.communities.reduce((sum, c) => sum + Number(c.income || 0), 0)
                          : 0;
                        return (
                          <div key={dIndex} className="grid grid-cols-2 py-1 text-sm text-gray-600 italic capitalize">
                            <span>{district.districtName || "-"}</span>
                            <span>{totalEarned}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deeply Nested Products and Members Breakdown under Districts */}
                  {arrayData.map((district, dIndex) => (
                    <div key={`nested-district-${dIndex}`} className="bg-gray-50/50 border rounded-xl p-4 ml-[280px] space-y-4 text-sm">
                      <div className="font-bold text-blue-600 uppercase tracking-wider text-xs">
                        {district.districtName || "District"} Details
                      </div>

                      {/* Nested Products Block */}
                      {district.communities?.some(c => c.products?.length > 0) && (
                        <div className="pl-3 border-l-2 border-gray-300">
                          <div className="text-xs font-bold text-gray-500 uppercase mb-1">Products Offered</div>
                          <ul className="list-disc list-inside text-gray-600 italic">
                            {district.communities.flatMap(c => c.products || []).map((p, pIdx) => (
                              <li key={pIdx} className="capitalize">{p.productName || "-"}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Nested Community Members Subtable */}
                      {district.communities?.some(c => c.members?.length > 0) && (
                        <div className="pl-3 border-l-2 border-gray-300 space-y-1">
                          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Community Members</div>
                          <div className="grid grid-cols-2 font-bold text-gray-800 text-xs">
                            <span className="underline">CID</span>
                            <span className="underline">Name</span>
                          </div>
                          {district.communities.flatMap(c => c.members || []).map((m, mIdx) => (
                            <div key={mIdx} className="grid grid-cols-2 text-gray-600 italic">
                              <span>{m.cid || "-"}</span>
                              <span className="capitalize">{m.name || "-"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            }

            // --- B. GENERIC FALLBACK FOR FLAT OBJECT ARRAYS (Game Stalls, Sponsors, or Anything New) ---
            // Automatically infers column names dynamically based on keys found within array items
            const sampleItem = arrayData[0] || {};
            const itemKeys = Object.keys(sampleItem).filter(k => k !== "_id");

            return (
              <div key={arrayKey} className="border rounded-xl shadow-sm overflow-hidden bg-white border-t mt-4">
                <div className="bg-gray-50/70 px-4 py-3 border-b">
                  <h3 className="text-sm font-bold text-gray-800 capitalize">
                    {arrayKey.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                </div>
                <div className="p-4">
                  {/* Auto-generated Table Header layout using inferred keys */}
                  <div className={`grid grid-cols-${itemKeys.length || 1} border-b pb-2 text-sm font-bold text-gray-800 mb-2 capitalize`}>
                    {itemKeys.map((itemKey) => (
                      <span key={itemKey}>{itemKey.replace(/([A-Z])/g, " $1").trim()}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  <div className="divide-y">
                    {arrayData.map((rowItem, rowIndex) => (
                      <div key={rowIndex} className={`grid grid-cols-${itemKeys.length || 1} py-3 text-sm text-gray-600 italic`}>
                        {itemKeys.map((itemKey) => (
                          <span key={itemKey} className={typeof rowItem[itemKey] === "string" ? "capitalize" : ""}>
                            {formatValue(itemKey, rowItem[itemKey])}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default DetailEvent;