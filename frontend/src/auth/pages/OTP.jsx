import { useState, useRef } from "react";
import logo from "../../assets/logo.png";
import hero from "../../assets/hero.png";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const OTP = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");

const [timer, setTimer] = useState(59);
const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
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


  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }

    if (!value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputsRef.current[index - 1].focus();
      e.preventDefault();
    }
  };

 const handleSubmit = (e) => {
  e.preventDefault();

   // START LOADING
  setLoading(true);

  const enteredOtp = otp.join("");

  if (enteredOtp.length !== 6) {
    setError("Please enter all 6 digits");
     setLoading(false);
    return;
  }

  const email = localStorage.getItem("resetEmail");

  if (!email) {
    setError("Session expired. Try again.");
     setLoading(false);
    return;
  }


  localStorage.setItem("resetOtp", enteredOtp);

  setShowSuccess(true);

  setTimeout(() => {
    setShowSuccess(false);
     setLoading(false);
    navigate("/auth/confirm-password");
  }, 1500);
};


  useEffect(() => {
  if (timer === 0) {
    setCanResend(true);
    return;
  }

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timer]);

const handleResend = async () => {
  if (!canResend) return;

  const email = localStorage.getItem("resetEmail");

  try {
    await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    setTimer(59);
    setCanResend(false);
    setOtp(Array(6).fill(""));

  } catch (error) {
    console.error("Resend failed");
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
          <img
            src={logo}
            alt="logo"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
          />
        </div>

        {/* Title */}
       <h2 className="text-xl sm:text-xl font-bold text-center text-gray-700">
          Tarayana Information System
        </h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base font-semibold">
          Enter Verification Code
        </p>
        <p className="text-gray-500 text-xs sm:text-sm mt-2">
          We sent a 6-digit code to{" "}
          <span className="italic">example@email.com</span>
        </p>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} noValidate className="max-w-xl mx-auto w-full">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-6 mb-2 flex-wrap">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="
                  w-10 h-10 
                  sm:w-12 sm:h-12 
                  md:w-14 md:h-14 
                  text-center text-base sm:text-lg md:text-xl 
                  border border-gray-300 rounded-lg 
                  focus:ring-1 focus:ring-blue-400 outline-none
                "
              />
            ))}
          </div>
          {/* Error */}
          {error && <p className="text-red-500 text-sm mb-4 ">{error}</p>}

          {/* Resend Code */}
          <div className="flex justify-end mb-6">
           <p
  onClick={handleResend}
  className={`text-xs sm:text-sm ${
    canResend ? "text-blue-500 cursor-pointer" : "text-gray-400"
  }`}
>
  Resend Code ({timer}s)
</p>
          </div>

          {/* Verify Button */}
          {/* <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg shadow-lg font-semibold transition text-sm sm:text-base">
            Verify OTP
          </button> */}

                    <button
                    type="submit"
  disabled={loading}
  className={`w-full bg-[#2EA1F2] hover:bg-[#298CD2] text-white py-3 rounded-lg shadow-lg font-semibold transition ${
    loading
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-[#2EA1F2] hover:bg-[#298CD2] text-white"
  }`}
>
  {loading ? (" Verfying OTP...") : ("Verify OTP")}
</button>

        </form>

        {/* Back to Login */}
        <p
          onClick={() => navigate("/")}
          className="text-gray-500 text-xs sm:text-sm mt-5 cursor-pointer"
        >
          Back to Login
        </p>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

             {/* <div className="relative bg-white rounded-xl shadow-2xl px-6 sm:px-10 py-8 sm:py-10 text-center w-full max-w-xl animate-popup"> */}
<div className="relative bg-white rounded-xl shadow-2xl px-4 sm:px-10 py-6 sm:py-10 text-center w-[92%] sm:w-full max-w-md sm:max-w-xl animate-popup">


            <div className="flex items-center justify-center mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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

            <h2 className="text-base sm:text-lg font-semibold text-gray-700">
              OTP Verified Successfully
            </h2>
            <p className="text-gray-500 mt-2 text-xs sm:text-sm">
              Redirecting to reset password...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTP;