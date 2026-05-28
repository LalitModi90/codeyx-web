import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';

interface ChartProps {
  data: any[];
  type?: 'bar' | 'pie' | 'line' | 'area';
  dataKey?: string;
  nameKey?: string;
  height?: number;
  colors?: string[];
}

export default function AnalyticsChart({ 
  data, 
  type = 'bar', 
  dataKey = 'value', 
  nameKey = 'name',
  height = 300,
  colors = ['#FF8A00', '#10B981', '#3B82F6', '#8B5CF6', '#F43F5E']
}: ChartProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1F] border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="text-white font-bold text-sm mb-1">{label || payload[0].name}</p>
          <p className="text-[#FF8A00] text-xs font-semibold">
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={dataKey}
              nameKey={nameKey}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
          </PieChart>
        );
      
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey={nameKey} stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={3} dot={{ r: 4, fill: '#1A1A1F', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey={nameKey} stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey={nameKey} stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
