import React, { useMemo } from 'react';
import { ShieldAlert, Bug, Activity, ShieldCheck, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const getSeverityInfo = (title, value) => {
  if (title === 'Coverage') {
    if (value >= 80) return { label: 'Good', color: 'text-green-400 bg-green-400/10' };
    if (value >= 60) return { label: 'Warning', color: 'text-yellow-400 bg-yellow-400/10' };
    return { label: 'Critical', color: 'text-red-400 bg-red-400/10' };
  }
  if (title === 'Vulnerabilities') {
    if (value === 0) return { label: 'Secure', color: 'text-green-400 bg-green-400/10' };
    if (value < 5) return { label: 'Action Needed', color: 'text-yellow-400 bg-yellow-400/10' };
    return { label: 'Critical', color: 'text-red-400 bg-red-400/10' };
  }
  if (title === 'Bugs') {
    if (value === 0) return { label: 'Clean', color: 'text-green-400 bg-green-400/10' };
    if (value < 10) return { label: 'Warning', color: 'text-yellow-400 bg-yellow-400/10' };
    return { label: 'High', color: 'text-red-400 bg-red-400/10' };
  }
  if (title === 'Code Smells') {
    if (value < 50) return { label: 'Low', color: 'text-green-400 bg-green-400/10' };
    if (value < 200) return { label: 'Medium', color: 'text-yellow-400 bg-yellow-400/10' };
    return { label: 'High', color: 'text-red-400 bg-red-400/10' };
  }
  return { label: '', color: '' };
};

const MetricCard = ({ title, value, previousValue, icon: Icon, colorClass }) => {
  const trend = previousValue !== null && previousValue !== undefined ? value - previousValue : 0;
  const isPositive = title === 'Coverage' ? trend >= 0 : trend <= 0;
  const trendFormatted = trend % 1 !== 0 ? Math.abs(trend).toFixed(1) : Math.abs(trend);

  const severity = getSeverityInfo(title, value);

  let TrendIcon = Minus;
  if (trend > 0) TrendIcon = TrendingUp;
  else if (trend < 0) TrendIcon = TrendingDown;

  return (
    <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-5 flex flex-col justify-between hover:border-gray-600 transition-colors shadow-sm min-h-[120px]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
            <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
          </div>
          <span className="text-gray-300 font-medium text-sm">{title}</span>
        </div>
        
        {severity.label && (
          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${severity.color}`}>
            {severity.label}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between mt-2">
        <div className="flex items-end gap-1.5">
           <span className="text-3xl font-bold text-white leading-none">{value % 1 !== 0 ? value.toFixed(1) : value}</span>
           {title === 'Coverage' && <span className="text-gray-400 text-base font-medium mb-0.5">%</span>}  
           {title === 'Code Smells' && value >= 1000 && <span className="text-gray-500 text-xs mb-1">~{(value/1000).toFixed(1)}k</span>}
        </div>
        
        {previousValue !== null && previousValue !== undefined && (       
           <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-gray-900/50 ${trend === 0 ? 'text-gray-400' : isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <TrendIcon size={14} strokeWidth={2.5} />
              <span>{trend !== 0 ? trendFormatted : 'Stable'}</span>
           </div>
        )}
      </div>
    </div>
  );
};

const getHealthScoreColor = (score) => {
    if (score >= 90) return 'from-green-500/20 border-green-500/30 text-green-400';
    if (score >= 70) return 'from-yellow-500/20 border-yellow-500/30 text-yellow-400';
    if (score >= 50) return 'from-orange-500/20 border-orange-500/30 text-orange-400';
    return 'from-red-500/20 border-red-500/30 text-red-500';
};
const getHealthScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Warning';
    return 'Critical';
};

const CodeQualityWidget = ({ data }) => {
  const { latest, previous, healthScore } = useMemo(() => {
    if (!data || data.length === 0) return { latest: {}, previous: {}, healthScore: 0 };

    const map = new Map();

    data.forEach(item => {
      const dateStr = new Date(item.timestamp).toISOString().split('T')[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, {
            date: dateStr,
            sonar_bugs: 0,
            sonar_vulnerabilities: 0,
            sonar_code_smells: 0,
            sonar_coverage: 0
        });
      }

      const bucket = map.get(dateStr);
      if (bucket[item.metric_name] !== undefined) {
         bucket[item.metric_name] = item.value;
      }
    });

    let sorted = Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fill in missing days so the chart has a continuous daily timeline
    if (sorted.length > 1) {
      const filledData = [];
      const firstDate = new Date(sorted[0].date);
      const lastDate = new Date(sorted[sorted.length - 1].date);
      let currentValueDate = new Date(firstDate);

      let lastKnownMetrics = { ...sorted[0] };
      let sortedIndex = 0;

      while (currentValueDate <= lastDate) {
        const dateStr = currentValueDate.toISOString().split('T')[0];
        
        if (sortedIndex < sorted.length && sorted[sortedIndex].date === dateStr) {       
          lastKnownMetrics = { ...sorted[sortedIndex] };
          sortedIndex++;
        }

        filledData.push({
          ...lastKnownMetrics,
          date: dateStr
        });

        currentValueDate.setDate(currentValueDate.getDate() + 1);
      }
      sorted = filledData;
    }

    const latestItems = sorted.length > 0 ? sorted[sorted.length - 1] : { sonar_bugs: 0, sonar_vulnerabilities: 0, sonar_code_smells: 0, sonar_coverage: 0 };
    const previousItems = sorted.length > 1 ? sorted[sorted.length - 2] : { sonar_bugs: null, sonar_vulnerabilities: null, sonar_code_smells: null, sonar_coverage: null };       

    const b = latestItems.sonar_bugs || 0;
    const v = latestItems.sonar_vulnerabilities || 0;
    const s = latestItems.sonar_code_smells || 0;
    const c = latestItems.sonar_coverage || 0;

    let penalty = (v * 5) + (b * 2) + (s * 0.1);
    if (c < 80 && c > 0) penalty += (80 - c) * 0.5;

    const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

    return { latest: latestItems, previous: previousItems, healthScore: score };
  }, [data]);

  if (!data || data.length === 0) return <div className="flex items-center justify-center p-8 text-gray-400">No sonar data available.</div>;

  const hmClass = getHealthScoreColor(healthScore);
  const hsTextClass = hmClass.split(' ')[2]; // gets the text color class

  return (
    <div className="w-full flex flex-col gap-4">

      <div className={`flex bg-gradient-to-r ${hmClass.split(' ')[0]} to-gray-800/80 border border-gray-700/50 p-6 rounded-xl items-center shadow-lg relative overflow-hidden`}>
        {/* Decorative background glow */}
        <div className={`absolute -left-10 -top-10 w-32 h-32 blur-3xl opacity-20 bg-current ${hsTextClass}`}></div>
        
        <div className="relative z-10">
           <div className="text-xs text-gray-300 font-bold tracking-widest uppercase mb-1 drop-shadow-sm">Code Health Score</div>
           <div className="flex items-center gap-5">
             <div className="text-6xl font-black text-white tracking-tighter drop-shadow-md">{healthScore}</div>
             <div className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 shadow-inner ${hsTextClass}`}>
                {healthScore >= 70 ? <ShieldCheck size={18} strokeWidth={2.5}/> : <Activity size={18} strokeWidth={2.5}/>} 
                {getHealthScoreLabel(healthScore)}
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
            title="Coverage"
            value={latest.sonar_coverage || 0}
            previousValue={previous.sonar_coverage}
            icon={Zap}
            colorClass="bg-blue-500 text-blue-400"
        />
        <MetricCard
            title="Vulnerabilities"
            value={latest.sonar_vulnerabilities || 0}
            previousValue={previous.sonar_vulnerabilities}
            icon={ShieldAlert}
            colorClass="bg-red-500 text-red-500"
        />
        <MetricCard
            title="Bugs"
            value={latest.sonar_bugs || 0}
            previousValue={previous.sonar_bugs}
            icon={Bug}
            colorClass="bg-orange-500 text-orange-400"
        />
        <MetricCard
            title="Code Smells"
            value={latest.sonar_code_smells || 0}
            previousValue={previous.sonar_code_smells}
            icon={Activity}
            colorClass="bg-indigo-400 text-indigo-400"
        />
      </div>

    </div>
  );
};

export default CodeQualityWidget;