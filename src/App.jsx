import { useState } from "react";
import { Chart } from "chart.js";

import InvalidSSHMap from "./components/InvalidSSHMap";

import {
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale,
} from "chartjs-chart-geo";
import zoomPlugin from "chartjs-plugin-zoom";
Chart.register(
  zoomPlugin,
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale
);

function App() {
  return (
    <div className="h-screen w-full flex flex-col bg-zinc-900">
      <div className="h-24 p-5 flex items-center border-b">
        <h1 className="text-2xl font-bold text-zinc-100">SSH Monitor</h1>
      </div>
      <div className="flex-1 flex flex-col p-5">
        <div className="flex gap-5">
          <div className="bg-zinc-800 h-60 w-full rounded-lg">
            <InvalidSSHMap />
          </div>
          <div className="bg-zinc-800 h-60 w-full rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
