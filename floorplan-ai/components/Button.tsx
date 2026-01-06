import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyles = "font-hand text-xl px-6 py-2 transition-all transform duration-150 active:scale-95 border-2 border-ink flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#e8dfd6] hover:bg-[#dcd0c0] shadow-sketch hover:shadow-sketch-hover",
    secondary: "bg-white hover:bg-gray-50 shadow-sketch hover:shadow-sketch-hover",
    icon: "p-2 rounded-full hover:bg-gray-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
