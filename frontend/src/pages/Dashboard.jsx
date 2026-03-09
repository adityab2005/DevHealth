import MetricCard from "../components/MetricCard";
import ChartCard from "../components/ChartCard";
import AlertsPanel from "../components/AlertsPanel";
import { CheckCircle2, ShieldAlert, BugPlay, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { mockMetrics, buildTrendData, coverageTrendData, issueDistributionData } from "../data/mockMetrics";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const COLORS = ['#ef4444', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white to-purple-300 tracking-tight drop-shadow-sm">Dashboard Overview</h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide">Real-time health metrics for your software stack.</p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 shadow-lg backdrop-blur-md hidden sm:flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
          <span className="text-sm font-bold text-green-300 tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Build Success" value={`${mockMetrics.buildSuccessRate}%`} icon={CheckCircle2} trend="up" trendValue="2.4%" colorClass="bg-green-500" />
        <MetricCard title="Test Coverage" value={`${mockMetrics.coverage}%`} icon={ShieldAlert} trend="down" trendValue="0.8%" colorClass="bg-indigo-500" />
        <MetricCard title="Open Issues" value={mockMetrics.openIssues} icon={BugPlay} trend="down" trendValue="12" colorClass="bg-amber-500" />
        <MetricCard title="Failed Builds" value={mockMetrics.failedBuilds} icon={Activity} trend="up" trendValue="3" colorClass="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Build Trend" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={buildTrendData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="success" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorSuccess)" name="Successful Builds" />
                <Area type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFailure)" name="Failed Builds" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Coverage Trend">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coverageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }} />
                  <Line type="monotone" dataKey="coverage" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#1e1b4b' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#818cf8', shadow: '0 0 10px #818cf8' }} name="Coverage %" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Issue Distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={2}
                  >
                    {issueDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-6">
                 {issueDistributionData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                       <span className="text-xs font-semibold text-slate-300">{entry.name}</span>
                    </div>
                 ))}
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;