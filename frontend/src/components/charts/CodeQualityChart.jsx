import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CodeQualityChart = ({ data }) => {
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map();

    data.forEach(item => {
      // Create a clean date string key
      const dateStr = new Date(item.timestamp).toISOString().split('T')[0];

      if (!map.has(dateStr)) {
        map.set(dateStr, { 
            date: dateStr, 
            sonar_bugs: 0, 
            sonar_vulnerabilities: 0, 
            sonar_code_smells: 0 
        });
      }

      const bucket = map.get(dateStr);
      if (bucket[item.metric_name] !== undefined) {
         bucket[item.metric_name] = item.value;
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date)); 
  }, [data]);

  if (groupedData.length === 0) return <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>No sonar data available.</div>;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={groupedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVulnerabilities" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSmells" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#d1d5db' }} />
          <Area type="monotone" dataKey="sonar_bugs" name="Bugs" stroke="#ef4444" fillOpacity={1} fill="url(#colorBugs)" />
          <Area type="monotone" dataKey="sonar_vulnerabilities" name="Vulnerabilities" stroke="#f97316" fillOpacity={1} fill="url(#colorVulnerabilities)" />
          <Area type="monotone" dataKey="sonar_code_smells" name="Code Smells" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSmells)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CodeQualityChart;