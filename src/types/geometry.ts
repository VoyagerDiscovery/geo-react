import type { Feature, MultiPolygon, Polygon } from "geojson";

export type StoredGeometry = {
  id: string;
  name: string;
  colorIndex: number;
  feature: Feature;
};

export type GeometryOperation = "union" | "intersection" | "difference";

export type PolygonFeature = Feature<Polygon | MultiPolygon>;
