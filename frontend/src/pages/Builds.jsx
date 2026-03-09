import GlassCard from "../components/GlassCard";
import ChartCard from "../components/ChartCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const buildHistory = [
  { id: "#4021", status: "success", branch: "main", commit: "Fixed auth issue",  duration: "2m 14s", time: "10 min ago" },
  { id: "#4020", status: "success", branch: "feature/nav", commit: "Added new navigation",  duration: "1m 58s", time: "1 hour ago" },
  { id: "#4019", status: "failed", branch: "main", commit: "Update dependencies",  duration: "4m 12s", time: "3 hours ago" },
  { id: "#4018", status: "success", branch: "hotfix/api", commit: "Fixed API timeout",  duration: "2m 05s", time: "5 hours ago" },
  { id: "#4017", status: "success", branch: "main", commit: "Merge PR #142",  duration: "2m 30s", time: "1 day ago" },
];

const buildDurationData = [
  { name: "#4017", duration: 150 },
  { name: "#4018", duration: 125 },
  { name: "#4019", duration: 252 },
  { name: "#4020", duration: 118 },
  { name: "#4021", duration: 134 },
];

const Builds = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300 tracking-tight drop-shadow-sm">Builds</h1>
        <p className="text-slate-400 mt-2 font-medium tracking-wide">Monitor continuous integration pipelines and build performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Build Duration Trend">
           <ResponsiveContainer width="100%" height={300}>
              <BarChart data={buildDurationData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                 <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                 <Bar dataKey="duration" fill="url(#colorDuration)" radius={[4, 4, 0, 0]} name="Duration (s)">
                    <defs>
                      <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                 </Bar>
              </BarChart>
           </ResponsiveContainer>
        </ChartCard>

        <GlassCard className="h-[432px]">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wide mb-6">Recent Builds</h3>
          <div className="space-y-4 overflow-y-auto h-[320px] pr-2 custom-scrollbar">
            {buildHistory.map((build) => (
              <div key={build.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${build.status === 'success' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{build.id} <span className="text-slate-500 font-medium ml-2">{build.commit}</span></h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{build.branch} • {build.time}</p>
                  </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/5 shadow-inner">{build.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Builds;