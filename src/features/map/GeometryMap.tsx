import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import { featureCollection } from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { PathOptions } from "leaflet";
import type { StoredGeometry } from "../../types/geometry";
import { DrawingControls } from "./DrawingControls";

/** Source geometry layer styles. */
const LAYER_STYLES: PathOptions[] = [
  { color: "#2563eb", weight: 3, fillOpacity: 0.25 },
  { color: "#dc2626", weight: 3, fillOpacity: 0.25 },
  { color: "#16a34a", weight: 3, fillOpacity: 0.25 },
  { color: "#9333ea", weight: 3, fillOpacity: 0.25 },
  { color: "#ea580c", weight: 3, fillOpacity: 0.25 },
  { color: "#0891b2", weight: 3, fillOpacity: 0.25 },
];

/** Computed result layer style. */
const RESULT_STYLE: PathOptions = {
  color: "#111827",
  weight: 4,
  fillColor: "#facc15",
  fillOpacity: 0.45,
  dashArray: "7 5",
};

/** Initial map center over Switzerland. */
const INITIAL_MAP_CENTER: [number, number] = [46.8, 8.23];

/** Initial map zoom level. */
const INITIAL_MAP_ZOOM = 8;

/** Maximum automatic zoom level. */
const MAX_FIT_ZOOM = 14;

/** Map padding applied during automatic fitting. */
const FIT_BOUNDS_PADDING: [number, number] = [32, 32];

/**
 * Fits the map around supplied features.
 *
 * @param props Features to display.
 * @returns No rendered element.
 */
function FitMapToData(props: { data: FeatureCollection }): null {
  const { data } = props;
  const map = useMap();

  useEffect(() => {
    if (data.features.length === 0) return;
    const bounds = L.geoJSON(data).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: FIT_BOUNDS_PADDING,
        maxZoom: MAX_FIT_ZOOM,
      });
    }
  }, [data, map]);

  return null;
}

/** Defines geometry map properties. */
type Props = {
  /** Source geometries displayed on the map. */
  items: StoredGeometry[];
  /** Optional computed geometry. */
  result: Feature | null;
  /** Adds one polygon drawn by the user. */
  onDraw: (feature: Feature) => void;
};

/**
 * Displays source and computed geometries on Leaflet.
 *
 * @param props Map features and result.
 * @returns Interactive map.
 */
export function GeometryMap(props: Props): ReactElement {
  const { items, result, onDraw } = props;
  const displayedData = useMemo(
    () =>
      featureCollection([
        ...items.map((item) => item.feature),
        ...(result ? [result] : []),
      ]),
    [items, result],
  );

  return (
    <section className="map-area" aria-labelledby="map-title">
      <h2 id="map-title" className="sr-only">
        Carte des géométries
      </h2>
      <MapContainer
        center={INITIAL_MAP_CENTER}
        zoom={INITIAL_MAP_ZOOM}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DrawingControls onDraw={onDraw} />
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
        <div className="map-legend">
          <span className="result-swatch" aria-hidden="true" />
          Résultat de l'opération
        </div>
      )}
    </section>
  );
}
