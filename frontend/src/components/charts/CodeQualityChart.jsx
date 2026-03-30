import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Bug, Activity, ShieldCheck, Zap } from 'lucide-react';

const MetricCard = ({ title, value, previousValue, icon: Icon, colorClass, data, dataKey, chartColor }) => {
  const trend = previousValue !== null && previousValue !== undefined ? value - previousValue : 0;
  const isPositive = title === 'Coverage' || title === 'Health Score' ? trend >= 0 : trend <= 0;
  const trendFormatted = trend % 1 !== 0 ? trend.toFixed(1) : trend;
  
  return (
    <div className="bg-gray-800 border border-gray-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-gray-600 transition-colors shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${colorClass} bg-opacity-10`}>
            <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
          </div>
          <span className="text-gray-300 font-medium text-sm">{title}</span>
        </div>
        {previousValue !== null && previousValue !== undefined && trend !== 0 && (
          <span className={`text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trendFormatted}
          </span>
        )}
      </div>
      
      <div className="flex items-end gap-3 mt-2">
        <span className="text-2xl font-bold text-white">{value % 1 !== 0 ? value.toFixed(1) : value}</span>
        {title === 'Coverage' && <span className="text-gray-400 text-sm mb-1">%</span>}
        {title === 'Code Smells' && value >= 1000 && <span className="text-gray-500 text-xs mb-1.5">~{(value/1000).toFixed(1)}k</span>}
      </div>

      {data && data.length > 0 && (
        <div className="h-12 mt-4 -mx-2 -mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', fontSize: '12px', padding: '4px' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ display: 'none' }}
                cursor={{ stroke: '#4b5563' }}
              />
              <Area type="monotone" dataKey={dataKey} stroke={chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${dataKey})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const CodeQualityChart = ({ data }) => {
  const { groupedData, latest, previous, healthScore } = useMemo(() => {
    if (!data || data.length === 0) return { groupedData: [], latest: {}, previous: {}, healthScore: 0 };

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

    sorted.forEach(day => {
        let dayPenalty = (day.sonar_vulnerabilities * 5) + (day.sonar_bugs * 2) + (day.sonar_code_smells * 0.1);
        if (day.sonar_coverage < 80 && day.sonar_coverage > 0) dayPenalty += (80 - day.sonar_coverage) * 0.5;
        day.health_score = Math.max(0, Math.min(100, Math.round(100 - dayPenalty)));
    });

    return { groupedData: sorted, latest: latestItems, previous: previousItems, healthScore: score };
  }, [data]);

  if (groupedData.length === 0) return <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>No sonar data available.</div>;

  return (
    <div className="h-full w-full flex flex-col gap-4 overflow-y-auto pr-1 pb-1 pt-1 custom-scrollbar">
      
      <div className="flex bg-gray-800/80 border border-gray-700/80 p-5 rounded-xl items-center justify-between shadow-sm">
        <div>
           <div className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-2">Code Health Score</div>
           <div className="flex items-center gap-4">
             <div className="text-5xl font-extrabold text-white tracking-tight">{healthScore}</div>
             <div className={`px-2.5 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 ${
                healthScore >= 90 ? 'bg-green-500/20 text-green-400' :
                healthScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
             }`}>
                {healthScore >= 90 ? <ShieldCheck size={16} /> : <Activity size={16} />}
                {healthScore >= 90 ? 'Grade A' : healthScore >= 70 ? 'Grade B' : 'Critical'}
             </div>
           </div>
        </div>
        
        <div className="w-1/2 h-20 -mr-2">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={groupedData}>
                <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={healthScore >= 90 ? '#22c55e' : healthScore >= 70 ? '#eab308' : '#ef4444'} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={healthScore >= 90 ? '#22c55e' : healthScore >= 70 ? '#eab308' : '#ef4444'} stopOpacity={0}/>
                </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey="health_score" name="Health Score" stroke={healthScore >= 90 ? '#22c55e' : healthScore >= 70 ? '#eab308' : '#ef4444'} strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        <MetricCard 
            title="Coverage" 
            value={latest.sonar_coverage || 0} 
            previousValue={previous.sonar_coverage} 
            icon={Zap} 
            colorClass="bg-blue-500 text-blue-400"
            data={groupedData}
            dataKey="sonar_coverage"
            chartColor="#3b82f6"
        />
        <MetricCard 
            title="Vulnerabilities" 
            value={latest.sonar_vulnerabilities || 0} 
            previousValue={previous.sonar_vulnerabilities} 
            icon={ShieldAlert} 
            colorClass="bg-red-500 text-red-500"
            data={groupedData}
            dataKey="sonar_vulnerabilities"
            chartColor="#ef4444"
        />
        <MetricCard 
            title="Bugs" 
            value={latest.sonar_bugs || 0} 
            previousValue={previous.sonar_bugs} 
            icon={Bug} 
            colorClass="bg-orange-500 text-orange-400"
            data={groupedData}
            dataKey="sonar_bugs"
            chartColor="#f97316"
        />
        <MetricCard 
            title="Code Smells" 
            value={latest.sonar_code_smells || 0} 
            previousValue={previous.sonar_code_smells} 
            icon={Activity} 
            colorClass="bg-indigo-400 text-indigo-400"
            data={groupedData}
            dataKey="sonar_code_smells"
            chartColor="#818cf8"
        />
      </div>

    </div>
  );
};

export default CodeQualityChart;