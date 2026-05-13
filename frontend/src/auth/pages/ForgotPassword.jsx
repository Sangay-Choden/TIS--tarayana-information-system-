import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';
import Button from '../../components/ui/Button';
import hero from "../../assets/hero.png";
import logo from "../../assets/logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  const Content = () => {
    if (isSubmitted) {
      return (
        <div className="space-y-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 mx-auto">
            <Mail size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Check your email</h1>
            <p className="text-gray-500">
              We've sent a password reset link to <span className="text-gray-900 font-bold">{email}</span>
            </p>
          </div>
          <Button 
            variant="secondary" 
            className="w-full py-4 rounded-2xl"
            onClick={() => navigate('/auth/login')}
          >
            Back to Login
          </Button>
          <p className="text-sm text-gray-400">
            Didn't receive the email?{' '}
            <button className="text-blue-500 font-bold hover:text-blue-600 transition-colors">Click to resend</button>
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <button 
          onClick={() => navigate('/auth/login')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Login</span>
        </button>

        <div className="space-y-2">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 mx-auto lg:mx-0">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot Password?</h1>
          <p className="text-gray-500">No worries, we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@tarayana.bt"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 rounded-2xl text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    );
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
      <div className="relative z-10 w-full md:max-w-2xl lg:max-w-3xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="logo" className="w-24 h-24" />
        </div>
        <div className="max-w-xl mx-auto w-full text-center lg:text-left">
          <Content />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
