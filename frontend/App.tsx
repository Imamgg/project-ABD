import React, { useState, useEffect } from "react";
import {
  fetchRegionalData,
  fetchAvailableRegions,
} from "./services/apiService";
import { AnalysisResult, ViewMode, RegionData } from "./types";
import LoadingScreen from "./components/LoadingScreen";
import GlassCard from "./components/GlassCard";
import { Icons } from "./components/Icons";
import {
  ForecastChart,
  ClusterScatterChart,
  CategoryBarChart,
  DistributionPieChart,
  MetricRadarChart,
  GapAnalysisChart,
} from "./components/Charts";
import MapComponent from "./components/Map";
import RegionDetailModal from "./components/RegionDetailModal";

const App: React.FC = () => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedDetailRegion, setSelectedDetailRegion] =
    useState<RegionData | null>(null);
  const [availableRegions, setAvailableRegions] = useState<string[]>(["All"]);

  const [mapFocus, setMapFocus] = useState<{ lat: number; lng: number } | null>(
    null
  );

  // Load available regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regions = await fetchAvailableRegions();
        setAvailableRegions(regions);
      } catch (error) {
        console.error("Failed to load regions:", error);
      }
    };
    loadRegions();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Use the new service that processes your specific dataset
      const result = await fetchRegionalData(selectedRegion);
      setData(result);
      setSelectedDetailRegion(null);

      // Auto-focus logic
      if (result.regions.length > 0) {
        // If specific region selected, focus on first item
        if (selectedRegion !== "All") {
          setMapFocus(result.regions[0].coordinates);
        } else {
          // If All, focus roughly on Indonesia center
          setMapFocus({ lat: -2.5, lng: 118 });
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleGenerate();
  }, [selectedRegion]); // Reload when region filter changes

  const handleSelectRegion = (region: RegionData) => {
    setSelectedDetailRegion(region);
    setMapFocus(region.coordinates);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-neon-cyan selection:text-black overflow-x-hidden">
      <div className="fixed inset-0 bg-cyber-grid pointer-events-none z-0"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px] pointer-events-none"></div>

      {selectedDetailRegion && (
        <RegionDetailModal
          region={selectedDetailRegion}
          onClose={() => setSelectedDetailRegion(null)}
        />
      )}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-dark-bg/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
              <Icons.Zap className="text-white w-6 h-6" />
            <span className="text-2xl font-bold tracking-tighter">
              ABD-<span className="text-neon-cyan">2</span>
            </span>
          </div>

          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => setViewMode(ViewMode.DASHBOARD)}
              className={`text-sm font-medium transition-colors hover:text-neon-cyan flex items-center space-x-2 ${
                viewMode === ViewMode.DASHBOARD
                  ? "text-neon-cyan"
                  : "text-gray-400"
              }`}
            >
              <Icons.Dashboard size={16} /> <span>Dashboard</span>
            </button>
            <button
              onClick={() => setViewMode(ViewMode.GEOSPATIAL)}
              className={`text-sm font-medium transition-colors hover:text-neon-cyan flex items-center space-x-2 ${
                viewMode === ViewMode.GEOSPATIAL
                  ? "text-neon-cyan"
                  : "text-gray-400"
              }`}
            >
              <Icons.Map size={16} /> <span>Geospatial</span>
            </button>
            <button
              onClick={() => setViewMode(ViewMode.CLUSTERING)}
              className={`text-sm font-medium transition-colors hover:text-neon-cyan flex items-center space-x-2 ${
                viewMode === ViewMode.CLUSTERING
                  ? "text-neon-cyan"
                  : "text-gray-400"
              }`}
            >
              <Icons.PieChart size={16} /> <span>Segmentation</span>
            </button>
            <button
              onClick={() => setViewMode(ViewMode.FORECASTING)}
              className={`text-sm font-medium transition-colors hover:text-neon-cyan flex items-center space-x-2 ${
                viewMode === ViewMode.FORECASTING
                  ? "text-neon-cyan"
                  : "text-gray-400"
              }`}
            >
              <Icons.TrendingUp size={16} /> <span>Forecasting</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="mb-12 flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
              Pola Konsumsi Pangan Regional
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg">
              Analisis Segmentasi & Forecasting Buah/Sayuran per Kabupaten/Kota.
            </p>
          </div>

          <div className="flex w-full md:w-auto space-x-3 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Icons.Map className="w-5 h-5 text-neon-cyan" />
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="block w-full md:w-64 pl-10 pr-4 py-3 bg-black/50 border border-white/10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-white cursor-pointer hover:bg-white/5 transition"
              >
                {availableRegions.map((region) => (
                  <option
                    key={region}
                    value={region}
                    className="bg-dark-bg text-white"
                  >
                    Filter: {region}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : !data ? (
          <div className="border border-dashed border-white/20 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-500 bg-white/5">
            <Icons.Activity size={48} className="mb-4 text-white/20" />
            <p>No Data Available</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {viewMode === ViewMode.DASHBOARD && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <GlassCard
                    title="Cakupan Region"
                    icon={<Icons.Map className="text-neon-cyan" />}
                    glow="cyan"
                  >
                    <div className="text-3xl font-bold font-mono text-white">
                      {data.regions.length}
                    </div>
                    <div className="text-xs text-neon-cyan mt-1">
                      Kabupaten/Kota
                    </div>
                  </GlassCard>
                  <GlassCard
                    title="Total Pengeluaran Rata-rata"
                    icon={<Icons.Activity className="text-neon-purple" />}
                    glow="purple"
                  >
                    <div className="text-3xl font-bold font-mono text-white">
                      {(
                        data.regions.reduce(
                          (acc, r) => acc + r.totalExpenditure,
                          0
                        ) / 1000
                      ).toFixed(0)}
                      k
                    </div>
                    <div className="text-xs text-neon-purple mt-1">
                      Rata-rata Rp/Cap/Tahun
                    </div>
                  </GlassCard>
                  <GlassCard
                    title="Rata-rata Pertumbuhan"
                    icon={<Icons.TrendingUp className="text-neon-pink" />}
                    glow="pink"
                  >
                    <div className="text-3xl font-bold font-mono text-white">
                      {(
                        data.regions.reduce(
                          (acc, curr) => acc + curr.growthRate,
                          0
                        ) / data.regions.length
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-neon-pink mt-1">
                      Tren Proyeksi Tahunan
                    </div>
                  </GlassCard>
                  <GlassCard
                    title="Top Region"
                    icon={<Icons.Database className="text-neon-blue" />}
                    glow="none"
                  >
                    <div className="text-lg font-bold font-mono text-white truncate">
                      {
                        data.regions.sort(
                          (a, b) => b.totalExpenditure - a.totalExpenditure
                        )[0]?.name
                      }
                    </div>
                    <div className="text-xs text-neon-blue mt-1">
                      Pengeluaran Tertinggi
                    </div>
                  </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                  <GlassCard
                    className="lg:col-span-2 p-0 overflow-hidden relative shadow-[0_0_30px_rgba(0,243,255,0.1)]"
                    glow="cyan"
                  >
                    <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-neon-cyan border border-neon-cyan/50 shadow-lg flex items-center">
                      <Icons.Map size={12} className="mr-2" />
                      Distribution Map
                    </div>
                    <MapComponent
                      data={data.regions}
                      onSelectRegion={handleSelectRegion}
                      focusCoordinates={mapFocus}
                    />
                  </GlassCard>
                  <GlassCard
                    title="Summary & Recommendations"
                    icon={<Icons.Cpu className="text-white" />}
                    className="bg-gradient-to-b from-white/5 to-transparent overflow-y-auto custom-scrollbar"
                  >
                    <p className="text-gray-300 leading-relaxed text-sm mb-4">
                      {data.summary}
                    </p>
                    <h4 className="text-neon-cyan font-bold text-sm uppercase tracking-wider mb-2">
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {data.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-gray-400 border-l-2 border-neon-purple pl-3 py-1"
                        >
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <GlassCard
                    title="20 wilayah dengan Pengeluaran Tertinggi"
                    icon={<Icons.Activity className="text-neon-blue" />}
                  >
                    <CategoryBarChart
                      data={data.regions.slice(0, 20)}
                      onSelectRegion={handleSelectRegion}
                    />
                  </GlassCard>
                  <GlassCard
                    title="Produksi vs Permintaan (Est)"
                    icon={<Icons.PieChart className="text-white" />}
                  >
                    <GapAnalysisChart
                      data={data.regions.slice(0, 15)}
                      onSelectRegion={handleSelectRegion}
                    />
                  </GlassCard>
                </div>
              </>
            )}

            {viewMode === ViewMode.GEOSPATIAL && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                <GlassCard
                  className="lg:col-span-2 p-0 overflow-hidden relative"
                  glow="cyan"
                >
                  <MapComponent
                    data={data.regions}
                    onSelectRegion={handleSelectRegion}
                    focusCoordinates={mapFocus}
                  />
                </GlassCard>
                <div className="space-y-6 flex flex-col">
                  <GlassCard title="Pembagian Kluster" className="flex-1">
                    <DistributionPieChart
                      data={data.regions.slice(0, 20)}
                      onSelectRegion={handleSelectRegion}
                    />
                  </GlassCard>
                  <GlassCard title="Kabupaten List" className="flex-1">
                    <div className="overflow-y-auto h-48 space-y-2 pr-2 custom-scrollbar">
                      {data.regions.map((r) => (
                        <div
                          key={r.id}
                          className="flex justify-between items-center p-2 rounded bg-white/5 hover:bg-white/10 transition group cursor-pointer"
                          onClick={() => handleSelectRegion(r)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white group-hover:text-neon-cyan">
                              {r.name}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {r.province}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              r.clusterGroup === "High"
                                ? "bg-neon-cyan/20 text-neon-cyan"
                                : r.clusterGroup === "Medium"
                                ? "bg-neon-purple/20 text-neon-purple"
                                : "bg-neon-pink/20 text-neon-pink"
                            }`}
                          >
                            Rp {r.totalExpenditure.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {viewMode === ViewMode.CLUSTERING && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    Segmentasi Kluster Regional
                  </h2>
                  <span className="px-3 py-1 rounded-full border border-neon-purple text-neon-purple text-xs font-mono">
                    X: Growth | Y: Expenditure | Z: Population
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <GlassCard className="lg:col-span-2 h-[500px]" glow="purple">
                    <ClusterScatterChart
                      data={data.regions}
                      onSelectRegion={handleSelectRegion}
                    />
                  </GlassCard>
                  <div className="space-y-4">
                    <GlassCard title="Profile Clusters" className="h-full">
                      <div className="space-y-4 mt-2">
                        <div className="p-3 rounded bg-white/5 border-l-4 border-neon-cyan">
                          <h4 className="text-neon-cyan font-bold text-sm">
                            Pengeluaran Tinggi (Kluster 2)
                          </h4>
                            <p className="text-xs text-gray-400 mt-1">
                            Wilayah dengan pengeluaran pangan tertinggi, menunjukkan konsumsi intensif terhadap buah dan sayuran.
                            </p>
                        </div>
                        <div className="p-3 rounded bg-white/5 border-l-4 border-neon-purple">
                          <h4 className="text-neon-purple font-bold text-sm">
                            Pengeluaran Sedang (Kluster 1)
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Pola konsumsi rata-rata yang khas untuk sebagian besar
                            kabupaten.
                          </p>
                        </div>
                        <div className="p-3 rounded bg-white/5 border-l-4 border-neon-pink">
                          <h4 className="text-neon-pink font-bold text-sm">
                            Pengeluaran Rendah (Kluster 0)
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            Wilayah dengan pengeluaran rendah terhadap buah dan sayur.
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}

            {viewMode === ViewMode.FORECASTING && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">
                    Forecasting (2025-2026)
                  </h2>
                </div>
                <GlassCard className="h-[500px]" glow="cyan">
                  <ForecastChart
                    data={data.regions.slice(0, 10)}
                    onSelectRegion={handleSelectRegion}
                  />
                </GlassCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.regions.slice(0, 6).map((region) => (
                    <GlassCard
                      key={region.id}
                      className="flex justify-between items-center group hover:border-neon-cyan/50 cursor-pointer"
                      onClick={() => handleSelectRegion(region)}
                    >
                      <div>
                        <h4 className="font-bold text-white group-hover:text-neon-cyan transition">
                          {region.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {region.province}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-mono text-neon-cyan">
                          Rp{" "}
                          {Math.round(
                            region.forecastData[region.forecastData.length - 1]
                              .value
                          ).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">Proj 2026</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
