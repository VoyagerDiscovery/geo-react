import { useEffect } from "react";
import type { Feature } from "geojson";
import L from "leaflet";
import type {} from "@geoman-io/leaflet-geoman-free";
import { useMap } from "react-leaflet";

type Props = {
  /** Receives each polygon drawn on the map. */
  onDraw: (feature: Feature) => void;
};

/**
 * Adds polygon drawing controls to Leaflet.
 *
 * @param props Drawing callback.
 * @returns No rendered element.
 */
export function DrawingControls(props: Props): null {
  const { onDraw } = props;
  const map = useMap();

  useEffect(() => {
    map.pm.setLang("fr");
    map.pm.setGlobalOptions({ allowSelfIntersection: false });
    map.pm.addControls({
      position: "topleft",
      drawPolygon: true,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawText: false,
      drawCircle: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    });

    const handleCreate: L.PM.CreateEventHandler = (event) => {
      if (!(event.layer instanceof L.Polygon)) return;

      const feature = event.layer.toGeoJSON() as Feature;
      map.removeLayer(event.layer);
      onDraw(feature);
    };

    map.on("pm:create", handleCreate);

    return () => {
      map.off("pm:create", handleCreate);
      map.pm.removeControls();
    };
  }, [map, onDraw]);

  return null;
}
