import { useState } from "react";
import type { ReactElement } from "react";
import type { Feature } from "geojson";
import type { GeometryOperation, StoredGeometry } from "../../types/geometry";
import { calculateGeometry } from "./calculateGeometry";

/** Defines geometry operation panel properties. */
type Props = {
  /** Geometries available for calculations. */
  items: StoredGeometry[];
  /** Ordered selected geometry identifiers. */
  selectedIds: string[];
  /** Current computed result. */
  result: Feature | null;
  /** Updates the computed result. */
  onResult: (result: Feature | null) => void;
  /** Publishes user feedback. */
  onMessage: (message: string) => void;
};

/**
 * Runs geometry operations on selected features.
 *
 * @param props Operation data and callbacks.
 * @returns Operation panel.
 */
export function GeometryOperations(props: Props): ReactElement {
  const { items, selectedIds, result, onResult, onMessage } = props;
  const [operation, setOperation] = useState<GeometryOperation>("union");

  /**
   * Computes and publishes the selected operation.
   *
   * @returns Nothing.
   */
  function runOperation(): void {
    try {
      const selectedFeatures = selectedIds.flatMap((id) => {
        const item = items.find((geometry) => geometry.id === id);
        return item ? [item.feature] : [];
      });
      const computed = calculateGeometry(selectedFeatures, operation);

      if (!computed) {
        onResult(null);
        onMessage("L'opération ne produit aucune géométrie.");
        return;
      }

      computed.properties = { ...computed.properties, name: "Résultat" };
      onResult(computed);
      onMessage("Opération effectuée avec succès.");
    } catch (error) {
      onResult(null);
      onMessage(
        error instanceof Error ? error.message : "L'opération a échoué.",
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
