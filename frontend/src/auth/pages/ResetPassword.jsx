import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import logo from "../../assets/logo.png";
import hero from "../../assets/hero.png";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
    try {
      const res = await fetch(`${API_URL}/api/banner`);
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


  const validate = () => {
    let newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
      setLoading(true);
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrors({ general: data.message || "Something went wrong" });
      return;
    }

    setLoading(false);
    localStorage.setItem("resetEmail", email);

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigate("/auth/otp");
    }, 1500);

  } catch (error) {
    setLoading(false);
    setErrors({ general: "Server error" });
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
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative z-10 w-full md:max-w-2xl lg:max-w-3xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-8 sm:px-6 sm:py-10 text-center">
        
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="logo" className="w-24 h-24" />
        </div>

      <h2 className="text-xl sm:text-xl font-bold text-center text-gray-700">
          Tarayana Information System
        </h2>

        <p className="text-center text-gray-500 text-sm mt-1 font-semibold">
          Reset your password
        </p>

        <p className="text-center text-gray-500 text-sm mt-5 mb-6">
          Enter your registered email address and we will send you an OTP.
        </p>


 <form onSubmit={handleSubmit} noValidate className="max-w-xl mx-auto w-full">
          {/* Email */}
          <div className="mb-6">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email Address"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg bg-white/70 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-blue-400"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>
            )}
          </div>

          {/* Button */}
          {/* <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-lg font-semibold transition">
            Send OTP
          </button> */}
          <button
  disabled={loading}
  type="submit"
  className={`w-full bg-[#2EA1F2] hover:bg-[#298CD2] text-white py-3 rounded-lg shadow-lg font-semibold transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#2EA1F2] hover:bg-[#298CD2] text-white"
  }`}
>
  {loading ? (" Sending OTP...") : ("Send OTP")}
</button>
        </form>

        <p
          onClick={() => navigate("/")}
          className="text-center text-sm text-gray-500 mt-6 cursor-pointer"
        >
          Back to Login
        </p>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          {/* <div className="relative bg-white rounded-2xl shadow-2xl px-10 py-10 text-center w-[90%] max-w-md"> */}
<div className="relative bg-white rounded-xl shadow-2xl px-4 sm:px-10 py-6 sm:py-10 text-center w-[92%] sm:w-full max-w-md sm:max-w-xl animate-popup">

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
              OTP has been sent to your registered email address.
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Please check your inbox.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;