import type { StoredGeometry } from "../../types/geometry";
import type { ReactElement } from "react";

/** Defines geometry list properties. */
type Props = {
  /** Geometries available for display. */
  items: StoredGeometry[];
  /** Currently selected geometry identifiers. */
  selectedIds: string[];
  /** Toggles one geometry identifier. */
  onToggle: (id: string) => void;
  /** Removes one geometry identifier. */
  onRemove: (id: string) => void;
};

/**
 * Displays geometry selection and removal controls.
 *
 * @param props Geometry list data and callbacks.
 * @returns Geometry list panel.
 */
export function GeometryList(props: Props): ReactElement {
  const { items, selectedIds, onToggle, onRemove } = props;
  return (
    <section className="panel geometry-panel">
      <div className="section-title">
        <h2>2. Sélectionner</h2>
        <span
          aria-label={`${items.length} géométrie${items.length > 1 ? "s" : ""}`}
        >
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="empty">Aucune géométrie chargée.</p>
      ) : (
        <ul className="geometry-list">
          {items.map((item) => (
            <li key={item.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                />
                <span
                  className={`geometry-swatch color-${item.colorIndex}`}
                  aria-hidden="true"
                />
                <span title={item.name}>{item.name}</span>
              </label>
              <button
                type="button"
                className="remove"
                onClick={() => onRemove(item.id)}
                aria-label={`Supprimer ${item.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
