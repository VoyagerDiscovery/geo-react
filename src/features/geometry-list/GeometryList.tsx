import type { StoredGeometry } from "../../types/geometry";

type Props = {
  items: StoredGeometry[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
};

export function GeometryList({
  items,
  selectedIds,
  onToggle,
  onRemove,
}: Props) {
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
