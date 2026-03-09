const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`glass-card p-6 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;