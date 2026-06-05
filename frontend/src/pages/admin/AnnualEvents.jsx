import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, CalendarDays, X, Trash2 } from "lucide-react";
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
  const [fieldError, setFieldError] = useState("");
  const [deleteEvent, setDeleteEvent] = useState(null);

  // Automatically clear and initialize form fields whenever the Create Modal opens
  useEffect(() => {
    if (showCreate) {
      setEventName("");
      setFields([]);
      setFieldName("");
      setFieldType("Text");
      setFieldError("");
    }
  }, [showCreate]);

  // ADD FIELD
  const addField = () => {
    if (!fieldName.trim()) {
      setErrorMessage("Field name is required");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);

      return;
    }

    setFields([
      ...fields,
      {
        fieldName: fieldName.trim(),
        fieldType: fieldType.toLowerCase(),
        required: true, // Set to true by default since we want to enforce field addition
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
    // Event name required
    if (!eventName.trim()) {
      setErrorMessage("Event name is required");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);

      return;
    }

    // User typed field but forgot to click +
    if (fieldName.trim()) {
      setErrorMessage("Please click + to add the field");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);

      return;
    }

    // At least one field required
    if (fields.length === 0) {
      setErrorMessage("Please add at least one field");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);

      return;
    }

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

      setEvents((prev) => [...prev, data.data]);

      setShowCreate(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 2000);

    } catch (error) {
      console.error(error);

      setErrorMessage("Something went wrong");
      setShowErrorPopup(true);

      setTimeout(() => {
        setShowErrorPopup(false);
      }, 2000);
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
              <div></div>

              <button
                onClick={() => setShowCreate(true)}
                className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
              >
                <Plus size={18} />
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
                  className="relative bg-white rounded-xl flex items-center gap-4 cursor-pointer shadow-sm p-4 sm:p-5 border hover:border-blue-200 transition-all group"
                  onClick={() =>
                    navigate(`/${rootPath}/annual-events/${event._id}`, {
                      state: { event }
                    })
                  }
                >
                  {/* TRASH ICON */}
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

      {/* CREATE MODAL */}
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
              required
              value={eventName}
              onKeyDown={(e) => {
                if (
                  /[0-9]/.test(e.key) &&
                  !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
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
                  <X className="cursor-pointer text-gray-400 hover:text-black" onClick={() => removeField(i)} size={16} />
                </div>
              ))}

              {/* ADD FIELD */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:flex-1">
                  <input
                    required
                    value={fieldName}
                    onKeyDown={(e) => {
                      if (
                        /[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldName(value);

                      const exists = fields.some(
                        (field) =>
                          field.fieldName?.toLowerCase().trim() ===
                          value.toLowerCase().trim()
                      );

                      setFieldError(exists ? "Field name already exists" : "");
                    }}
                    placeholder="Field Name"
                    className={`w-full border p-2 rounded text-sm ${
                      fieldError ? "border-red-500" : ""
                    }`}
                  />

                  {fieldError && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldError}
                    </p>
                  )}
                </div>

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
                  className="w-full sm:w-auto bg-gray-200 px-4 py-2 rounded font-bold hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="w-full sm:w-auto px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={createEvent}
                className="w-full sm:w-auto bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors text-sm sm:text-base"
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

            <p className="text-gray-500 text-sm mt-1">
              Are you sure you want to delete this event? This action will permanently remove{" "}
              <span className="font-semibold text-black">{deleteEvent.eventName}</span> from the system.
            </p>

            <div className="flex justify-end gap-3 pt-5">
              <button
                onClick={() => setDeleteEvent(null)}
                className="px-5 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="bg-[#AA3333] text-white px-5 py-2 rounded-lg hover:bg-[#992222]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
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
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">
              Event Created Successfully
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              The event has been successfully created.
            </p>
          </div>
        </div>
      )}

      {/* ERROR POPUP */}
      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
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