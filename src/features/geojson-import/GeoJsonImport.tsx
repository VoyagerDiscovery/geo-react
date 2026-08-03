import { useState } from "react";
import type { ReactElement } from "react";
import type { Feature } from "geojson";
import { parseGeoJson } from "./parseGeoJson";

/** Defines GeoJSON import component properties. */
type Props = {
  /** Sends validated features to the parent. */
  onImport: (features: Feature[], sourceName?: string) => void;
  /** Publishes user feedback. */
  onMessage: (message: string) => void;
};

/** Maximum accepted file size in bytes. */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Imports GeoJSON from files or text.
 *
 * @param props Import callbacks.
 * @returns Import panel.
 */
export function GeoJsonImport(props: Props): ReactElement {
  const { onImport, onMessage } = props;
  const [textValue, setTextValue] = useState("");

  /**
   * Imports the current text value.
   *
   * @returns Nothing.
   */
  function importText(): void {
    try {
      if (!textValue.trim()) {
        throw new Error("Collez d'abord un objet GeoJSON.");
      }
      onImport(parseGeoJson(textValue));
      setTextValue("");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "GeoJSON invalide.");
    }
  }

  /**
   * Reads and imports one local file.
   *
   * @param file Selected browser file.
   * @returns Completion promise.
   */
  async function importFile(file: File | undefined): Promise<void> {
    if (!file) return;

    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("Le fichier dépasse la taille maximale de 5 Mo.");
      }
      const sourceName = file.name.replace(/\.(geojson|json|txt)$/i, "");
      onImport(parseGeoJson(await file.text()), sourceName);
    } catch (error) {
      onMessage(
        error instanceof Error
          ? error.message
          : "Impossible de lire ce fichier.",
      );
    }
  }

  return (
    <section className="panel">
      <h2>1. Importer</h2>
      <label className="file-input">
        Choisir un fichier
        <input
          type="file"
          accept=".txt,.json,.geojson,application/json,application/geo+json,text/plain"
          onChange={(event) => {
            void importFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      <div className="separator">
        <span>ou coller du GeoJSON</span>
      </div>
      <textarea
        id="geojson-text"
        value={textValue}
        onChange={(event) => setTextValue(event.target.value)}
        placeholder='{"type":"Feature","geometry":{...}}'
        aria-label="Contenu GeoJSON à importer"
      />
      <button className="primary" type="button" onClick={importText}>
        Ajouter à la carte
      </button>
    </section>
  );
}
