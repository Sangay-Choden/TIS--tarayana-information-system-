import React from 'react';
import { cn } from '../../lib/utils';

const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-gray-100", className)}>
    {children}
  </div>
);

export const CardContent = ({ children, className }) => (
  <div className={cn("p-6", className)}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }) => (
  <div className={cn("px-6 py-4 bg-gray-50/50 border-t border-gray-100", className)}>
    {children}
  </div>
);

export default Card;
