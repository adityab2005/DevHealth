import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IssuesChart = ({ data }) => {
  // backend returns flat list of { timestamp, metric_name, value }
  // We need to pivot this grouping by timestamp for the bar chart 
  
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const map = new Map();
    
    data.forEach(item => {
      // Create a clean date string key (YYYY-MM-DD)
      const dateStr = new Date(item.timestamp).toISOString().split('T')[0];
      
      if (!map.has(dateStr)) {
        map.set(dateStr, { date: dateStr, issues_opened: 0, issues_closed: 0 });
      }
      
      const bucket = map.get(dateStr);
      bucket[item.metric_name] = item.value;
    });

    // Convert map to sorted array
    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  if (groupedData.length === 0) return <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No issues data available.</div>;

  return (
    <div style={{ height: 350, padding: 20, backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: 15, color: '#333' }}>Issues: Opened vs Closed</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={groupedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="issues_opened" name="Opened" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="issues_closed" name="Closed" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IssuesChart;