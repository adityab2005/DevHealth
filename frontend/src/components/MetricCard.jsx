import GlassCard from "./GlassCard";

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => {
  return (
    <GlassCard className="flex flex-col gap-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none"></div>
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold mt-2 tracking-tight text-white drop-shadow-sm">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl shadow-lg border border-white/10 ${colorClass} bg-opacity-20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={24} className="text-white drop-shadow-md" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2 mt-2 z-10">
          <span className={`text-sm font-bold tracking-wide ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </span>
          <span className="text-xs text-slate-500 font-medium tracking-wide">vs last week</span>
        </div>
      )}
    </GlassCard>
  );
};

export default MetricCard;