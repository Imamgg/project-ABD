export interface YearlyData {
  year: number;
  value: number; // Renamed from consumption to generic value (Rp)
}

// Raw data structure from your JSON
export interface RawKabupatenData {
  Kabupaten_Kota: string;
  Tahun: number;
  Region: string;
  Pengeluaran_Buah: number;
  Pengeluaran_Sayur: number;
  Cluster: number;
  Cluster_Label: string;
  Cluster_Category: string;
}

export interface RegionData {
  id: string;
  name: string; // Kabupaten/Kota name
  province: string;
  category: 'Fruit' | 'Vegetable' | 'Combined';
  
  // Expenditures (Rp/capita/year)
  expenditureFruit: number;
  expenditureVeg: number;
  totalExpenditure: number;
  
  // Synthesized/Mocked for UI visualization if missing in raw data
  production: number; 
  population: number; 
  growthRate: number; 
  
  clusterGroup: 'High' | 'Medium' | 'Low';
  clusterId: number;
  
  coordinates: {
    lat: number;
    lng: number;
  };
  
  historicalData: YearlyData[];
  forecastData: YearlyData[];
}

export interface AnalysisResult {
  regions: RegionData[];
  summary: string;
  recommendations: string[];
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  CLUSTERING = 'CLUSTERING',
  FORECASTING = 'FORECASTING',
  GEOSPATIAL = 'GEOSPATIAL'
}