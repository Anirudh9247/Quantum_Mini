import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'emerald';
  isLoading?: boolean;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  variant = 'cyan',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const gradientStyles = {
    cyan: 'from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/25',
    purple: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25',
    emerald: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`py-3 px-5 bg-gradient-to-r ${gradientStyles[variant]} text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
