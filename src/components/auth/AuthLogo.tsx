
import React from 'react';

interface AuthLogoProps {
  className?: string;
  alt?: string;
}

export const AuthLogo: React.FC<AuthLogoProps> = ({ className = '', alt = 'Sai Balaji Construction' }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src="/lovable-uploads/a723c9c5-8174-41c6-b9d7-2d8646801ec6.png" 
        alt={alt} 
        className="h-12 w-auto object-contain" 
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/lovable-uploads/dec9f020-a443-46b8-9996-45dedd958103.png";
        }}
      />
      <span className="font-bold text-lg mt-2">Sai Balaji Construction</span>
    </div>
  );
};
