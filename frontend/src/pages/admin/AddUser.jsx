import { useEffect,useState } from "react";
import { useNavigate , useLocation} from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const AddUser = () => {
  const API_URL = import.meta.env.VITE_API_URL;

    const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];
const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

const [showError, setShowError] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
  
useEffect(() => {
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/roles/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
console.log(data.roles)
      if (!res.ok) return;


      // ✅ ONLY ALLOW THESE ROLES
 const allowedRoles = [
  "ProgrammeOfficer",
  "FieldOfficer",
  "M&ROfficer",
  "C&DOfficer",
  "Management"
];

const normalizeRole = (role) =>
  role.toLowerCase().replace(/\s+/g, "");

const filteredRoles = (data.roles || []).filter((r) =>
  allowedRoles.some(
    (allowed) =>
      normalizeRole(allowed) === normalizeRole(r.roleName)
  )
);

      // const filteredRoles = (data.roles || []).filter((r) =>
      //   allowedRoles.includes(r.roleName)
      // );


      setRoles(filteredRoles);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRoles();
  
}, []);

  // VALIDATION
  const validate = () => {
  let newErrors = {};

  if (!form.email) {
    newErrors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    newErrors.email = "Invalid email format";
  }

  // REMOVE OR COMMENT THIS OUT IF INPUTS ARE GONE
  /*
  if (!form.password) { ... }
  if (!form.confirm) { ... }
  */

  if (!form.role) {
    newErrors.role = "Please select a role";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

 const handleSubmit = async () => {
  if (!validate()) return;
  console.log("handle")

  try {
     setLoading(true);

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        roleName: form.role, // ✅ important fix
  
      }),
    });

    const data = await res.json();
    console.log("ROLES FROM BACKEND:", data.roles);

    if (!res.ok) {
       setLoading(false);

      setErrorMessage(data.message || "Error creating user");
setShowError(true);

setTimeout(() => {
  setShowError(false);
}, 2500);
      return;
    }

    setShowSuccess(true);
console.log("setshowsuccess")
    setTimeout(() => {
      setShowSuccess(false);
       setLoading(false);
      navigate("/admin/users");
    }, 2000);

  } catch (err) {
   setLoading(false);

setErrorMessage("Server error. Please try again.");
setShowError(true);

setTimeout(() => {
  setShowError(false);
}, 2500);

  }
};



  return (
    <>
<div className="w-full px-2 sm:px-2 lg:px-2 pb-6 space-y-6 overflow-x-hidden">

  

      {/* Main */}
<div className="w-full ">
  <div className="space-y-6">

          {/* Back */}
   <button onClick={() => navigate(-1)} 
                className="flex items-center text-gray-400 mb-6 text-sm hover:text-blue-500 transition-colors">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             Back to User Management
            </button>


          {/* CARD */}
          <div className="bg-white p-5 md:p-8 rounded-2xl shadow w-full">

            <h5 className="text-xl font-bold mb-6 text-gray-600">
              Add New User
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* EMAIL */}
              <div className="md:col-span-2">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className={`w-full border p-3 rounded-lg outline-none focus:ring-2 transition
                  ${errors.email ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

          

              {/* ROLE */}
              <div className="md:col-span-2">
<select
  value={form.role}
  onChange={(e) => setForm({ ...form, role: e.target.value })}
  className={`w-full border p-3 rounded-lg outline-none 
  focus:ring-2 transition text-sm sm:text-base
  ${errors.role ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
>
  <option value="">Select Role</option>

  {roles.map((r) => (
    <option key={r._id} value={r.roleName}>
      {r.roleName}
    </option>
  ))}
</select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                )}
              </div>
            </div>

            {/* BUTTONS */}
           <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
  <button
    type="button"
    onClick={() => navigate(-1)}
    className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition w-full sm:w-auto"
  >
    Cancel
  </button>

  <button 
    type="button" 
    onClick={handleSubmit}
     disabled={loading}
 className="w-full sm:w-auto bg-[#2EA1F2] text-white px-5 h-10 shadow font-bold text-md rounded-lg flex justify-center items-center gap-2 hover:bg-[#298CD2] transition-colors text-sm sm:text-base"
  >
    {/* + Create User */}
     {loading ? "+ Creating User..." : "+ Create User "}
  </button>


</div>
          </div>
        </div>
      </div>

</div>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-[100]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700">
              User Added Successfully
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              The user has been added.
            </p>
          </div>
        </div>
      )}


      {/* ERROR POPUP */}
{showError && (
  <div className="fixed inset-0 flex items-center justify-center z-[100]">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
      <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Error Icon */}
      <div className="flex justify-center mb-5">

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">

          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">

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
        Action Failed
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        {errorMessage}
      </p>

    </div>
  </div>
)}


      {/* Animation */}
      <style>
        {`
        .animate-scaleIn {
          animation: scaleIn 0.3s ease;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        `}
      </style>
    </>
  );
};

export default AddUser;