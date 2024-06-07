import { useState } from "react";
import { Chart } from "chart.js";

import SSHInvalidAttempts from "./components/Map/SSHInvalidAttempts";

import {
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale,
} from "chartjs-chart-geo";
import zoomPlugin from "chartjs-plugin-zoom";
import SSHSuccessSessions from "./components/Map/SSHSuccessSessions";
import InvalidSudo from "./components/Bar/InvalidSudo";
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
      <div className="flex-1 flex flex-col p-5 gap-2">
        <div className="flex gap-2">
          <div className="bg-zinc-800 h-60 w-full rounded-lg p-1 gap-2 flex flex-col border">
            <h1 className="text-xs font-bold text-zinc-100">
              Invalid SSH attempts map
            </h1>
            <SSHInvalidAttempts />
          </div>
          <div className="bg-zinc-800 h-60 w-full rounded-lg p-1 gap-2 flex flex-col border">
            <h1 className="text-xs font-bold text-zinc-100">
              Successful SSH sessions map
            </h1>
            <SSHSuccessSessions />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-60 w-full rounded-lg gap-2 flex">
            <div className="bg-zinc-800 h-full w-full rounded-lg p-1 gap-2 flex flex-col border">
              <h1 className="text-xs font-bold text-zinc-100">Invalid sudo</h1>
              <InvalidSudo />
            </div>
            <div className="bg-zinc-800 h-full w-[25%] rounded-lg p-1 gap-2 flex flex-col items-center justify-center border">
              <h1 className="text-6xl font-bold text-zinc-100">22</h1>
              <p className="text-md text-center text-zinc-300">
                Total Failed sudo attempts
              </p>
            </div>
          </div>
          <div className="h-60 w-full rounded-lg gap-2 flex">
            <div className="bg-zinc-800 h-full w-full rounded-lg p-1 gap-2 flex flex-col border">
              <h1 className="text-xs font-bold text-zinc-100">
                Successful sudo
              </h1>
              <InvalidSudo />
            </div>
            <div className="bg-zinc-800 h-full w-[25%] rounded-lg p-1 gap-2 flex flex-col items-center justify-center border">
              <h1 className="text-6xl font-bold text-zinc-100">22</h1>
              <p className="text-md text-center text-zinc-300">
                Total Success sudo attempts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
