import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BuildSuccessRateChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No build data available.</div>;

  // Since we aggregate build success rate continuously, we'll grab the latest valid data point.
  const latestMetric = data[data.length - 1]; 
  const successRate = latestMetric ? latestMetric.value : 0;
  
  const chartData = [
    { name: 'Success', value: successRate },
    { name: 'Failure', value: 100 - successRate }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div style={{ height: 300, padding: 20, backgroundColor: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, marginBottom: 15, color: '#333' }}>Build Success Rate</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Absolute center stat display */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
           <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{successRate.toFixed(1)}%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BuildSuccessRateChart;