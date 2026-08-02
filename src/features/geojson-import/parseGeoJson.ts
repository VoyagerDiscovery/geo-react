import { feature } from "@turf/turf";
import type { Feature, Geometry, Position } from "geojson";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertPosition(
  value: unknown,
  context: string,
): asserts value is Position {
  if (
    !Array.isArray(value) ||
    value.length < 2 ||
    !value.every(
      (coordinate) =>
        typeof coordinate === "number" && Number.isFinite(coordinate),
    )
  ) {
    throw new Error(`${context} doit contenir au moins deux nombres finis.`);
  }
}

function assertLine(value: unknown, context: string, minimum = 2): void {
  if (!Array.isArray(value) || value.length < minimum) {
    throw new Error(`${context} doit contenir au moins ${minimum} positions.`);
  }
  value.forEach((position, index) =>
    assertPosition(position, `${context}, position ${index + 1}`),
  );
}

function assertRing(value: unknown, context: string): void {
  assertLine(value, context, 4);
  const ring = value as Position[];
  const first = ring[0]!;
  const last = ring[ring.length - 1]!;

  if (
    first.length !== last.length ||
    first.some((value, index) => value !== last[index])
  ) {
    throw new Error(
      `${context} doit être fermé (première et dernière positions identiques).`,
    );
  }
}

function validateGeometry(value: unknown, context: string): Geometry {
  if (!isObject(value) || typeof value.type !== "string") {
    throw new Error(`${context} ne contient pas de géométrie GeoJSON valide.`);
  }

  const coordinates = value.coordinates;

  switch (value.type) {
    case "Point":
      assertPosition(coordinates, `${context} Point`);
      break;
    case "MultiPoint":
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error(`${context} MultiPoint est vide.`);
      }
      coordinates.forEach((position, index) =>
        assertPosition(position, `${context} MultiPoint ${index + 1}`),
      );
      break;
    case "LineString":
      assertLine(coordinates, `${context} LineString`);
      break;
    case "MultiLineString":
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error(`${context} MultiLineString est vide.`);
      }
      coordinates.forEach((line, index) =>
        assertLine(line, `${context} ligne ${index + 1}`),
      );
      break;
    case "Polygon":
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error(`${context} Polygon est vide.`);
      }
      coordinates.forEach((ring, index) =>
        assertRing(ring, `${context} anneau ${index + 1}`),
      );
      break;
    case "MultiPolygon":
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        throw new Error(`${context} MultiPolygon est vide.`);
      }
      coordinates.forEach((polygon, polygonIndex) => {
        if (!Array.isArray(polygon) || polygon.length === 0) {
          throw new Error(`${context} polygone ${polygonIndex + 1} est vide.`);
        }
        polygon.forEach((ring, ringIndex) =>
          assertRing(
            ring,
            `${context} polygone ${polygonIndex + 1}, anneau ${ringIndex + 1}`,
          ),
        );
      });
      break;
    case "GeometryCollection": {
      if (!Array.isArray(value.geometries) || value.geometries.length === 0) {
        throw new Error(`${context} GeometryCollection est vide.`);
      }
      value.geometries.forEach((geometry, index) =>
        validateGeometry(geometry, `${context}, géométrie ${index + 1}`),
      );
      break;
    }
    default:
      throw new Error(`Type GeoJSON inconnu : « ${value.type} ».`);
  }

  return value as unknown as Geometry;
}

function validateFeature(value: unknown, context: string): Feature {
  if (!isObject(value) || value.type !== "Feature") {
    throw new Error(`${context} n\'est pas une Feature GeoJSON.`);
  }
  if (value.properties !== null && !isObject(value.properties)) {
    throw new Error(`${context}.properties doit être un objet ou null.`);
  }

  return {
    type: "Feature",
    geometry: validateGeometry(value.geometry, context),
    properties: (value.properties ?? null) as Feature["properties"],
    ...(typeof value.id === "string" || typeof value.id === "number"
      ? { id: value.id }
      : {}),
  };
}

export function parseGeoJson(value: string): Feature[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Le fichier ne contient pas du JSON valide.");
  }

  if (!isObject(parsed) || typeof parsed.type !== "string") {
    throw new Error("Le contenu ne ressemble pas à du GeoJSON.");
  }

  if (parsed.type === "FeatureCollection") {
    if (!Array.isArray(parsed.features) || parsed.features.length === 0) {
      throw new Error("La collection est vide ou invalide.");
    }
    return parsed.features.map((item, index) =>
      validateFeature(item, `Feature ${index + 1}`),
    );
  }

  if (parsed.type === "Feature") return [validateFeature(parsed, "Feature")];

  const geometry = validateGeometry(parsed, "Géométrie");
  if (geometry.type === "GeometryCollection") {
    return geometry.geometries.map((item) => feature(item));
  }
  return [feature(geometry)];
}
