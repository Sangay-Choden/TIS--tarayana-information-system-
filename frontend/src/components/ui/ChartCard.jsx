import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ChartCard = ({ 
  title, 
  subtitle, 
  data = [], 
  filterOptions = [], 
  activeFilterId, 
  onOptionSelect,
  yAxisLabel = "Count"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Colors matching your image: Blue, Green, Yellow, Orange, etc.
  const colors = ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#2980b9', '#9b59b6'];

  const currentFilterLabel = filterOptions?.find(opt => opt.id === activeFilterId)?.label || 'Select Filter';

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative transition-all">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
  {title}
</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
        </div>

        {/* Dropdown Filter */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
       className="flex items-center gap-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all w-full sm:min-w-[160px] sm:w-auto justify-between shadow-sm"
          >
            <span className="truncate">{currentFilterLabel}</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in duration-150">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activeFilterId === option.id 
                        ? 'text-blue-600 font-bold bg-blue-50' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      onOptionSelect(option.id);
                      setIsOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

     <div className="h-64 w-full relative overflow-x-auto">
        {/* Y Axis Label */}
        {/* <div className="absolute -left-12 top-1/2 -rotate-90 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap"> */}
      <div className="absolute -left-5 sm:-left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
          {yAxisLabel}
        </div>

     <div className="min-w-[500px] h-full">
  <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
           tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 10 }} 
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
         <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
      
      {/* X Axis Label */}
      <div className="mt-8 text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {currentFilterLabel} Categories
      </div>
    </div>
  );
};

export default ChartCard;