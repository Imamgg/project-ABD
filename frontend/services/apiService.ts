import { AnalysisResult, RegionData, RawKabupatenData } from "../types";
import { getEstimatedCoordinates } from "../data/provinces";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window as any).VITE_API_URL) ||
  "http://localhost:5000/api";

const USE_MOCK_DATA =
  import.meta.env.VITE_USE_MOCK === "true" ||
  (typeof window !== "undefined" && (window as any).VITE_USE_MOCK === "true") ||
  false;

console.log("API Configuration:", {
  API_BASE_URL,
  USE_MOCK_DATA,
  env: import.meta.env,
});

interface APIResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}

interface ClusterAPIData {
  Kabupaten_Kota: string;
  Tahun: number;
  Region: string;
  Pengeluaran_Buah: number;
  Pengeluaran_Sayur: number;
  Cluster: number;
  Cluster_Label: string;
  Cluster_Category: string;
}

interface PredictionAPIData {
  Kabupaten_Kota: string;
  Region: string;
  Cluster: number;
  Cluster_Label: string;
  Predicted_Buah_2025: number;
  Predicted_Sayur_2025: number;
  Predicted_Total_2025: number;
  Current_Buah_2024: number;
  Current_Sayur_2024: number;
  Growth_Rate_Buah: number;
  Growth_Rate_Sayur: number;
}

// Mock data fallback (subset of data)
const MOCK_RAW_DATA: RawKabupatenData[] = [
  {
    Kabupaten_Kota: "Aceh Barat",
    Tahun: 2024,
    Region: "Aceh",
    Pengeluaran_Buah: 11160.0,
    Pengeluaran_Sayur: 15821.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Aceh Barat Daya",
    Tahun: 2024,
    Region: "Aceh",
    Pengeluaran_Buah: 7231.0,
    Pengeluaran_Sayur: 13790.0,
    Cluster: 1,
    Cluster_Label: "Balanced Expenditure",
    Cluster_Category: "Balanced Expenditure",
  },
  {
    Kabupaten_Kota: "Aceh Besar",
    Tahun: 2024,
    Region: "Aceh",
    Pengeluaran_Buah: 6689.0,
    Pengeluaran_Sayur: 14052.0,
    Cluster: 1,
    Cluster_Label: "Balanced Expenditure",
    Cluster_Category: "Balanced Expenditure",
  },
  {
    Kabupaten_Kota: "Aceh Tengah",
    Tahun: 2024,
    Region: "Aceh",
    Pengeluaran_Buah: 14192.0,
    Pengeluaran_Sayur: 17119.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Banda Aceh",
    Tahun: 2024,
    Region: "Aceh",
    Pengeluaran_Buah: 12518.0,
    Pengeluaran_Sayur: 15251.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Badung",
    Tahun: 2024,
    Region: "Bali",
    Pengeluaran_Buah: 13811.0,
    Pengeluaran_Sayur: 16137.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Bangli",
    Tahun: 2024,
    Region: "Bali",
    Pengeluaran_Buah: 17278.0,
    Pengeluaran_Sayur: 15426.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Buleleng",
    Tahun: 2024,
    Region: "Bali",
    Pengeluaran_Buah: 9003.0,
    Pengeluaran_Sayur: 12483.0,
    Cluster: 1,
    Cluster_Label: "Balanced Expenditure",
    Cluster_Category: "Balanced Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Denpasar",
    Tahun: 2024,
    Region: "Bali",
    Pengeluaran_Buah: 11772.0,
    Pengeluaran_Sayur: 16174.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Jakarta Selatan",
    Tahun: 2024,
    Region: "DKI Jakarta",
    Pengeluaran_Buah: 15382.0,
    Pengeluaran_Sayur: 22204.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Jakarta Timur",
    Tahun: 2024,
    Region: "DKI Jakarta",
    Pengeluaran_Buah: 13718.0,
    Pengeluaran_Sayur: 18027.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Bandung",
    Tahun: 2024,
    Region: "Jawa Barat",
    Pengeluaran_Buah: 7002.0,
    Pengeluaran_Sayur: 8937.0,
    Cluster: 1,
    Cluster_Label: "Balanced Expenditure",
    Cluster_Category: "Balanced Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Bandung",
    Tahun: 2024,
    Region: "Jawa Barat",
    Pengeluaran_Buah: 12717.0,
    Pengeluaran_Sayur: 13007.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Bekasi",
    Tahun: 2024,
    Region: "Jawa Barat",
    Pengeluaran_Buah: 16300.0,
    Pengeluaran_Sayur: 20707.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Depok",
    Tahun: 2024,
    Region: "Jawa Barat",
    Pengeluaran_Buah: 16963.0,
    Pengeluaran_Sayur: 19859.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Banyumas",
    Tahun: 2024,
    Region: "Jawa Tengah",
    Pengeluaran_Buah: 10910.0,
    Pengeluaran_Sayur: 14857.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Semarang",
    Tahun: 2024,
    Region: "Jawa Tengah",
    Pengeluaran_Buah: 12475.0,
    Pengeluaran_Sayur: 16744.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Surabaya",
    Tahun: 2024,
    Region: "Jawa Timur",
    Pengeluaran_Buah: 15153.0,
    Pengeluaran_Sayur: 16478.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Sidoarjo",
    Tahun: 2024,
    Region: "Jawa Timur",
    Pengeluaran_Buah: 11957.0,
    Pengeluaran_Sayur: 14194.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Dogiyai",
    Tahun: 2024,
    Region: "Papua",
    Pengeluaran_Buah: 17795.0,
    Pengeluaran_Sayur: 55758.0,
    Cluster: 2,
    Cluster_Label: "High Expenditure",
    Cluster_Category: "High Expenditure",
  },
  {
    Kabupaten_Kota: "Intan Jaya",
    Tahun: 2024,
    Region: "Papua",
    Pengeluaran_Buah: 10747.0,
    Pengeluaran_Sayur: 57450.0,
    Cluster: 2,
    Cluster_Label: "High Expenditure",
    Cluster_Category: "High Expenditure",
  },
  {
    Kabupaten_Kota: "Jayapura",
    Tahun: 2024,
    Region: "Papua",
    Pengeluaran_Buah: 5247.0,
    Pengeluaran_Sayur: 15183.0,
    Cluster: 1,
    Cluster_Label: "Balanced Expenditure",
    Cluster_Category: "Balanced Expenditure",
  },
  {
    Kabupaten_Kota: "Merauke",
    Tahun: 2024,
    Region: "Papua",
    Pengeluaran_Buah: 12140.0,
    Pengeluaran_Sayur: 23464.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Makasar",
    Tahun: 2024,
    Region: "Lainnya",
    Pengeluaran_Buah: 11058.0,
    Pengeluaran_Sayur: 13406.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Medan",
    Tahun: 2024,
    Region: "Sumatera Utara",
    Pengeluaran_Buah: 9739.0,
    Pengeluaran_Sayur: 18265.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Samosir",
    Tahun: 2024,
    Region: "Sumatera Utara",
    Pengeluaran_Buah: 10145.0,
    Pengeluaran_Sayur: 19608.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Palembang",
    Tahun: 2024,
    Region: "Sumatera Selatan",
    Pengeluaran_Buah: 12613.0,
    Pengeluaran_Sayur: 14707.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Musi Banyuasin",
    Tahun: 2024,
    Region: "Sumatera Selatan",
    Pengeluaran_Buah: 11793.0,
    Pengeluaran_Sayur: 17208.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kota Pontianak",
    Tahun: 2024,
    Region: "Kalimantan Barat",
    Pengeluaran_Buah: 10867.0,
    Pengeluaran_Sayur: 12986.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Kutai Kartanegara",
    Tahun: 2024,
    Region: "Kalimantan Timur",
    Pengeluaran_Buah: 13568.0,
    Pengeluaran_Sayur: 15578.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Morowali",
    Tahun: 2024,
    Region: "Sulawesi Tengah",
    Pengeluaran_Buah: 15223.0,
    Pengeluaran_Sayur: 16887.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
  {
    Kabupaten_Kota: "Gowa",
    Tahun: 2024,
    Region: "Sulawesi Selatan",
    Pengeluaran_Buah: 10935.0,
    Pengeluaran_Sayur: 9508.0,
    Cluster: 0,
    Cluster_Label: "Low Expenditure",
    Cluster_Category: "Low Expenditure",
  },
];

// Fetch data from API
const fetchFromAPI = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const result: APIResponse<T> = await response.json();
    if (result.success && result.data) {
      return result.data as T;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return null;
  }
};

export const fetchRegionalData = async (
  regionFilter?: string
): Promise<AnalysisResult> => {
  let rawData: RawKabupatenData[] = [];
  let predictions: PredictionAPIData[] = [];

  // Try to fetch from API first
  if (!USE_MOCK_DATA) {
    try {
      console.log("Fetching data from API:", API_BASE_URL);
      const apiData = await fetchFromAPI<ClusterAPIData[]>("/clusters");
      const predData = await fetchFromAPI<PredictionAPIData[]>("/predictions");

      if (apiData && Array.isArray(apiData)) {
        console.log(`Loaded ${apiData.length} regions from API`);
        rawData = apiData.map((item) => ({
          Kabupaten_Kota: item.Kabupaten_Kota,
          Tahun: item.Tahun,
          Region: item.Region,
          Pengeluaran_Buah: item.Pengeluaran_Buah,
          Pengeluaran_Sayur: item.Pengeluaran_Sayur,
          Cluster: item.Cluster,
          Cluster_Label: item.Cluster_Label,
          Cluster_Category: item.Cluster_Category,
        }));
      }

      if (predData && Array.isArray(predData)) {
        console.log(`Loaded ${predData.length} predictions from API`);
        predictions = predData;
      }
    } catch (error) {
      console.warn("API fetch failed, falling back to mock data:", error);
    }
  }

  // Fallback to mock data if API fails or USE_MOCK_DATA is true
  if (rawData.length === 0) {
    console.log("Using mock data");
    rawData = MOCK_RAW_DATA;
  }

  // Filter if necessary
  let filteredData = rawData;
  if (regionFilter && regionFilter !== "All") {
    if (regionFilter === "Jawa") {
      filteredData = rawData.filter(
        (d) =>
          d.Region.includes("Jawa") ||
          d.Region.includes("Banten") ||
          d.Region.includes("Jakarta") ||
          d.Region.includes("Yogyakarta")
      );
    } else if (regionFilter === "Sumatera") {
      filteredData = rawData.filter(
        (d) =>
          d.Region.includes("Sumatera") ||
          d.Region.includes("Aceh") ||
          d.Region.includes("Riau") ||
          d.Region.includes("Jambi") ||
          d.Region.includes("Bengkulu") ||
          d.Region.includes("Lampung")
      );
    } else {
      filteredData = rawData.filter((d) => d.Region.includes(regionFilter));
    }
  }

  // Transform Raw Data to Application State
  const regions: RegionData[] = filteredData.map((item) => {
    // Generate deterministic coordinates with cluster grouping
    const coords = getEstimatedCoordinates(
      item.Region,
      item.Kabupaten_Kota,
      item.Cluster
    );

    // Find prediction data for this kabupaten
    const predictionData = predictions.find(
      (p) => p.Kabupaten_Kota === item.Kabupaten_Kota
    );

    // Map Cluster Label to Enum
    let group: "High" | "Medium" | "Low" = "Medium";
    if (item.Cluster_Label.includes("High")) group = "High";
    else if (item.Cluster_Label.includes("Low")) group = "Low";
    else group = "Medium";

    // Use API predictions if available, otherwise synthesize
    const pseudoRandom = (item.Pengeluaran_Buah + item.Pengeluaran_Sayur) % 100;
    const growthRate = predictionData
      ? parseFloat(
          (
            (predictionData.Growth_Rate_Buah +
              predictionData.Growth_Rate_Sayur) /
            2
          ).toFixed(1)
        )
      : parseFloat((pseudoRandom / 10 - 2).toFixed(1));
    const population = Math.floor(200000 + pseudoRandom * 30000);
    const production = Math.floor(10000 + pseudoRandom * 500);

    return {
      id: item.Kabupaten_Kota,
      name: item.Kabupaten_Kota,
      province: item.Region,
      category: "Combined" as const,
      expenditureFruit: item.Pengeluaran_Buah,
      expenditureVeg: item.Pengeluaran_Sayur,
      totalExpenditure: item.Pengeluaran_Buah + item.Pengeluaran_Sayur,

      production,
      population,
      growthRate,

      clusterGroup: group,
      clusterId: item.Cluster,

      coordinates: coords,

      historicalData: [
        {
          year: 2022,
          value: (item.Pengeluaran_Buah + item.Pengeluaran_Sayur) * 0.95,
        },
        {
          year: 2023,
          value: (item.Pengeluaran_Buah + item.Pengeluaran_Sayur) * 0.98,
        },
        { year: 2024, value: item.Pengeluaran_Buah + item.Pengeluaran_Sayur },
      ],
      forecastData: predictionData
        ? [
            { year: 2025, value: predictionData.Predicted_Total_2025 },
            { year: 2026, value: predictionData.Predicted_Total_2025 * 1.03 },
          ]
        : [
            {
              year: 2025,
              value:
                (item.Pengeluaran_Buah + item.Pengeluaran_Sayur) *
                (1 + growthRate / 100),
            },
            {
              year: 2026,
              value:
                (item.Pengeluaran_Buah + item.Pengeluaran_Sayur) *
                (1 + growthRate / 100) *
                1.05,
            },
          ],
    };
  });

  return {
    regions,
    summary: `Analisis berdasarkan ${
      rawData.length
    } kabupaten/kota dari Data Pengeluaran Regional 2023-2024 (${
      USE_MOCK_DATA ? "Mock" : "API"
    }). Dataset menunjukkan variasi signifikan dalam pengeluaran buah dan sayur di berbagai wilayah. Terdapat perbedaan pola konsumsi antara wilayah perkotaan dan perdesaan.`,
    recommendations: [
      "Optimalkan distribusi di wilayah dengan pengeluaran tinggi untuk memaksimalkan potensi pasar.",
      "Tingkatkan akses dan keterjangkauan di wilayah dengan pengeluaran rendah untuk mendorong konsumsi.",
      "Perbaiki infrastruktur rantai pasok untuk mengurangi disparitas harga antar wilayah.",
    ],
  };
};

// Fetch available regions from API
export const fetchAvailableRegions = async (): Promise<string[]> => {
  if (!USE_MOCK_DATA) {
    try {
      console.log("Fetching regions list from API");
      const regions = await fetchFromAPI<string[]>("/regions/list");
      if (regions && Array.isArray(regions)) {
        console.log(`Loaded ${regions.length} regions from API`);
        return ["All", ...regions];
      }
    } catch (error) {
      console.warn("Failed to fetch regions from API:", error);
    }
  }

  // Fallback to predefined regions from mock data
  const uniqueRegions = Array.from(
    new Set(MOCK_RAW_DATA.map((d) => d.Region))
  ).sort();
  return ["All", ...uniqueRegions];
};
