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
import BoardCard from "./components/Card/BoardCard";
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
          <BoardCard title="Invalid SSH attempts">
            <SSHInvalidAttempts />
          </BoardCard>
          <BoardCard title="Successful SSH sessions">
            <SSHSuccessSessions />
          </BoardCard>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 w-full">
            <BoardCard title="Invalid sudo">
              <InvalidSudo />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">22</h1>
                <p className="text-md text-center text-zinc-300">
                  Total Failed sudo attempts
                </p>
              </div>
            </BoardCard>
          </div>
          <div className="flex gap-2 w-full">
            <BoardCard title="Successful sudo">
              <InvalidSudo />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">22</h1>
                <p className="text-md text-center text-zinc-300">
                  Total Successful sudo sessions
                </p>
              </div>
            </BoardCard>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 w-full">
            <BoardCard title="Invalid SSH attempts">
              <InvalidSudo />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">22</h1>
                <p className="text-md text-center text-zinc-300">
                  Total Failed SSH attempts
                </p>
              </div>
            </BoardCard>
          </div>
          <div className="flex gap-2 w-full">
            <BoardCard title="Successful SSH sessions">
              <InvalidSudo />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">22</h1>
                <p className="text-md text-center text-zinc-300">
                  Total Successful SSH sessions
                </p>
              </div>
            </BoardCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
