import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Plus, FileText, X } from "lucide-react";
import { useEffect } from "react";
const Programme = () => {
  const API_URL = import.meta.env.VITE_API_URL;
   const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];
   

  const [collapsed, setCollapsed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
  

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();

 const [programmes, setProgrammes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


 const filteredProgrammes = programmes.filter((p) =>
  p.programmeName.toLowerCase().includes(search.toLowerCase())
);
  useEffect(() => {
  const fetchProgrammes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/programmes`, {
        headers: {
          Authorization: `Bearer ${token}`, // optional if protected
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch");
        return;
      }

      setProgrammes(data.programmes);

    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  fetchProgrammes();
}, []);


  const handleCreate = async () => {
  if (!formData.name.trim() || !formData.description.trim()) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/api/programmes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // if protected
      },
      body: JSON.stringify({
        programmeName: formData.name,
        programmeDescription: formData.description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.message);
      setShowErrorPopup(true);
      return;
    }

    // ✅ Add new programme to UI instantly
    setProgrammes((prev) => [...prev, data.programme]);

    setShowModal(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 2000);

    setFormData({ name: "", description: "" });

  } catch (error) {
    setErrorMessage("Server error");
    setShowErrorPopup(true);
  }
};




  return (
    <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">
          {/* HEADER */}
          {/* <div className="flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search Programmes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="ml-4 bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
            >
              <Plus size={18} /> New Programme
            </button>
          </div> */}

          {/* HEADER */}
<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

  {/* SEARCH */}
  <div className="relative w-full sm:max-w-md " >
    <Search
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      size={18}
    />
    <input
      type="text"
      placeholder="Search Programmes"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
    />
  </div>

  {/* BUTTON */}
  <button
    onClick={() => setShowModal(true)}
    className="w-full sm:w-auto bg-[#2EA1F2] text-white px-4 h-10 text-sm shadow font-bold rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors"
  >
    <Plus size={18} /> New Programme
  </button>

</div>

          {/* CARDS */}
          {loading && <p>Loading programmes...</p>}
{error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProgrammes.map((prog) => (
              <div
                key={prog._id}
                onClick={() => navigate(`/${rootPath}/programmes/${prog._id}`)}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="p-2 sm:p-2.5 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-[#2EA1F2] group-hover:text-white transition-colors">
                    <FileText />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-md uppercase tracking-tightext-xs bg-gray-100 px-2 py-1 rounded">
  {prog.projectCount || 0} projects
</span>
                </div>

                <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors break-words">
                  {prog.programmeName}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      </div>

      {/* SUCCESS */}
{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Background overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

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
        Programme Added Successfully
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        The programme has been successfully created.
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
        Programme Creation Failed
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        {errorMessage}
      </p>

    </div>
  </div>
)}



   
    {/* MODAL */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]  ">
          <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-500"
            >
              <X />
            </button>

            <h2 className="text-lg font-bold">
              Add New Programme
            </h2>
             <p className="text-sm font-sm mb-6 text-gray-400">
              Define a custom role with specific module access permissions.
            </p>

            <input
            required
              type="text"
              placeholder="Programme Name"
              className="w-full border rounded-lg p-2 mb-3"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <textarea
            required
              placeholder="Brief description about the programme..."
              className="w-full border rounded-lg p-2 mb-4"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
              className="bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
              >
                + Create
              </button>
            </div>
          </div>
        </div>
      )} */}
{/* MODAL */}
{showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
    
    <div className="bg-white w-full max-w-2xl rounded-xl p-6 relative shadow-lg">

      <button
        onClick={() => setShowModal(false)}
        className="absolute right-4 top-4 text-gray-500"
      >
        <X />
      </button>

      <h2 className="text-lg font-bold">
        Add New Programme
      </h2>

      <p className="text-sm font-sm mb-6 text-gray-400">
        Define a custom role with specific module access permissions.
      </p>

      {/* FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
      >
        <input
          required
          type="text"
          placeholder="Programme Name"
          className="w-full border rounded-lg p-2 mb-3"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <textarea
          required
          placeholder="Brief description about the programme..."
          className="w-full border rounded-lg p-2 mb-4"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-[#2EA1F2] text-white px-5 py-2 shadow font-bold text-md rounded-lg flex items-center gap-2 hover:bg-[#298CD2] transition-color"
          >
            + Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      </>
  );
};

export default Programme;