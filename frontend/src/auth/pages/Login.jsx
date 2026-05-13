import {  useEffect,useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import bgImage from "../../assets/hero.png";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
       const { pathname } = useLocation();
   const rootPath = pathname.split('/')[1];

    const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
const [bgImage, setBgImage] = useState("");

useEffect(() => {
  const fetchBanner = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/banner");
    const data = await res.json();

    console.log("BANNER API RESPONSE:", data);

    if (data && data.imageUrl) {
      setBgImage(data.imageUrl);
    } else {
      console.warn("No banner found in DB");
      setBgImage(""); // fallback
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  fetchBanner();
}, []);

  // ✅ Custom validation
  const validate = () => {
    let newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email should be a valid format (e.g. user@gmail.com)";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;
 setLoading(true); // 🔵 start loader

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

if (!response.ok) {
  setErrors({ general: data.message || "Login failed" });
  setLoading(false);
  return;
}

    // 1. Store auth data
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 2. Show success popup
    setTimeout(() => {
      setLoading(false);
    setShowSuccess(true);

    }, 700); // slight delay before showing success
    // 3. Conditional Navigation based on Role
    setTimeout(() => {
      setShowSuccess(false);
      
      const userRole = data.user?.role; // Assuming your backend returns { user: { role: 'PO', ... } }


if (
  userRole === "Admin" ||
  userRole === "admin"
) {
  navigate("/admin/dashboard");

} else if (
  userRole === "ProgrammeOfficer" ||
  userRole === "Programme Officer"
) {
  navigate("/po/dashboard");

} else if (
  userRole === "FieldOfficer" ||
  userRole === "Field Officer"
) {
  navigate("/fo/dashboard");

// } else if (
//   userRole === "C&DOfficer" ||
//   userRole === "CD Officer"
// ) {
//   navigate("/cd/dashboard");

// } else if (
//   userRole === "M&EOfficer" ||
//   userRole === "MR Officer"
// ) {
//   navigate("/mr/dashboard");
} else if (
  userRole === "C&DOfficer" ||
  userRole === "CD Officer" ||
  userRole === "M&ROfficer" ||
  userRole === "M&R Officer" ||
  userRole === "M&EOfficer" ||
  userRole === "MR Officer"
) {
  navigate("/cd/dashboard");

} else if (
  userRole === "Management"
) {
  navigate("/mgmt/dashboard");

} else {
  navigate("/dashboard");
}


    }, 3000);

  } catch (error) {
    console.error(error);
    setErrors({ general: "Server error. Try again." });
  }
};
  

   return (
   <div
  className="relative w-full min-h-screen flex items-center justify-center px-4"
  style={{
    backgroundImage: bgImage ? `url(${bgImage})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/25 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-10 w-full md:max-w-xl lg:max-w-3xl bg-white/80 backdrop-blur-xl rounded-xl shadow-2xl px-4 py-8 sm:px-6 sm:py-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src={logo} alt="logo" className="w-28 h-28" />
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-xl font-bold text-center text-gray-700">
          Tarayana Information System
        </h2>
        <p className="text-center text-gray-500 text-sm mt-1 mb-6 font-semibold">
          Login to your account to continue
        </p>

       <form onSubmit={handleSubmit} noValidate className="max-w-xl mx-auto w-full">
{errors.general && (
  <p className="text-red-500 text-center mb-4">{errors.general}</p>
)}
          {/* Email */}
          <div className="mb-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
               className={`w-full pl-12 pr-4 py-3 text-sm border rounded-lg bg-white/70 focus:outline-none focus:ring-2 ${
  errors.email ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className={`w-full pl-11 pr-11 py-2.5 text-sm border rounded-lg bg-white/70 focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500 focus:ring-red-400" : "focus:ring-blue-400"
                }`}
              />

              {/* <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button> */}
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me (BIGGER) */}
          <div className="flex items-center mb-6 text-sm text-gray-600">
            <input
              type="checkbox"
              className="mr-2 w-5 h-5 accent-blue-500 cursor-pointer"
            />
            Remember me
          </div>

          {/* Button (BOLD TEXT) */}
          {/* <button className="w-full bg-[#2EA1F2] hover:bg-[#298CD2] text-white py-3 rounded-lg shadow-lg font-semibold transition">
            Login
          </button> */}
<button
  disabled={loading}
  className={`w-full bg-[#2EA1F2] hover:bg-[#298CD2] text-white py-3 rounded-lg shadow-lg font-semibold transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#2EA1F2] hover:bg-[#298CD2] text-white"
  }`}
>
  {loading ? (" Logging in...") : ("Login")}
</button>


        </form>

        {/* Forgot */}
        <p 
        onClick={() => navigate("/auth/forgot-password")}
        className="text-center text-sm text-gray-500 mt-5 cursor-pointer ">
          Forgot your Password?
        </p>
      </div>


{/* {showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    
  
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    <div className="relative bg-white rounded-2xl shadow-2xl px-10 py-10 text-center w-[90%] max-w-md animate-fadeIn">
      
  
      <div className="flex items-center justify-center mb-5">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

  
      <h2 className="text-xl font-semibold text-gray-700">
        Login Successful
      </h2>
      <p className="text-gray-500 mt-2 text-sm">
        Redirecting to dashboard...
      </p>
    </div>
  </div>
)} */}

{showSuccess && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

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
        Login Successful
      </h2>

      <p className="text-gray-500 mt-2 text-sm">
        Redirecting to dashboard...
      </p>

    </div>
  </div>
)}

{loading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* Soft blur background */}
    <div className="absolute inset-0 bg-white/10 backdrop-blur-md"></div>

    {/* Loader */}
    <div className="relative flex flex-col items-center">

      {/* Soft blue rotating ring */}
      <div className="w-20 h-20 border-[6px] border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>

      {/* Optional glow effect */}
      <div className="absolute w-20 h-20 rounded-full bg-blue-300 opacity-20 blur-xl"></div>

      {/* Text */}
      <p className="mt-6 text-gray-600 text-sm font-medium tracking-wide">
        Logging you in...
      </p>

    </div>
  </div>
)}




    </div>
  );
};

export default Login;