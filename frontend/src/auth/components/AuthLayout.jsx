import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'motion/react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
        
        {/* Left Side - Visual/Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-[#3498db] relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-[#3498db]">T</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Tarayana</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white leading-tight"
            >
              Empowering <br />
              Communities, <br />
              Changing Lives.
            </motion.h2>
            <p className="text-blue-50/80 text-lg max-w-sm leading-relaxed">
              Join our mission to support rural development and social welfare across Bhutan.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#3498db] bg-gray-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-blue-100 text-sm font-medium">
              Trusted by <span className="text-white font-bold">500+</span> field officers
            </p>
          </div>
        </div>

        {/* Right Side - Form Content */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
          
          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-medium">
              © 2026 Tarayana Foundation
            </p>
            <div className="flex gap-6">
              <button className="text-xs text-gray-400 hover:text-gray-600 font-bold transition-colors">Privacy</button>
              <button className="text-xs text-gray-400 hover:text-gray-600 font-bold transition-colors">Terms</button>
              <button className="text-xs text-gray-400 hover:text-gray-600 font-bold transition-colors">Help</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
