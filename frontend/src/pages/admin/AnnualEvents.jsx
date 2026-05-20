


import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import Navbar from "../../components/Navbar";
import { Plus, CalendarDays, X , Trash2} from "lucide-react";
import { useEffect } from "react";
const AnnualEvents = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const [collapsed, setCollapsed] = useState(false);

      const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

  const [events, setEvents] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

  const [eventName, setEventName] = useState("");
  const [fields, setFields] = useState([]);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("Text");

  const [deleteEvent, setDeleteEvent] = useState(null);

  // ADD FIELD
  const addField = () => {
    if (!fieldName) return;
   setFields([
  ...fields,
  {
    fieldName: fieldName,
    fieldType: fieldType.toLowerCase(),
    required: false,
  },
]);
    setFieldName("");
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };
  useEffect(() => {
  fetchEvents();
}, []);

const fetchEvents = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/annual-event`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) return;

    setEvents(data.events);

  } catch (err) {
    console.error(err);
  }
};

  // CREATE EVENT
const createEvent = async () => {
  if (!eventName || fields.length === 0) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/api/annual-event/main-event`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventName,
          fields: fields.map((f) => ({
            fieldName: f.fieldName,
            fieldType: f.fieldType.toLowerCase(),
            required: f.required ?? false,
          })),
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.message || "Failed to create event");
      setShowErrorPopup(true);
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);
      return;
    }

    // update UI instantly
    setEvents((prev) => [...prev, data.data]);

    setShowCreate(false);
    setShowSuccess(true);

    setEventName("");
    setFields([]);

    setTimeout(() => setShowSuccess(false), 2000);
  } catch (error) {
    console.error(error);
  }
};

  // DELETE EVENT
const confirmDelete = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${API_URL}/api/annual-event/main-event/${deleteEvent._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) return;

    setEvents(events.filter((e) => e._id !== deleteEvent._id));
    setDeleteEvent(null);

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
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              {/* <h2 className="text-xl font-semibold text-gray-800">
                Annual Events
              </h2>
              <p className="text-sm text-gray-500">
                Manage annual events & activities
              </p> */}
            </div>

            <button
              onClick={() => setShowCreate(true)}
                 className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
            >
              <Plus size={18}  />
              Create New Event
            </button>
          </div>

          {/* EMPTY STATE */}
          {events.length === 0 && (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
              No events created yet.
            </div>
          )}

          {/* CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="relative bg-white rounded-xl p-6 flex items-center gap-4 cursor-pointer shadow-sm  p-4 sm:p-5  border  hover:border-blue-200 transition-all cursor-pointer group"
                onClick={() =>
              navigate(`/${rootPath}/annual-events/${event._id}`, {
  state: { event }
})
                }
              >
                {/* DELETE BUTTON */}
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteEvent(event);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button> */}
                  
                   {/* <Trash2
  size={15}
  className="absolute top-3 right-3 text-[#AA3333] cursor-pointer z-10 hover:scale-110"
   onClick={(e) => {
                    e.stopPropagation();
                    setDeleteEvent(event);
                  }}
/> */}

                <div className="bg-blue-100 p-3 rounded-xl">
                  <CalendarDays className="text-blue-600" />
                </div>

                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">
                  {event.eventName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
        </div>

     {showCreate && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-3 sm:px-4">
    
    <div className="bg-white w-full max-w-2xl rounded-2xl p-4 sm:p-6 space-y-5 shadow-lg relative max-h-[90vh] overflow-y-auto">

      {/* CLOSE */}
      <button
        onClick={() => setShowCreate(false)}
            className="absolute right-4 top-4 text-gray-500"
            >
              <X />
            </button>

      <h2 className="text-lg sm:text-xl font-bold">Create New Event</h2>

      {/* EVENT NAME */}
      <input
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        placeholder="Enter Event Name"
        className="w-full border p-2.5 sm:p-3 rounded-lg text-sm sm:text-base"
      />

      {/* FIELDS */}
      <div>
        <p className="text-sm font-semibold mb-2">Fields</p>

        {fields.map((f, i) => (
          <div
            key={i}
            className="flex justify-between items-center border rounded-lg px-3 py-2 mb-2 text-sm"
          >
            <span className="truncate">
              {f.fieldName || "Unnamed"} ({f.fieldType || "text"})
            </span>
            <X onClick={() => removeField(i)} size={16} />
          </div>
        ))}

        {/* ADD FIELD (RESPONSIVE FIX HERE) */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            placeholder="Field Name"
            className="w-full sm:flex-1 border p-2 rounded text-sm"
          />

          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="w-full sm:w-auto border p-2 rounded text-sm"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="boolean">Boolean</option>
          </select>

          <button
            onClick={addField}
            className="w-full sm:w-auto bg-gray-200 px-4 py-2 rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          onClick={() => setShowCreate(false)}
          className="w-full sm:w-auto px-5 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={createEvent}
          className="w-full sm:w-auto bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors text-sm sm:text-base"
        >
          + Create
        </button>
      </div>

    </div>
  </div>
)}

      {/* DELETE CONFIRMATION */}
      {deleteEvent && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[100] px-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow">

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

      {/* SUCCESS */}
{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Background overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Popup Card */}
 {/* Popup Card */}
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

      {/* Text */}
      <h2 className="text-xl font-semibold text-gray-700">
        Event Created Successfully
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        The event has been successfully created.
      </p>

    </div>
  </div>
)}




{showErrorPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
      <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* ICON */}
      <div className="flex justify-center mb-6">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">

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
      <h2 className="text-lg font-semibold text-gray-700">
        Failed to Create Event
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        {errorMessage}
      </p>

    </div>
  </div>
)}

</>
  
  );
};

export default AnnualEvents;




