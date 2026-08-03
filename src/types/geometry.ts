import type { Feature, MultiPolygon, Polygon } from "geojson";

/** Stores a validated GeoJSON feature with UI metadata. */
export type StoredGeometry = {
  /** Unique React and selection identifier. */
  id: string;
  /** User-visible geometry name. */
  name: string;
  /** Shared palette color index. */
  colorIndex: number;
  /** Validated GeoJSON feature. */
  feature: Feature;
};

/** Defines every supported geometry operation. */
export type GeometryOperation = "union" | "intersection" | "difference";

/** Restricts features to Turf-compatible polygon geometries. */
export type PolygonFeature = Feature<Polygon | MultiPolygon>;
