import { useEffect, useMemo } from "react";
import { featureCollection } from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { PathOptions } from "leaflet";
import type { StoredGeometry } from "../../types/geometry";

const LAYER_STYLES: PathOptions[] = [
  { color: "#2563eb", weight: 3, fillOpacity: 0.25 },
  { color: "#dc2626", weight: 3, fillOpacity: 0.25 },
  { color: "#16a34a", weight: 3, fillOpacity: 0.25 },
  { color: "#9333ea", weight: 3, fillOpacity: 0.25 },
  { color: "#ea580c", weight: 3, fillOpacity: 0.25 },
  { color: "#0891b2", weight: 3, fillOpacity: 0.25 },
];

const RESULT_STYLE: PathOptions = {
  color: "#111827",
  weight: 4,
  fillColor: "#facc15",
  fillOpacity: 0.45,
  dashArray: "7 5",
};

function FitMapToData({ data }: { data: FeatureCollection }) {
  const map = useMap();

  useEffect(() => {
    if (data.features.length === 0) return;
    const bounds = L.geoJSON(data).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [data, map]);

  return null;
}

type Props = {
  items: StoredGeometry[];
  result: Feature | null;
};

export function GeometryMap({ items, result }: Props) {
  const displayedData = useMemo(
    () =>
      featureCollection([
        ...items.map((item) => item.feature),
        ...(result ? [result] : []),
      ]),
    [items, result],
  );

  return (
    <section aria-labelledby="map-title">
      <h2 id="map-title">
        Carte des géométries
      </h2>
      <MapContainer center={[46.8, 8.23]} zoom={8} zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <GeoJSON
            key={item.id}
            data={item.feature}
            style={LAYER_STYLES[item.colorIndex]}
          />
        ))}
        {result && (
          <GeoJSON
            key={JSON.stringify(result.geometry)}
            data={result}
            style={RESULT_STYLE}
          />
        )}
        <FitMapToData data={displayedData} />
      </MapContainer>
      {result && (
        <div>
          <span aria-hidden="true" />
          Résultat de l'opération
        </div>
      )}
    </section>
  );
}
