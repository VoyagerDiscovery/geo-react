import { useCallback, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { Feature } from "geojson";
import { GeoJsonImport } from "./features/geojson-import/GeoJsonImport";
import { GeometryList } from "./features/geometry-list/GeometryList";
import { GeometryMap } from "./features/map/GeometryMap";
import { GeometryOperations } from "./features/geometry-operations/GeometryOperations";
import type { StoredGeometry } from "./types/geometry";

/** Number of available geometry colors. */
const COLOR_COUNT = 6;

/**
 * Coordinates shared state and application features.
 *
 * @returns Application interface.
 */
function App(): ReactElement {
  const nextColorIndex = useRef(0);
  const sourceNameCounters = useRef(new Map<string, number>());
  const [items, setItems] = useState<StoredGeometry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<Feature | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  /**
   * Adds validated features to the workspace.
   *
   * @param features Validated GeoJSON features.
   * @param sourceName Fallback feature name.
   * @returns Nothing.
   */
  const addFeatures = useCallback(
    (features: Feature[], sourceName = "Géométrie"): void => {
      const newItems = features.map((item) => {
        const propertyName =
          typeof item.properties?.name === "string"
            ? item.properties.name
            : null;
        const colorIndex = nextColorIndex.current % COLOR_COUNT;
        nextColorIndex.current += 1;

        let name = propertyName?.trim();
        if (!name) {
          const nextSourceNumber =
            (sourceNameCounters.current.get(sourceName) ?? 0) + 1;
          sourceNameCounters.current.set(sourceName, nextSourceNumber);
          name = `${sourceName} ${nextSourceNumber}`;
        }

        return {
          id: crypto.randomUUID(),
          name,
          colorIndex,
          feature: item,
        };
      });

      setItems((current) => [...current, ...newItems]);
      setResult(null);
      setMessage(
        `${newItems.length} géométrie${newItems.length > 1 ? "s" : ""} ajoutée${newItems.length > 1 ? "s" : ""}.`,
      );
    },
    [],
  );

  /** Adds one polygon drawn directly on the map. */
  const addDrawnFeature = useCallback(
    (feature: Feature): void => addFeatures([feature], "Polygone dessiné"),
    [addFeatures],
  );

  /**
   * Toggles one geometry selection.
   *
   * @param id Geometry identifier.
   * @returns Nothing.
   */
  function toggleSelection(id: string): void {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
    setResult(null);
  }

  /**
   * Removes one geometry and invalidates related state.
   *
   * @param id Geometry identifier.
   * @returns Nothing.
   */
  function removeItem(id: string): void {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((itemId) => itemId !== id));
    setResult(null);
  }

  return (
    <main className="app-shell">
      <aside id="sidebar" className="sidebar">
        <div className="sidebar-content">
          <header>
            <p className="eyebrow">Air Navigation SA · Projet technique</p>
            <h1>Geo-react</h1>
            <p className="intro">
              Dessinez, comparez et combinez des figures géographiques.
              <br />
              <br />
              Cliquez sur le bouton polygone à gauche de la carte, placez les
              sommets, puis cliquez sur le premier point pour terminer.
            </p>
          </header>

          <GeometryList
            items={items}
            selectedIds={selectedIds}
            onToggle={toggleSelection}
            onRemove={removeItem}
          />
          <GeometryOperations
            items={items}
            selectedIds={selectedIds}
            result={result}
            onResult={setResult}
            onMessage={setMessage}
          />

          <label className="advanced-mode">
            <input
              type="checkbox"
              checked={isAdvancedMode}
              onChange={(event) => setIsAdvancedMode(event.target.checked)}
            />
            Mode avancé
          </label>

          {isAdvancedMode && (
            <GeoJsonImport onImport={addFeatures} onMessage={setMessage} />
          )}

          {message && (
            <div className="status" role="status">
              {message}
            </div>
          )}
        </div>
      </aside>

      <GeometryMap items={items} result={result} onDraw={addDrawnFeature} />
    </main>
  );
}

export default App;
