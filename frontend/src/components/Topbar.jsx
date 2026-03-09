import { Bell, Search, User } from "lucide-react";

const Topbar = () => {
  return (
    <header className="h-20 glass m-4 mb-0 flex items-center justify-between px-6 border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-full max-w-md hidden sm:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={18} className="text-slate-400" />
          </span>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 transition-all duration-300"
            placeholder="Search metrics, builds, or issues..."
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-300 hover:text-white transition-colors duration-300 group">
          <Bell size={20} className="group-hover:scale-110 transition-transform" />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.5)]"></span>
          </span>
        </button>
        <div className="flex items-center gap-3 border-l border-white/10 pl-6 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Admin User</p>
            <p className="text-xs text-slate-400 tracking-wide font-medium">DevOps Manager</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[2px] shadow-lg group-hover:scale-[1.05] transition-transform">
             <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
                 <User size={18} className="text-white" />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;