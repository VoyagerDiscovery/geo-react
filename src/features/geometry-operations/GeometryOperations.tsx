import { useState } from "react";
import type { Feature } from "geojson";
import type { GeometryOperation, StoredGeometry } from "../../types/geometry";
import { calculateGeometry } from "./calculateGeometry";

type Props = {
  items: StoredGeometry[];
  selectedIds: string[];
  result: Feature | null;
  onResult: (result: Feature | null) => void;
  onMessage: (message: string) => void;
};

export function GeometryOperations({
  items,
  selectedIds,
  result,
  onResult,
  onMessage,
}: Props) {
  const [operation, setOperation] = useState<GeometryOperation>("union");

  function runOperation() {
    try {
      const selectedFeatures = selectedIds.flatMap((id) => {
        const item = items.find((geometry) => geometry.id === id);
        return item ? [item.feature] : [];
      });
      const computed = calculateGeometry(selectedFeatures, operation);

      if (!computed) {
        onResult(null);
        onMessage("L\'opération ne produit aucune géométrie.");
        return;
      }

      computed.properties = { ...computed.properties, name: "Résultat" };
      onResult(computed);
      onMessage("Opération effectuée avec succès.");
    } catch (error) {
      onResult(null);
      onMessage(
        error instanceof Error ? error.message : "L\'opération a échoué.",
      );
    }
  }

  return (
    <section className="panel">
      <h2>3. Composer</h2>
      <div className="operation-row">
        <label className="sr-only" htmlFor="geometry-operation">
          Opération géométrique
        </label>
        <select
          id="geometry-operation"
          value={operation}
          onChange={(event) =>
            setOperation(event.target.value as GeometryOperation)
          }
        >
          <option value="union">Union</option>
          <option value="intersection">Intersection</option>
          <option value="difference">Soustraction</option>
        </select>
        <button
          className="primary"
          type="button"
          onClick={runOperation}
          disabled={selectedIds.length < 2}
        >
          Calculer
        </button>
      </div>
      <p className="hint">
        La soustraction retire les géométries suivantes de la première
        sélectionnée.
      </p>
      {result && (
        <button
          className="secondary"
          type="button"
          onClick={() => onResult(null)}
        >
          Masquer le résultat
        </button>
      )}
    </section>
  );
}
