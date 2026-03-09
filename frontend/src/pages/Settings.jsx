import GlassCard from "../components/GlassCard";
import { Github, Play, LayoutList, ChevronRight } from "lucide-react";

const integrations = [
  { id: "github", name: "GitHub", description: "Connect to repositories to track PRs, commits, and code changes.", icon: Github, connected: true, color: "text-white bg-black/50" },
  { id: "ci", name: "CI/CD Pipeline", description: "Integrate with Jenkins, GitHub Actions, or GitLab CI for build metrics.", icon: Play, connected: false, color: "text-blue-400 bg-blue-500/20" },
  { id: "jira", name: "Jira / Linear", description: "Sync issues, bugs, and sprint data directly to the dashboard.", icon: LayoutList, connected: false, color: "text-indigo-400 bg-indigo-500/20" },
];

const Settings = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 fade-in">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-300 via-white to-slate-400 tracking-tight drop-shadow-sm">Settings & Integrations</h1>
        <p className="text-slate-400 mt-2 font-medium tracking-wide">Configure your workspace and connect external tools.</p>
      </div>

      <GlassCard>
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wide mb-6">Connected Services</h3>
        <div className="space-y-4">
          {integrations.map((integration) => {
             const Icon = integration.icon;
             return (
              <div key={integration.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className={`p-3 rounded-xl shadow-lg border border-white/10 ${integration.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="drop-shadow-md" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100 mb-1">{integration.name} <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-inner border tracking-wider align-middle ${integration.connected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>{integration.connected ? 'CONNECTED' : 'DISCONNECTED'}</span></h4>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">{integration.description}</p>
                  </div>
                </div>
                <button className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg border ${
                    integration.connected 
                    ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' 
                    : 'bg-indigo-500/80 text-white border-indigo-400/50 hover:bg-indigo-400 hover:scale-105 shadow-indigo-500/25'
                }`}>
                  {integration.connected ? 'Configure' : 'Connect'}
                  <ChevronRight size={16} className={integration.connected ? 'hidden' : ''} />
                </button>
              </div>
          )})}
        </div>
      </GlassCard>
      
      <GlassCard className="opacity-70 pointer-events-none">
        <h3 className="text-xl font-bold text-slate-400 tracking-wide mb-6 flex justify-between items-center">
            Workspace Preferences
            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded border border-amber-500/30 text-amber-500 tracking-widest bg-amber-500/10">Coming Soon</span>
        </h3>
        <div className="space-y-4 filter blur-[1px]">
            <div className="h-12 bg-white/5 rounded-xl border border-white/5"></div>
            <div className="h-12 w-2/3 bg-white/5 rounded-xl border border-white/5"></div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Settings;