import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CommitFrequencyChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>No commit data available.</div>;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <YAxis allowDecimals={false} stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
          <Tooltip 
            labelFormatter={(label) => new Date(label).toLocaleDateString()} 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#60a5fa' }}
          />   
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1e3a8a', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#bfdbfe', stroke: '#3b82f6' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitFrequencyChart;
