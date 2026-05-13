import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const Events = () => {
  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Annual Events</h3>
          <p className="text-sm text-gray-400">Manage annual events & activities</p>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3498db] text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 font-bold">
          <Plus size={20} />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Tarayana Fair', icon: <Calendar size={24} /> },
          { title: 'Annual Green Tech Challenge', icon: <Calendar size={24} /> },
          { title: 'Annual Pilgrimage', icon: <Calendar size={24} /> },
        ].map((event, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)" }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-100 transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              {event.icon}
            </div>
            <h4 className="font-bold text-gray-900">{event.title}</h4>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Events;
