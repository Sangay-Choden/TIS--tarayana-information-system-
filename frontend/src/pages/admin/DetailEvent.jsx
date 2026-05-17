// import { useNavigate, useLocation } from "react-router-dom";
// import { useState } from "react";
// import { CalendarDays } from "lucide-react";

// const DetailEvent = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { entry, event } = location.state || {};

//   return (
//     <div className="space-y-4 max-w-5xl mx-auto">

//           <button onClick={() => navigate(-1)}>← Back</button>

//           <div className="bg-white rounded-xl border p-5">

//             <div className="flex items-center gap-3 mb-4">
//               <div className="bg-blue-100 p-2 rounded">
//                 <CalendarDays className="text-blue-600" />
//               </div>

//               <h2 className="font-semibold text-lg">
//                 {entry.Theme || entry.Title}
//               </h2>
//             </div>

//             <div className="border-b mb-4"></div>

//             <h3 className="font-semibold mb-3">Details</h3>

//             {Object.entries(entry).map(([k, v]) => (
//               <div key={k} className="flex justify-between border-b py-2">
//                 <span className="font-medium">{k}</span>
//                 <span className="text-gray-500">{v}</span>
//               </div>
//             ))}

//           </div>
//     </div>
//   );
// };

// export default DetailEvent;




import { useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import Navbar from "../../components/Navbar";
import { useState } from "react";
import { CalendarDays, ChevronLeft } from "lucide-react";

const DetailEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const { entry } = location.state || {};
  const data = entry?.data || entry || {};

  return (
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">
        
          <button onClick={() => navigate(-1)}
      className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back</button>

          <div className="bg-white rounded-xl border p-8 shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-4 text-gray-800">
              {data["Pilgrimage Title"] || "Event Details"}
            </h2>

            <div className="space-y-6">
              {Object.entries(data).map(([key, value]) => {
                // Skip internal keys or nested objects we handle specifically later
                if (key === "citizen_details" || key === "sponsor_list" || key === "_id" || key === "annualEventId") return null;

                return (
                  <div key={key} className="grid grid-cols-3 gap-4 py-1">
                    <span className="font-bold text-gray-700 col-span-1">{key}</span>
                    <span className="text-gray-600 col-span-2 italic">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                );
              })}

              {/* --- SPECIAL CASE: Senior Citizen Details Table --- */}
              {data["citizen_details"] && data["citizen_details"].length > 0 && (
                <div className="grid grid-cols-3 gap-4 pt-2">
                   <span className="font-bold text-gray-700">Senior Citizen Participants  </span>
                  <div className="col-start-2 col-span-2">

                 <div className="grid grid-cols-2 text-sm mb-2">

                      <span className="font-bold text-gray-800 underline">CID</span>
                      <span className="font-bold text-gray-800 underline">Name</span>
                    </div>
                    {data["citizen_details"].map((citizen, idx) => (
                      <div key={idx} className="grid grid-cols-2 py-1 text-gray-600 italic">
                          <span>{citizen.cid}</span>
                        <span>{citizen.name}</span>
                      
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- SPECIAL CASE: Sponsors List --- */}
              {data["sponsor_list"] && data["sponsor_list"].length > 0 && (
              
                <div className="grid grid-cols-3 gap-4 pt-2">
                   <span className="font-bold text-gray-700">Sponsor's Name with Amount </span>
                  <div className="col-start-2 col-span-2">

                 <div className="grid grid-cols-2 text-sm mb-2">

                      <span className="font-bold text-gray-800 underline">Name</span>
                      <span className="font-bold text-gray-800 underline">Amount(Nu.)</span>
                    </div>
                  {data["sponsor_list"].map((sponsor, idx) => (
                      <div key={idx} className="grid grid-cols-2 py-1 text-gray-600 italic">
                      <span>{sponsor.name}</span>
                  <span>{sponsor.amount}</span>
                      
                      </div>
                    ))}
                  </div>
                </div>
                
                
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailEvent;