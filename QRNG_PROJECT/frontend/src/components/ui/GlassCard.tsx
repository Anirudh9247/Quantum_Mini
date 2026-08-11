import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glow' | 'purple';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'glass-panel',
    glow: 'glass-panel-glow',
    purple: 'glass-panel-purple',
  };

  return (
    <div className={`${variantStyles[variant]} p-6 relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
