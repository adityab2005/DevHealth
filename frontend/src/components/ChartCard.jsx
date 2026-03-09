import GlassCard from "./GlassCard";

const ChartCard = ({ title, children, className = "" }) => {
  return (
    <GlassCard className={`flex flex-col relative overflow-hidden group ${className}`}>
        <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-purple-500/10"></div>
      <div className="flex justify-between items-center mb-6 z-10 border-b border-white/5 pb-4">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wide">{title}</h3>
      </div>
      <div className="flex-1 w-full min-h-[300px] z-10">
        {children}
      </div>
    </GlassCard>
  );
};

export default ChartCard;