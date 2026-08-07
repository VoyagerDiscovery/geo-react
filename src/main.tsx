import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import L from "leaflet";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "./App.css";
import App from "./App";

type LeafletWindow = Window & { L: typeof L };

/** Loads Leaflet-Geoman before creating the Leaflet map. */
async function bootstrap(): Promise<void> {
  (window as LeafletWindow).L = L;
  await import("@geoman-io/leaflet-geoman-free");

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
