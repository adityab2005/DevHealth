import GlassCard from "./GlassCard";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { recentAlerts } from "../data/mockMetrics";

const AlertIcon = ({ type }) => {
  switch (type) {
    case 'danger':
      return <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.4)]"><AlertCircle size={20} className="text-red-400 drop-shadow-sm" /></div>;
    case 'warning':
      return <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]"><AlertTriangle size={20} className="text-amber-400 drop-shadow-sm" /></div>;
    default:
      return <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)]"><Info size={20} className="text-blue-400 drop-shadow-sm" /></div>;
  }
};

const AlertsPanel = () => {
  return (
    <GlassCard className="h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex items-center justify-between mb-6 z-10">
        <h3 className="text-lg font-bold text-white tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Recent Alerts</h3>
        <span className="text-xs font-semibold px-3 py-1 bg-white/10 rounded-full text-slate-300 border border-white/5 shadow-inner">
          {recentAlerts.length} New
        </span>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 z-10 custom-scrollbar">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
            <AlertIcon type={alert.type} />
            <div>
              <p className="text-sm font-medium text-slate-200 leading-snug group-hover:text-white transition-colors">{alert.message}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide">Just now</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default AlertsPanel;