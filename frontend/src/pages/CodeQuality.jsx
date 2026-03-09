import GlassCard from "../components/GlassCard";
import ChartCard from "../components/ChartCard";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";

const staticAnalysisMetrics = [
  { metric: "Code Smells", value: 124, trend: "down" },
  { metric: "Vulnerabilities", value: 3, trend: "same" },
  { metric: "Duplications", value: "4.2%", trend: "up" },
  { metric: "Complexity", value: "12.5", trend: "down" },
  { metric: "Bugs", value: 18, trend: "down" },
];

const qualityRadarData = [
  { subject: 'Reliability', A: 85, fullMark: 100 },
  { subject: 'Security', A: 98, fullMark: 100 },
  { subject: 'Maintainability', A: 76, fullMark: 100 },
  { subject: 'Coverage', A: 78, fullMark: 100 },
  { subject: 'Duplications', A: 88, fullMark: 100 },
  { subject: 'Complexity', A: 65, fullMark: 100 },
];

const CodeQuality = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-white to-cyan-300 tracking-tight drop-shadow-sm">Code Quality</h1>
        <p className="text-slate-400 mt-2 font-medium tracking-wide">Monitor static analysis metrics, code smells, and security issues.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="h-[432px]">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-wide mb-6">Static Analysis Overview</h3>
          <div className="grid grid-cols-2 gap-4 h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {staticAnalysisMetrics.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 flex flex-col justify-center items-center text-center group">
                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-cyan-300 transition-colors">{item.metric}</p>
                 <h4 className="text-3xl font-extrabold text-white drop-shadow-md tracking-tight mb-2">{item.value}</h4>
                 <div className="flex items-center gap-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-inner border tracking-wider ${
                        item.trend === 'down' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                        item.trend === 'up' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                        'bg-slate-500/20 text-slate-400 border-slate-500/30'
                     }`}>
                        {item.trend === 'down' ? '↓ IMPROVING' : item.trend === 'up' ? '↑ WORSENING' : '— STABLE'}
                     </span>
                 </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <ChartCard title="Quality Dimensions Profile">
           <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityRadarData}>
                  <PolarGrid stroke="#ffffff20" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', backdropFilter: 'blur(10px)' }} />
                </RadarChart>
              </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default CodeQuality;