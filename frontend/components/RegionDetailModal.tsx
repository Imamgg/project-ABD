import React from 'react';
import { RegionData } from '../types';
import GlassCard from './GlassCard';
import { Icons } from './Icons';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';

interface Props {
  region: RegionData;
  onClose: () => void;
}

const RegionDetailModal: React.FC<Props> = ({ region, onClose }) => {
  // Prepare chart data combining history and forecast
  const chartData = [
    ...region.historicalData.map(d => ({ year: d.year, value: d.value, type: 'Historical' })),
    ...region.forecastData.map(d => ({ year: d.year, value: d.value, type: 'Forecast' }))
  ];

  // Prepare Gap Analysis Data (Estimated Demand vs Production)
  // Assuming total expenditure roughly correlates to consumption volume for visual gap analysis
  const demandInTonnes = (region.population * (region.totalExpenditure / 15000)) / 1000; 
  const productionVsDemand = [
    { name: 'Production', value: region.production, fill: '#00f3ff' },
    { name: 'Demand (Est)', value: demandInTonnes, fill: '#ff00aa' }
  ];

  const deficit = demandInTonnes - region.production;
  const isDeficit = deficit > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <GlassCard className="border-neon-cyan/30 shadow-[0_0_50px_rgba(0,243,255,0.1)] bg-[#050511]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition z-10"
          >
            <Icons.X size={20} />
          </button>

          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8 border-b border-white/10 pb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${
              region.clusterGroup === 'High' ? 'from-neon-cyan/20 to-blue-500/20 shadow-[0_0_15px_rgba(0,243,255,0.3)]' :
              region.clusterGroup === 'Medium' ? 'from-neon-purple/20 to-pink-500/20 shadow-[0_0_15px_rgba(176,38,255,0.3)]' :
              'from-neon-pink/20 to-orange-500/20 shadow-[0_0_15px_rgba(255,0,170,0.3)]'
            }`}>
              <Icons.Map size={40} className={
                region.clusterGroup === 'High' ? 'text-neon-cyan' :
                region.clusterGroup === 'Medium' ? 'text-neon-purple' :
                'text-neon-pink'
              } />
            </div>
            
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white tracking-tight">{region.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                   region.clusterGroup === 'High' ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/10' :
                   region.clusterGroup === 'Medium' ? 'border-neon-purple text-neon-purple bg-neon-purple/10' :
                   'border-neon-pink text-neon-pink bg-neon-pink/10'
                }`}>
                  {region.clusterGroup} Cluster
                </span>
                <span className="text-gray-400 text-sm flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Icons.TrendingUp size={14} className={`mr-2 ${region.growthRate > 0 ? 'text-green-400' : 'text-red-400'}`} /> 
                  {region.growthRate > 0 ? '+' : ''}{region.growthRate}% Growth
                </span>
                <span className="text-gray-400 text-sm flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Icons.Database size={14} className="mr-2 text-neon-blue" /> 
                  {region.province}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-neon-cyan/30 transition duration-300">
               <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Expenditure</p>
               <p className="text-xl font-mono font-bold text-white">Rp {region.totalExpenditure.toLocaleString()} <span className="text-sm text-gray-500 font-sans">/cap</span></p>
             </div>
             <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-neon-purple/30 transition duration-300">
               <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Fruit Exp.</p>
               <p className="text-xl font-mono font-bold text-white">Rp {region.expenditureFruit.toLocaleString()}</p>
             </div>
             <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-neon-blue/30 transition duration-300">
               <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Veg Exp.</p>
               <p className="text-xl font-mono font-bold text-white">Rp {region.expenditureVeg.toLocaleString()}</p>
             </div>
             <div className="p-5 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-neon-pink/30 transition duration-300">
               <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Est Market Demand</p>
               <p className="text-xl font-mono font-bold text-white">{demandInTonnes.toFixed(1)}k <span className="text-sm text-gray-500 font-sans">Tonnes</span></p>
             </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Trend Chart */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-black/40 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Icons.Activity size={18} className="mr-2 text-neon-blue" /> 
                Expenditure Forecast
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="year" stroke="#ffffff60" tick={{fontSize: 12}} />
                    <YAxis stroke="#ffffff60" tick={{fontSize: 12}} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(20, 20, 35, 0.95)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val: number) => `Rp ${val.toLocaleString()}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                      name="Expenditure"
                      type="monotone"
                      dataKey="value"
                      stroke="#00f3ff"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 0, fill: '#00f3ff' }}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gap Analysis Chart */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Icons.PieChart size={18} className="mr-2 text-neon-pink" /> 
                Supply vs Demand (Est)
              </h3>
              <div className="flex-1 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productionVsDemand} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff60" tick={{fontSize: 12}} />
                    <YAxis stroke="#ffffff60" tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                      contentStyle={{ backgroundColor: 'rgba(20, 20, 35, 0.95)', borderColor: '#333', borderRadius: '8px' }} 
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                       {productionVsDemand.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.fill} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className={`mt-4 p-3 rounded-lg border text-center ${isDeficit ? 'bg-neon-pink/10 border-neon-pink/30' : 'bg-neon-cyan/10 border-neon-cyan/30'}`}>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{isDeficit ? 'Supply Deficit' : 'Supply Surplus'}</p>
                <p className={`text-lg font-mono font-bold ${isDeficit ? 'text-neon-pink' : 'text-neon-cyan'}`}>
                   {Math.abs(deficit).toLocaleString(undefined, { maximumFractionDigits: 0 })} Tonnes
                </p>
              </div>
            </div>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};

export default RegionDetailModal;