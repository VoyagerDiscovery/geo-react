import { difference, featureCollection, intersect, union } from "@turf/turf";
import type { Feature } from "geojson";
import type { GeometryOperation, PolygonFeature } from "../../types/geometry";

/**
 * Narrows a feature to a polygon feature.
 *
 * @param featureItem Feature to inspect.
 * @returns Polygon feature.
 * @throws When geometry is not polygonal.
 */
function asPolygon(featureItem: Feature): PolygonFeature {
  const type = featureItem.geometry?.type;

  if (type !== "Polygon" && type !== "MultiPolygon") {
    throw new Error(
      "Les opérations sont disponibles uniquement pour les polygones.",
    );
  }

  return featureItem as PolygonFeature;
}

/**
 * Executes a Turf operation on polygon features.
 *
 * @param features Selected features.
 * @param operation Requested operation.
 * @returns Computed geometry or empty result.
 * @throws When selection is insufficient or non-polygonal.
 */
export function calculateGeometry(
  features: Feature[],
  operation: GeometryOperation,
): PolygonFeature | null {
  if (features.length < 2) {
    throw new Error("Sélectionnez au moins deux géométries.");
  }

  const collection = featureCollection(features.map(asPolygon));

  if (operation === "union") return union(collection);
  if (operation === "intersection") return intersect(collection);
  return difference(collection);
}
