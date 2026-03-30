import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BuildSuccessRateChart = ({ data }) => {
  if (!data || data.length === 0) return <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>No build data available.</div>;

  const latestMetric = data[data.length - 1];
  const successRate = latestMetric ? latestMetric.value : 0;

  const chartData = [
    { name: 'Success', value: successRate },
    { name: 'Failure', value: 100 - successRate }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={100}
              startAngle={90}
              endAngle={450}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value.toFixed(1)}%`} 
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
           <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#f3f4f6' }}>{successRate.toFixed(1)}%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BuildSuccessRateChart;
