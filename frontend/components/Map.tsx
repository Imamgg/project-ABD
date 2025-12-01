import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { RegionData } from "../types";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  data: RegionData[];
  onSelectRegion?: (region: RegionData) => void;
  focusCoordinates?: { lat: number; lng: number } | null;
}

const MapController: React.FC<{
  center: { lat: number; lng: number } | null;
}> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 9, {
        animate: true,
        duration: 1.5, // Smooth flight duration
      });
    }
  }, [center, map]);

  return null;
};

const MapComponent: React.FC<MapProps> = ({
  data,
  onSelectRegion,
  focusCoordinates,
}) => {
  const centerPosition: [number, number] = [-2.5489, 118.0149];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden relative z-0">
      <MapContainer
        center={centerPosition}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <MapController center={focusCoordinates || null} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {data.map((region) => {
          const color =
            region.clusterGroup === "High"
              ? "#00f3ff"
              : region.clusterGroup === "Medium"
              ? "#b026ff"
              : "#ff00aa";

          return (
            <React.Fragment key={region.id}>
              <CircleMarker
                center={[region.coordinates.lat, region.coordinates.lng]}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.3,
                  weight: 1,
                }}
                radius={6} // Fixed radius for scatter
                eventHandlers={{
                  click: () => {
                    if (onSelectRegion) onSelectRegion(region);
                  },
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                  className="glass-tooltip"
                >
                  <div className="text-center">
                    <span className="font-bold block text-sm">
                      {region.name}
                    </span>
                    <span className="text-xs text-gray-300 block">
                      Rp {region.totalExpenditure.toLocaleString()}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color }}
                    >
                      {region.clusterGroup}
                    </span>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="font-sans min-w-[180px]">
                    <h3 className="font-bold text-lg text-neon-cyan mb-2 border-b border-gray-600 pb-1">
                      {region.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-200 mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kluster:</span>
                        <span style={{ color }} className="font-bold">
                          {region.clusterGroup}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pengeluaran:</span>
                        <span>
                          Rp {region.totalExpenditure.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wilayah:</span>
                        <span>{region.province}</span>
                      </div>
                    </div>
                    {onSelectRegion && (
                      <button
                        onClick={() => onSelectRegion(region)}
                        className="w-full py-1.5 px-3 rounded text-xs font-bold bg-white/10 hover:bg-neon-cyan hover:text-black transition duration-200 border border-white/20 hover:border-neon-cyan"
                      >
                        LIHAT DETAIL
                      </button>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
