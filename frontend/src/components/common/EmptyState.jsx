import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ title = "No data found", message = "There is no information to display at this time." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="p-4 bg-gray-50 rounded-full mb-4">
        <FileQuestion size={48} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 max-w-xs mx-auto mt-2">{message}</p>
    </div>
  );
};

export default EmptyState;
