import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileCode2, Bug, ShieldCheck, Settings } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Builds", path: "/builds", icon: FileCode2 },
    { name: "Issues", path: "/issues", icon: Bug },
    { name: "Code Quality", path: "/code-quality", icon: ShieldCheck },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 glass m-4 mr-0 flex flex-col justify-between hidden md:flex border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] h-[calc(100vh-2rem)]">
      <div>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center">
            <span className="font-bold text-white tracking-widest text-sm">DH</span>
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 tracking-wide">DevHealth</h2>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-white/20 shadow-lg text-white"
                      : "text-slate-400 hover:bg-white/10 hover:text-white hover:scale-[1.02]"
                  }`
                }
              >
                <Icon size={20} className="mb-0.5" />
                <span className="font-medium tracking-wide">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 m-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent">
        <p className="text-xs text-slate-400 font-medium pb-2 text-center">System Overview</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_2px_rgba(34,197,94,0.5)]"></div>
          <span className="text-sm font-semibold text-green-400 tracking-wide">All Systems Operational</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;