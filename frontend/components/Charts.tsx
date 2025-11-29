import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Area
} from 'recharts';
import { RegionData } from '../types';

interface ChartProps {
  data: RegionData[];
  onSelectRegion?: (region: RegionData) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-neon-cyan/50 rounded-lg shadow-xl z-50 max-w-[200px]">
        <p className="text-neon-cyan font-bold mb-1 truncate">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-200">
            {entry.name}: <span className="font-mono text-xs">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ForecastChart: React.FC<ChartProps> = ({ data, onSelectRegion }) => {
  const years = [2022, 2023, 2024, 2025, 2026];

  const chartData = years.map(year => {
    const point: any = { year };
    data.forEach(region => {
      const hist = region.historicalData.find(d => d.year === year);
      const fore = region.forecastData.find(d => d.year === year);
      point[region.name] = hist ? hist.value : (fore ? fore.value : null);
    });
    return point;
  });

  const colors = ['#00f3ff', '#b026ff', '#ff00aa', '#0047ff', '#ffffff', '#ffaa00', '#00ff66', '#ff4d4d'];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="year" stroke="#ffffff60" />
        <YAxis stroke="#ffffff60" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#fff', cursor: 'pointer' }} onClick={(e) => {
          const region = data.find(r => r.name === e.dataKey);
          if (region && onSelectRegion) onSelectRegion(region);
        }} />
        {data.map((region, index) => (
          <Line
            key={region.id}
            type="monotone"
            dataKey={region.name}
            name={region.name}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 0, fill: colors[index % colors.length] }}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ClusterScatterChart: React.FC<ChartProps> = ({ data, onSelectRegion }) => {
  const formattedData = data.map(r => ({
    x: r.growthRate,
    y: r.totalExpenditure,
    z: r.population,
    name: r.name,
    cluster: r.clusterGroup,
    originalData: r
  }));

  const handleClick = (e: any) => {
    if (onSelectRegion && e.payload && e.payload.originalData) {
      onSelectRegion(e.payload.originalData);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis type="number" dataKey="x" name="Growth" unit="%" stroke="#ffffff60" label={{ value: 'Growth %', position: 'insideBottom', offset: -5, fill: '#ffffff60' }} />
        <YAxis type="number" dataKey="y" name="Expenditure" stroke="#ffffff60" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} label={{ value: 'Expenditure (Rp)', angle: -90, position: 'insideLeft', fill: '#ffffff60' }} />
        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Population" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Legend />
        <Scatter name="High Exp" data={formattedData.filter(d => d.cluster === 'High')} fill="#00f3ff" shape="circle" onClick={handleClick} cursor="pointer" />
        <Scatter name="Medium Exp" data={formattedData.filter(d => d.cluster === 'Medium')} fill="#b026ff" shape="triangle" onClick={handleClick} cursor="pointer" />
        <Scatter name="Low Exp" data={formattedData.filter(d => d.cluster === 'Low')} fill="#ff00aa" shape="square" onClick={handleClick} cursor="pointer" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export const CategoryBarChart: React.FC<ChartProps> = ({ data, onSelectRegion }) => {
  const sortedData = [...data].sort((a, b) => b.totalExpenditure - a.totalExpenditure);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart 
        data={sortedData} 
        layout="vertical"
        onClick={(e: any) => {
          if (onSelectRegion && e && e.activePayload && e.activePayload.length > 0) {
            const regionName = e.activePayload[0].payload.name;
            const region = data.find(r => r.name === regionName);
            if (region) onSelectRegion(region);
          }
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
        <XAxis type="number" stroke="#ffffff60" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
        <YAxis dataKey="name" type="category" width={100} stroke="#ffffff60" tick={{fontSize: 10}} />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
        <Bar dataKey="totalExpenditure" radius={[0, 4, 4, 0]} barSize={15} name="Expenditure (Rp)" cursor="pointer">
           {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.clusterGroup === 'High' ? '#00f3ff' : entry.clusterGroup === 'Medium' ? '#b026ff' : '#ff00aa'} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const GapAnalysisChart: React.FC<ChartProps> = ({ data, onSelectRegion }) => {
  const chartData = data.map(r => ({
    name: r.name,
    production: r.production,
    demand: (r.population * (r.totalExpenditure/15000)) / 1000 // Very rough est: Rp/15000 ~ kg -> * pop / 1000 for tonnes
  })).sort((a, b) => b.demand - a.demand);

  const handleClick = (e: any) => {
    if (onSelectRegion && e && e.activePayload && e.activePayload.length > 0) {
       const regionName = e.activePayload[0].payload.name;
       const region = data.find(r => r.name === regionName);
       if (region) onSelectRegion(region);
    }
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData} onClick={handleClick}>
         <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
         <XAxis dataKey="name" stroke="#ffffff60" tick={{fontSize: 10}} interval={0} angle={-30} textAnchor="end" height={60} />
         <YAxis stroke="#ffffff60" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} label={{ value: 'Tonnes', angle: -90, position: 'insideLeft', fill: '#ffffff60' }} />
         <Tooltip content={<CustomTooltip />} />
         <Legend />
         <Bar dataKey="production" name="Production" fill="#00f3ff" barSize={15} fillOpacity={0.6} cursor="pointer" />
         <Bar dataKey="demand" name="Demand (Est)" fill="#ff00aa" barSize={15} fillOpacity={0.6} cursor="pointer" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const DistributionPieChart: React.FC<ChartProps> = ({ data, onSelectRegion }) => {
  const chartData = data.map(r => ({ name: r.name, value: r.totalExpenditure }));
  const colors = ['#00f3ff', '#b026ff', '#ff00aa', '#0047ff', '#ffffff', '#ffaa00', '#00ff66'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
              stroke="rgba(0,0,0,0.5)" 
              cursor="pointer" 
              onClick={() => {
                const region = data.find(r => r.name === entry.name);
                if (region && onSelectRegion) onSelectRegion(region);
              }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const MetricRadarChart: React.FC<ChartProps> = ({ data }) => {
  const radarData = data.slice(0, 6).map(r => ({
    subject: r.name,
    Expenditure: r.totalExpenditure / 200, // Scale down
    Growth: r.growthRate * 20, 
    Pop: (r.population / 10000)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
        <PolarGrid stroke="#ffffff30" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff80', fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
        <Radar name="Expenditure" dataKey="Expenditure" stroke="#00f3ff" fill="#00f3ff" fillOpacity={0.3} />
        <Radar name="Growth" dataKey="Growth" stroke="#ff00aa" fill="#ff00aa" fillOpacity={0.3} />
        <Legend />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};