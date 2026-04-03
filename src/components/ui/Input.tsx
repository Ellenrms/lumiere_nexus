import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = "", 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] font-bold text-ebony uppercase tracking-[0.15em] pl-1">
          {label}
        </label>
      )}
      <input 
        className={`
          w-full px-4 py-3 rounded-[8px] bg-white border border-sand 
          text-ebony placeholder:text-mid-gray outline-none transition-all
          focus:border-champagne focus:ring-2 focus:ring-champagne/10
          disabled:bg-sand/30 disabled:cursor-not-allowed
          ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium pl-1">
          {error}
        </span>
      )}
    </div>
  );
};
