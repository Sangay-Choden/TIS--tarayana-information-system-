import React from 'react';
import { cn } from '../../lib/utils';

const Table = ({ children, className }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-left border-collapse", className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children, className }) => (
  <thead className={cn("bg-gray-50/50 border-b border-gray-100", className)}>
    {children}
  </thead>
);

export const TableBody = ({ children, className }) => (
  <tbody className={cn("divide-y divide-gray-50", className)}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, onClick }) => (
  <tr 
    onClick={onClick}
    className={cn(
      "transition-colors",
      onClick && "cursor-pointer hover:bg-blue-50/30",
      className
    )}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className }) => (
  <th className={cn("px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider", className)}>
    {children}
  </th>
);

export const TableCell = ({ children, className }) => (
  <td className={cn("px-6 py-4 text-sm text-gray-600", className)}>
    {children}
  </td>
);

export default Table;
