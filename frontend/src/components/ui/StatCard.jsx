import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const StatCard = ({ label, value, icon: Icon, colorClass, onClick, subValue }) => (
  <motion.div 
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    onClick={onClick}
    className={cn(
      "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-all cursor-pointer",
      onClick && "active:scale-95"
    )}
  >
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      
      {/* Renders the breakdown metrics (M/F, Done/Live) if provided */}
      {subValue && (
        <div className="mt-1">
          {subValue}
        </div>
      )}
    </div>
    
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", colorClass)}>
      <Icon size={24} />
    </div>
  </motion.div>
);

export default StatCard;