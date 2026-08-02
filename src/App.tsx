import { useRef, useState } from "react";
import type { Feature } from "geojson";
import { GeoJsonImport } from "./features/geojson-import/GeoJsonImport";
import { GeometryList } from "./features/geometry-list/GeometryList";
import { GeometryMap } from "./features/map/GeometryMap";
import { GeometryOperations } from "./features/geometry-operations/GeometryOperations";
import type { StoredGeometry } from "./types/geometry";

const COLOR_COUNT = 6;

function App() {
  const nextColorIndex = useRef(0);
  const [items, setItems] = useState<StoredGeometry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<Feature | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function addFeatures(features: Feature[], sourceName = "Géométrie") {
    const newItems = features.map((item, index) => {
      const propertyName =
        typeof item.properties?.name === "string" ? item.properties.name : null;
      const colorIndex = nextColorIndex.current % COLOR_COUNT;
      nextColorIndex.current += 1;

      return {
        id: crypto.randomUUID(),
        name: propertyName?.trim() || `${sourceName} ${index + 1}`,
        colorIndex,
        feature: item,
      };
    });

    setItems((current) => [...current, ...newItems]);
    setResult(null);
    setMessage(
      `${newItems.length} géométrie${newItems.length > 1 ? "s" : ""} ajoutée${newItems.length > 1 ? "s" : ""}.`,
    );
  }

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id],
    );
    setResult(null);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedIds((current) => current.filter((itemId) => itemId !== id));
    setResult(null);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header>
          <p className="eyebrow">Air Navigation SA · Projet technique</p>
          <h1>Geo Composer</h1>
          <p className="intro">
            Importez, comparez et combinez des géométries GeoJSON.
          </p>
        </header>

        <GeoJsonImport onImport={addFeatures} onMessage={setMessage} />
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

        {message && (
          <div className="status" role="status">
            {message}
          </div>
        )}
      </aside>

      <GeometryMap items={items} result={result} />
    </main>
  );
}

export default App;
