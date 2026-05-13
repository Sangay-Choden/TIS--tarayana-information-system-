import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  return (
    // <AnimatePresence>
    //   {isOpen && (
    //     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    //       <motion.div
    //         initial={{ opacity: 0 }}
    //         animate={{ opacity: 1 }}
    //         exit={{ opacity: 0 }}
    //         onClick={onClose}
    //         className="absolute inset-0 bg-black/20 backdrop-blur-sm"
    //       />
    //       <motion.div
    //         initial={{ opacity: 0, scale: 0.9, y: 20 }}
    //         animate={{ opacity: 1, scale: 1, y: 0 }}
    //         exit={{ opacity: 0, scale: 0.9, y: 20 }}
    //         className="relative bg-white rounded-[32px] p-8 shadow-2xl max-w-lg w-full space-y-6"
    //       >
    //         <div className="space-y-2">
    //           <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
    //           <p className="text-gray-500 text-sm leading-relaxed">
    //             {description}
    //           </p>
    //         </div>
            
    //         <div className="flex gap-4 pt-4">
    //           <button
    //             onClick={onClose}
    //             className="flex-1 py-3 px-6 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
    //           >
    //             Cancel
    //           </button>
    //           <button
    //             onClick={onConfirm}
    //             className="flex-1 py-3 px-6 bg-[#b03a2e] text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200"
    //           >
    //             Delete
    //           </button>
    //         </div>
    //       </motion.div>
    //     </div>
    //   )}
    // </AnimatePresence>
    <AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-xl p-6 w-full max-w-xl shadow-xl"
      >
        
        <h2 className="text-lg font-semibold mb-2 text-gray-900">
          {title}
        </h2>

        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#AA3333] text-white rounded-lg hover:bg-[#922b21] transition-all"
          >
            Delete
          </button>
        </div>
      </motion.div>

    </div>
  )}
</AnimatePresence>
  );
};

export default DeleteConfirmModal;
