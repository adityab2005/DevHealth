import GlassCard from "../components/GlassCard";
import ChartCard from "../components/ChartCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const issueBacklog = [
  { id: "PROJ-102", title: "Memory leak in dashboard", priority: "High", status: "Open", assignee: "Alex" },
  { id: "PROJ-105", title: "Add export functionality", priority: "Medium", status: "In Progress", assignee: "Sam" },
  { id: "PROJ-107", title: "Update dependencies", priority: "Low", status: "Open", assignee: "Unassigned" },
  { id: "PROJ-110", title: "Fix alignment on mobile", priority: "High", status: "In Progress", assignee: "Jordan" },
  { id: "PROJ-112", title: "API rate limiting issue", priority: "Critical", status: "Open", assignee: "Alex" },
];

const resolutionTimeData = [
  { name: "Week 1", time: 4.2 },
  { name: "Week 2", time: 3.8 },
  { name: "Week 3", time: 4.5 },
  { name: "Week 4", time: 3.1 },
  { name: "Week 5", time: 2.8 },
];

const Issues = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-white to-orange-300 tracking-tight drop-shadow-sm">Issues</h1>
        <p className="text-slate-400 mt-2 font-medium tracking-wide">Track bug reports, feature requests, and resolution metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="h-[432px]">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wide mb-6">Active Issue Backlog</h3>
          <div className="space-y-4 overflow-y-auto h-[320px] pr-2 custom-scrollbar">
            {issueBacklog.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-slate-400 bg-black/20 px-2 py-0.5 rounded-md border border-white/5">{issue.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider shadow-inner ${
                            issue.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                            issue.priority === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                            issue.priority === 'Medium' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                            'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>{issue.priority}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{issue.title}</h4>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/5 shadow-inner">{issue.status}</span>
                     <span className="text-xs text-slate-500 font-medium tracking-wide border-b border-dashed border-slate-500/50 pb-0.5">{issue.assignee}</span>
                  </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <ChartCard title="Resolution Time Trend (Days)">
           <ResponsiveContainer width="100%" height={300}>
                <LineChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }} />
                  <Line type="stepAfter" dataKey="time" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#1e1b4b' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#fcd34d', shadow: '0 0 10px #fcd34d' }} name="Avg Days" />
                </LineChart>
              </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Issues;