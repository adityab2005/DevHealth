import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CommitFrequencyChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No commit data available.</div>;

  return (
    <div style={{ height: 300, padding: 20, backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: 15, color: '#333' }}>Commit Frequency</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleDateString()} />
          <YAxis allowDecimals={false} />
          <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitFrequencyChart;