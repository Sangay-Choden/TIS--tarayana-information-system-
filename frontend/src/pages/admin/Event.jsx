
import React,{ useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import Navbar from "../../components/Navbar";
import { Plus, CalendarDays, Eye, Pencil, Trash2 ,ChevronLeft} from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const Event = () => {
  const navigate = useNavigate();
  const location = useLocation();

    const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [event, setEvent] = useState(location.state?.event || null);
const [errors, setErrors] = useState({});

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  const [editIndex, setEditIndex] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [entries, setEntries] = useState([]);
  const [deleteEvent, setDeleteEvent] = useState(null);

const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

  if (!event) return <div className="p-6">No Event Found</div>;
useEffect(() => {
  if (!id) return;
  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/annual-event/main-event/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) return;

      setEvent(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchEvent();
}, [id]);
useEffect(() => {
  if (!id) return;

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/annual-event/events/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) return;

      setEntries(data.data); // 👈 important
    } catch (err) {
      console.error(err);
    }
  };

  fetchEntries();
}, [id]);

  // CREATE
const handleSave = async () => {
  const payload = {
    annualEventId: event._id,
   data: { ...formData },
  };

  event.fields.forEach((f) => {
    let value = formData[f.fieldName];

    if (f.fieldType === "number") value = Number(value);
    if (f.fieldType === "boolean") value = value === "true" || value === true;

    payload.data[f.fieldName] = value;
  });

  const res = await fetch("http://localhost:5000/api/annual-event/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

if (!res.ok) {
  setFormData(false);
  setErrorMessage(result.message || "Validation failed");
  setShowErrorPopup(true);

  setTimeout(() => {
    setShowErrorPopup(false);
  }, 2500);

  return;
}

  // ✅ FIX: update TABLE state
  setEntries((prev) => [...prev, result.data]);

  setShowForm(false);
  setFormData({});
};
  // EDIT
//  const handleEditSave = async () => {
//   const entryId = entries[editIndex]._id;

//   const payload = {
//     data: {},
//   };

//   event.fields.forEach((f) => {
//     let value = formData[f.fieldName];

//     if (f.fieldType === "number") value = Number(value);
//     if (f.fieldType === "boolean") value = value === "true" || value === true;

//     payload.data[f.fieldName] = value;
//   });

//   const res = await fetch(
//     `http://localhost:5000/api/annual-event/event/${entryId}`,
//     {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify(payload),
//     }
//   );

//   const result = await res.json();

//   if (!res.ok) return alert(result.message);

//   // ✅ update UI instantly
//   setEntries((prev) =>
//     prev.map((e, i) => (i === editIndex ? result.data : e))
//   );

//   setShowEdit(false);
//   setFormData({});
// };
const handleEditSave = async () => {
  const entryId = entries[editIndex]._id;

  // 1. Start with the existing formData (which contains sponsor_list and citizen_details)
  const payload = {
    data: { ...formData }, 
  };

  // 2. Run your formatting loop to ensure numbers and booleans are correct
  event.fields.forEach((f) => {
    let value = formData[f.fieldName];

    if (f.fieldType === "number") value = Number(value);
    if (f.fieldType === "boolean") value = value === "true" || value === true;

    payload.data[f.fieldName] = value;
  });

  // 3. EXPLICITLY ensure the nested arrays are preserved
  if (formData.sponsor_list) {
    payload.data.sponsor_list = formData.sponsor_list;
  }
  if (formData.citizen_details) {
    payload.data.citizen_details = formData.citizen_details;
  }

  const res = await fetch(
    `http://localhost:5000/api/annual-event/event/${entryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await res.json();

if (!res.ok) {
  setErrorMessage(result.message || "Update failed");
  setShowErrorPopup(true);

  setTimeout(() => {
    setShowErrorPopup(false);
  }, 2500);

  return;
}

  // Update UI
  setEntries((prev) =>
    prev.map((e, i) => (i === editIndex ? result.data : e))
  );

  setShowEdit(false);
  setFormData({});
};

  // DELETE
 const handleDelete = async () => {
  const entryId = entries[deleteIndex]._id;

  const res = await fetch(
    `http://localhost:5000/api/annual-event/event/${entryId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const result = await res.json();

if (!res.ok) {
  setErrorMessage(result.message || "Delete failed");
  setShowErrorPopup(true);

  setTimeout(() => {
    setShowErrorPopup(false);
  }, 2500);

  return;
}

  // ✅ remove from UI
  setEntries((prev) => prev.filter((_, i) => i !== deleteIndex));

  setShowDelete(false);
setShowDeleteSuccess(true);

setTimeout(() => {
  setShowDeleteSuccess(false);
}, 2000);

};


  // DELETE EVENT
const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/annual-event/main-event/${deleteEvent._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

 const data = await res.json();

    if (!res.ok) return alert(data.message);

    console.log("Deleted successfully");

    setDeleteEvent(null);
    
setShowDeleteSuccess(true);

setTimeout(() => {
  setShowDeleteSuccess(false);
  navigate(`/${rootPath}/annual-events`);
}, 2000);

  } catch (error) {
    console.error(error);
  }
};





  return (
    <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

          {/* HEADER */}
          {/* <div className="flex justify-between items-center"> */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <button onClick={() => navigate(-1)} 
                className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Events
            </button>

                        <button
              onClick={() => setShowForm(true)}
               className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10  shadow font-bold text-sm rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors">
                {/* text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-colors */}
              <Plus size={16} />
              Add {event?.eventName}
            </button>
          </div>

          {/* TITLE */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <CalendarDays className="text-[#2EA1F2]" />
            </div>
            <h2 className="text-lg font-bold">
              {event?.eventName}</h2>

  <Trash2
  size={15}
  className="ml-1 text-[#AA3333] cursor-pointer z-10 hover:scale-110 "
  title="Delete Event"
   onClick={(e) => {
                    e.stopPropagation();
                    setDeleteEvent(event);
                  }}
/>

          </div>

          {/* TABLE */}
                <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
            {/* <table className="w-full text-sm text-left border-collapse"> */}
            <table className="w-full min-w-[600px] text-sm text-left border-collapse">
            {/* <table className="w-full text-sm text-left border-collapse"> */}
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-center w-16">Sl no.</th>

                  {event.fields.map((f) => (
                    <th key={f.fieldName} className="px-4 py-3">
                      {f.fieldName}
                    </th>
                  ))}

                  <th className="px-4 py-3 text-center w-32">Actions</th>
                </tr>
              </thead>

          <tbody>
  {entries.length === 0 ? (
    <tr>
      <td colSpan="100%" className="text-center p-6 text-gray-400">
        No entries yet.
      </td>
    </tr>
  ) : (
    entries.map((item, i) => (
      <tr key={item._id} className="border-t hover:bg-gray-50 transition">
        <td className="px-4 py-3 text-center">{i + 1}</td>

        {(event?.fields || []).map((f) => {
          const fieldName = f.fieldName;
          let displayValue = item.data?.[fieldName] || "-";

          // Check if this specific field is the "Sponsors" field
          if (fieldName.toLowerCase() === "sponsors") {
            const sponsors = item.data?.["sponsor_list"];
            if (Array.isArray(sponsors) && sponsors.length > 0) {
              // Extract only the 'name' from each sponsor object and join with commas
              displayValue = sponsors
                .map((s) => s.name)
                .filter((name) => name) // Remove empty strings
                .join(", ");
            }
          }

          return (
            <td key={fieldName} className="px-4 py-3">
              {displayValue || "-"}
            </td>
          );
        })}

        <td className="px-4 py-3">
          <div className="flex justify-center gap-4">
            {/* VIEW */}
            <Eye
              size={18}
              className="text-blue-500 cursor-pointer"
              onClick={() =>
               navigate(`/${rootPath}/annual-events/${event._id}/detail`, {
  state: { event, entry: item }
})
              }
            />

            {/* EDIT */}
            <Pencil
              size={16}
              className="text-gray-600 cursor-pointer"
              onClick={() => {
                setEditIndex(i);
                setFormData(item.data);
                setShowEdit(true);
              }}
            />

            {/* DELETE */}
            <Trash2
              size={16}
              className="text-[#AA3333] cursor-pointer"
              onClick={() => {
                setDeleteIndex(i);
                setShowDelete(true);
              }}
            />
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
            </table>
          </div>
        </div>
      </div>
       </div>

      {/* ================= ADD MODAL ================= */}
      {showForm && (
        <Modal
          title={`Create ${event?.eventName}`}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          fields={event.fields}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <Modal
          title={`Edit ${event?.eventName}`}
          onClose={() => setShowEdit(false)}
          onSave={handleEditSave}
          fields={event.fields}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* ================= DELETE MODAL ================= */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]">
         <div className="bg-white w-full max-w-xl rounded-xl p-6 space-y-4 shadow-lg">

            <h2 className="text-lg font-semibold">
              Delete item?
            </h2>

            <p className="text-gray-500 text-sm">
              Are you sure you want to delete this item? This action is permanent and cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDelete(false)}
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-[#AA3333] text-white px-5 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteEvent && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">
          <div className="bg-white w-full max-w-xl rounded-xl p-6 space-y-4 shadow-lg">

            <h2 className="text-lg font-semibold">
            Delete event?
            </h2>

            <p className="text-gray-500 text-sm">
              Are you sure you want to delete this event? This action will permanently remove{" "} from the system.
              <span className="font-semibold">{deleteEvent.name}</span>.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteEvent(null)}
                className="px-5 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="bg-[#AA3333] text-white px-5 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


      
{showDeleteSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
        <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Circle + Tick */}
      <div className="flex items-center justify-center mb-6">

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pop">

      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tick-path"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-xl font-semibold text-gray-700">
        Deleted Successfully
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        The item has been deleted successfully.
      </p>

    </div>
  </div>
)}

{showErrorPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
 <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
      {/* Circle + Cross */}
      <div className="flex items-center justify-center mb-6">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pop">

          <div className="w-12 h-12 bg-[#AA3333] rounded-full flex items-center justify-center">

            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>
        </div>
      </div>

      {/* TEXT */}
      <h2 className="text-xl font-semibold text-gray-700">
        Action Failed
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        Please fill all required fields correctly. 
      </p>

    </div>
  </div>
)}


   </>
  );
};

export default Event;

/////////////////////////////////////////////////////////
// 🔹 REUSABLE MODAL COMPONENT (ADD + EDIT)
/////////////////////////////////////////////////////////

const Modal = ({ title, onClose, onSave, fields, formData, setFormData }) => {
  
  const [errors, setErrors] = useState({}); 

  const updateNestedData = (fieldName, index, subField, value) => {
    const currentArray = [...(formData[fieldName] || [])];
    if (!currentArray[index]) currentArray[index] = {};
    currentArray[index][subField] = value;
    setFormData({ ...formData, [fieldName]: currentArray });
  };

  const addRow = (fieldName) => {
    const currentArray = [...(formData[fieldName] || []), { name: "", amount: "" }];
    setFormData({ ...formData, [fieldName]: currentArray });
  };


const validate = () => {
  let newErrors = {};

  fields.forEach((f) => {
    const value = formData[f.fieldName];

    // ✅ REQUIRED
    if (f.required && (!value || value === "")) {
      newErrors[f.fieldName] = "This field is required";
    }

    // ✅ NUMBER should not be 0
    if (f.fieldType === "number" && Number(value) === 0) {
      newErrors[f.fieldName] = "Cannot be zero";
    }

    // ✅ CID validation (11 digits)
    if (f.fieldName.toLowerCase().includes("cid")) {
      if (!/^\d{11}$/.test(value || "")) {
        newErrors[f.fieldName] = "CID must be exactly 11 digits";
      }
    }
  });

  // ✅ Sponsor amount validation
  if (formData.sponsor_list) {
    formData.sponsor_list.forEach((s, i) => {
      if (!s.amount || Number(s.amount) === 0) {
        newErrors[`sponsor_amount_${i}`] = "Amount cannot be zero";
      }
    });
  }

  // ✅ Citizen CID validation (nested)
  if (formData.citizen_details) {
    formData.citizen_details.forEach((c, i) => {
      if (!/^\d{11}$/.test(c.cid || "")) {
        newErrors[`cid_${i}`] = "CID must be 11 digits";
      }
    });
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  console.log("Validation result:", validate());
};



  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">
      <div className="bg-white w-full max-w-5xl rounded-xl p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl">✕</button>
        <h2 className="text-xl font-bold mb-8">{title}</h2>

        {/* The items-start class ensures boxes don't stretch vertically if one is taller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
          {fields.map((f) => {
            
            // --- CASE 1: Senior Citizens + Side-by-Side Name/CID ---
            if (f.fieldName === "No of Senior Citizen Participated") {
              const count = parseInt(formData[f.fieldName]) || 0;
              return (
                <React.Fragment key={f.fieldName}>
                  {/* The actual Number Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">{f.fieldName}</label>
                    <input
                      type="number"
                      value={formData[f.fieldName] || ""}
                      // onChange={(e) => setFormData({ ...formData, [f.fieldName]: e.target.value })}
                      onChange={(e) => {
  const value = e.target.value;

  setFormData({ ...formData, [f.fieldName]: value });

  // ✅ Revalidate ONLY this field
  setErrors((prev) => {
    const updated = { ...prev };

    let error = "";

    if (f.required && !value) {
      error = "This field is required";
    } else if (f.fieldType === "number" && Number(value) === 0) {
      error = "Cannot be zero";
    } else if (
      f.fieldName.toLowerCase().includes("cid") &&
      !/^\d{11}$/.test(value)
    ) {
      error = "CID must be exactly 11 digits";
    }

    if (error) {
      updated[f.fieldName] = error;
    } else {
      delete updated[f.fieldName]; // ✅ REMOVE error properly
    }

    return updated;
  });
}}
                      className="border border-gray-300 rounded-md px-3 py-2 h-11 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                 
                  {Array.from({ length: count }).map((_, idx) => (
                    <React.Fragment key={`cit-${idx}`}>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">CID</label>
                    
                         <input
                          placeholder="CID"
                       className={`border rounded-md px-3 py-2 h-11 outline-none
  ${errors[`cid_${idx}`] ? "border-red-500" : "border-gray-300"}`}
                          value={formData["citizen_details"]?.[idx]?.cid || ""}
                          // onChange={(e) => updateNestedData("citizen_details", idx, "cid", e.target.value)}
                         onChange={(e) => {
  const value = e.target.value;

  updateNestedData("citizen_details", idx, "cid", value);

  setErrors((prev) => {
    const updated = { ...prev };

    if (!/^\d{11}$/.test(value)) {
      updated[`cid_${idx}`] = "CID must be 11 digits";
    } else {
      delete updated[`cid_${idx}`];
    }

    return updated;
  });
}}
                        />
                         {errors[`cid_${idx}`] && (
  <p className="text-red-500 text-xs">
    {errors[`cid_${idx}`]}
  </p>
)}

                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">Name</label>
                        <input
                          placeholder="Name"
                          className={`border rounded-md px-3 py-2 h-11 outline-none
  ${errors[`cid_${idx}`] ? "border-red-500" : "border-gray-300"}`}
                          value={formData["citizen_details"]?.[idx]?.name || ""}
                          // onChange={(e) => updateNestedData("citizen_details", idx, "name", e.target.value)}
                          onChange={(e) => {
  const value = e.target.value;

  updateNestedData("citizen_details", idx, "name", value);

  if (value) {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`name_${idx}`];
      return updated;
    });
  }
}}
                        />
                       
                      </div>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            }

            // --- CASE 2: Sponsors (Row with Nu. prefix) ---
            if (f.fieldName.toLowerCase() === "sponsors") {
              const sponsorList = formData["sponsor_list"] || [{ name: "", amount: "" }];
              return (
                <div key={f.fieldName} className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Sponsor's Name with Amount</label>
                  <div className="space-y-3">
                    {sponsorList.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 flex border border-gray-300 rounded-md overflow-hidden h-11 focus-within:ring-2 focus-within:ring-blue-500">
                          <input
                            placeholder="Enter name"
                            className="flex-1 px-3 py-2 outline-none border-r border-gray-300"
                            value={s.name}
                            onChange={(e) => updateNestedData("sponsor_list", idx, "name", e.target.value)}
                          />
                          <div className="bg-white flex items-center px-2 text-gray-400 text-sm italic">Nu.</div>
                          <input
                            type="number"
                            placeholder="0.00"
                            className={`w-24 px-2 py-2 outline-none 
  ${errors[`sponsor_amount_${idx}`] ? "border-red-500" : ""}`}
                            value={s.amount}
                            // onChange={(e) => updateNestedData("sponsor_list", idx, "amount", e.target.value)}
                           onChange={(e) => {
  const value = e.target.value;

  updateNestedData("sponsor_list", idx, "amount", value);

  setErrors((prev) => {
    const updated = { ...prev };

    if (!value || Number(value) === 0) {
      updated[`sponsor_amount_${idx}`] = "Amount cannot be zero";
    } else {
      delete updated[`sponsor_amount_${idx}`];
    }

    return updated;
  });
}}
                          />
                          {errors[`sponsor_amount_${idx}`] && (
  <p className="text-red-500 text-xs">
    {errors[`sponsor_amount_${idx}`]}
  </p>
)}
                        </div>
                        {idx === sponsorList.length - 1 && (
                          <button type="button" onClick={() => addRow("sponsor_list")} className="text-blue-500 text-2xl font-bold px-1 hover:text-blue-700">
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // --- DEFAULT CASE: Standard Grid Fields (Destination, Dates, etc.) ---
            return (
              <div key={f.fieldName} className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">{f.fieldName}</label>
                <input
                  type={f.fieldType === "date" ? "date" : f.fieldType === "number" ? "number" : "text"}
                  value={formData[f.fieldName] || ""}
                  // onChange={(e) => setFormData({ ...formData, [f.fieldName]: e.target.value })}
                  onChange={(e) => {
  const value = e.target.value;

  setFormData({ ...formData, [f.fieldName]: value });

  setErrors((prev) => {
    const updated = { ...prev };

    let error = "";

    if (f.required && !value) {
      error = "This field is required";
    } else if (f.fieldType === "number" && Number(value) === 0) {
      error = "Cannot be zero";
    } else if (
      f.fieldName.toLowerCase().includes("cid") &&
      !/^\d{11}$/.test(value)
    ) {
      error = "CID must be exactly 11 digits";
    }

    if (error) {
      updated[f.fieldName] = error;
    } else {
      delete updated[f.fieldName];
    }

    return updated;
  });
}}

                  placeholder={f.fieldName}
                 className={`border rounded-md px-3 py-2 h-11 outline-none
${errors[f.fieldName] ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                />
                {errors[f.fieldName] && (
  <p className="text-red-500 text-xs">{errors[f.fieldName]}</p>
)}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-12">
          <button onClick={onClose} className="px-8 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => {
  if (validate()) {
    onSave();
  }
}} className="px-8 py-2.5 bg-[#2EA1F2] text-white rounded-lg hover:bg-[#298CD2] font-bold shadow-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};



