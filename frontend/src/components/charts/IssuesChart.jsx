import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IssuesChart = ({ data }) => {
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const map = new Map();

    data.forEach(item => {
      const dateStr = new Date(item.timestamp).toISOString().split('T')[0];

      if (!map.has(dateStr)) {
        map.set(dateStr, { date: dateStr, issues_opened: 0, issues_closed: 0 });
      }

      const bucket = map.get(dateStr);
      bucket[item.metric_name] = item.value;
    });

    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date)); 
  }, [data]);

  if (groupedData.length === 0) return <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>No issues data available.</div>;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={groupedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#d1d5db' }} />
          <Bar dataKey="issues_opened" name="Opened" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="issues_closed" name="Closed" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IssuesChart;
