import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  glow?: 'cyan' | 'purple' | 'pink' | 'none';
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, icon, glow = 'none', onClick }) => {
  const glowClasses = {
    cyan: 'shadow-[0_0_20px_rgba(0,243,255,0.15)] border-neon-cyan/30',
    purple: 'shadow-[0_0_20px_rgba(176,38,255,0.15)] border-neon-purple/30',
    pink: 'shadow-[0_0_20px_rgba(255,0,170,0.15)] border-neon-pink/30',
    none: 'border-white/10'
  };

  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 border transition-all duration-300 hover:bg-white/5 ${glowClasses[glow]} ${className}`}
    >
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4 border-b border-white/5 pb-2">
          {icon && <span className="text-white/80">{icon}</span>}
          {title && <h3 className="text-sm font-semibold tracking-wide text-white/90">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  );
};

export default GlassCard;