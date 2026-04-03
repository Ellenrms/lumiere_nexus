import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'premium' | 'outline' | 'flat';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'premium', 
  className = "", 
  ...props 
}) => {
  const baseStyles = "rounded-[12px] p-6 transition-all duration-300";
  
  const variants = {
    premium: "bg-white/80 backdrop-blur-sm shadow-premium border border-white/20 hover:shadow-lg",
    outline: "bg-transparent border border-sand hover:border-champagne",
    flat: "bg-sand/30"
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
