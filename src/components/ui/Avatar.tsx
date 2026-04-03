import React from "react";

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = "" 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-2xl"
  };

  if (src) {
    return (
      <div className={`
        relative overflow-hidden rounded-full border border-sand 
        ${sizes[size]} ${className}
      `}>
        <img src={src} alt={name} className="object-cover w-full h-full" />
      </div>
    );
  }

  return (
    <div className={`
      flex items-center justify-center rounded-full bg-sand text-mahogany font-serif
      border border-sand shadow-sm
      ${sizes[size]} ${className}
    `}>
      {getInitials(name)}
    </div>
  );
};
