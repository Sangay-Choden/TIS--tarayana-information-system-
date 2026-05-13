import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import logo from "../../assets/logo.png";
import hero from "../../assets/hero.png";
import { useNavigate } from "react-router-dom";

const ConfirmPassword = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
const [showErrorPopup, setShowErrorPopup] = useState(false);
const [errorMessage, setErrorMessage] = useState("");

  // ✅ Strong Password Regex
  const strongPasswordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
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


  // ✅ Live validation function
  const validateField = (name, value, currentPassword, currentConfirm) => {
    let newErrors = { ...errors };

    if (name === "password") {
      if (!value) {
        newErrors.password = "New password is required";
      } else if (!strongPasswordRegex.test(value)) {
        newErrors.password =
          "Password must be at least 8 characters and include letters, numbers, and special characters";
      } else {
        delete newErrors.password;
      }

      // also re-check confirm password when password changes
      if (currentConfirm) {
        if (value !== currentConfirm) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Confirm your password";
      } else if (value !== currentPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const validate = () => {
    let newErrors = {};

    if (!password) {
      newErrors.password = "New password is required";
    } else if (!strongPasswordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters and include letters, numbers, and special characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (password !== confirmPassword) {
     setErrorMessage("Passwords do not match");
setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);

setLoading(false);
return;
    }

    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("resetOtp");

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
      setErrorMessage(data.message || "Password reset failed");
setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);

setLoading(false);
return;
      }

    
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");

     setShowSuccess(true);

setTimeout(() => {
  setShowSuccess(false);
  navigate("/auth/login");
}, 2000);

    } catch (err) {
      setErrorMessage("Server error. Please try again.");
setShowErrorPopup(true);

setTimeout(() => {
  setShowErrorPopup(false);
}, 2000);

setLoading(false);
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
      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full md:max-w-2xl lg:max-w-3xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-8 sm:px-6 sm:py-10 text-center">
        
        <div className="flex justify-center mb-5">
          <img src={logo} alt="logo" className="w-24 h-24" />
        </div>

       <h2 className="text-xl sm:text-xl font-bold text-center text-gray-700">
          Tarayana Information System
        </h2>

        <p className="text-center text-gray-500 text-sm mt-1 mb-6 font-semibold">
          Set New Password
        </p>

        <form onSubmit={handleSubmit} noValidate className="max-w-xl mx-auto w-full">
          
          {/* New Password */}
          <div className="mb-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter New Password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  validateField("password", value, value, confirmPassword);
                }}
                className={`w-full pl-11 pr-11 py-3 border rounded-lg bg-white/70 focus:outline-none focus:ring-1 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-blue-400"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {/* {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} */}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 text-left">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmPassword(value);
                  validateField("confirmPassword", value, password, value);
                }}
                className={`w-full pl-11 pr-11 py-3 border rounded-lg bg-white/70 focus:outline-none focus:ring-1 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-blue-400"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {/* {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />} */}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 text-left">
                {errors.confirmPassword}
              </p>
            )}
          </div>

                 <button
  disabled={loading}
  type="submit"
  className={`w-full bg-[#2EA1F2] hover:bg-[#298CD2] text-white py-3 rounded-lg shadow-lg font-semibold transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#2EA1F2] hover:bg-[#298CD2] text-white"
  }`}
>
  {loading ? (" Resetting Password...") : ("Reset Password")}
</button>
        </form>

        <p
          onClick={() => navigate("/auth/login")}
          className="text-center text-sm text-gray-500 mt-6 cursor-pointer"
        >
          Back to Login
        </p>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

              <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">
            
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700">
              Password Reset Successfully
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Redirecting to login...
            </p>
          </div>
        </div>
      )}



      {showErrorPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

    {/* Card */}
    <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup">

      {/* Error Icon */}
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
        {errorMessage}
      </p>

    </div>
  </div>
)}

    </div>
  );
};

export default ConfirmPassword;