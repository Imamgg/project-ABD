export const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Aceh": { lat: 4.6951, lng: 96.7494 },
  "Sumatera Utara": { lat: 2.1154, lng: 99.5451 },
  "Sumatera Barat": { lat: -0.7399, lng: 100.8000 },
  "Riau": { lat: 0.2933, lng: 101.7068 },
  "Jambi": { lat: -1.4852, lng: 102.4381 },
  "Sumatera Selatan": { lat: -3.3194, lng: 104.9144 },
  "Bengkulu": { lat: -3.5778, lng: 102.3464 },
  "Lampung": { lat: -4.5586, lng: 105.4068 },
  "Kepulauan Bangka Belitung": { lat: -2.7411, lng: 106.4406 },
  "Bangka Belitung": { lat: -2.7411, lng: 106.4406 },
  "Kepulauan Riau": { lat: 3.9164, lng: 108.1901 },
  "DKI Jakarta": { lat: -6.2088, lng: 106.8456 },
  "Jawa Barat": { lat: -6.9175, lng: 107.6191 },
  "Jawa Tengah": { lat: -7.1510, lng: 110.1403 },
  "DI Yogyakarta": { lat: -7.7956, lng: 110.3695 },
  "Jawa Timur": { lat: -7.5360, lng: 112.2384 },
  "Banten": { lat: -6.4058, lng: 106.0640 },
  "Bali": { lat: -8.3405, lng: 115.0920 },
  "Nusa Tenggara Barat": { lat: -8.6529, lng: 117.3616 },
  "Nusa Tenggara Timur": { lat: -8.6574, lng: 121.0794 },
  "Kalimantan Barat": { lat: -0.2787, lng: 111.4753 },
  "Kalimantan Tengah": { lat: -1.6815, lng: 113.3824 },
  "Kalimantan Selatan": { lat: -3.0926, lng: 115.2838 },
  "Kalimantan Timur": { lat: 0.5387, lng: 116.4194 },
  "Kalimantan Utara": { lat: 3.0731, lng: 116.0414 },
  "Sulawesi Utara": { lat: 0.6247, lng: 123.9750 },
  "Sulawesi Tengah": { lat: -1.4300, lng: 121.4456 },
  "Sulawesi Selatan": { lat: -3.6687, lng: 119.9740 },
  "Sulawesi Tenggara": { lat: -4.1449, lng: 122.1746 },
  "Gorontalo": { lat: 0.6999, lng: 122.4467 },
  "Sulawesi Barat": { lat: -2.8441, lng: 119.2321 },
  "Maluku": { lat: -3.2385, lng: 130.1453 },
  "Maluku Utara": { lat: 1.5709, lng: 127.8087 },
  "Papua Barat": { lat: -1.3361, lng: 133.1747 },
  "Papua": { lat: -4.2699, lng: 138.0804 },
  "Lainnya": { lat: -5.0, lng: 119.0 } // Fallback
};

// Helper to get deterministic random coordinates based on province center and city name hash
export const getEstimatedCoordinates = (province: string, cityName: string) => {
  const center = PROVINCE_COORDINATES[province] || PROVINCE_COORDINATES["Lainnya"];
  
  // Simple hash function for name
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = ((hash << 5) - hash) + cityName.charCodeAt(i);
    hash |= 0;
  }
  
  // Deterministic random float between -1 and 1 derived from hash
  const seed1 = (hash & 0xFFFF) / 65536.0; 
  const seed2 = ((hash >> 16) & 0xFFFF) / 65536.0;

  // Jitter amount (approx 0.5 - 1.0 degree spread)
  const spread = 0.8; 

  return {
    lat: center.lat + (seed1 - 0.5) * spread,
    lng: center.lng + (seed2 - 0.5) * spread
  };
};