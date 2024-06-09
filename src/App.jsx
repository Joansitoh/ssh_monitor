import { useEffect, useState } from "react";
import { Chart } from "chart.js";
import "chartjs-adapter-date-fns";
import "chartjs-adapter-moment";

import SSHInvalidAttempts from "./components/Map/SSHInvalidAttempts";

import {
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale,
} from "chartjs-chart-geo";
import zoomPlugin from "chartjs-plugin-zoom";
import SSHSuccessSessions from "./components/Map/SSHSuccessSessions";
import BoardCard from "./components/Card/BoardCard";
import BarChart from "./components/Bar/BarChart";
import MapChart from "./components/Map/MapChart";
import ColorScheme from "./components/Colors/ColorScheme";
Chart.register(
  zoomPlugin,
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale
);

function App() {
  const [loading, setLoading] = useState(true);

  const [sshSuccessData, setSshSuccessData] = useState([]);
  const [sshInvalidData, setSshInvalidData] = useState([]);
  const [sudoSuccessData, setSudoSuccessData] = useState([]);
  const [sudoInvalidData, setSudoInvalidData] = useState([]);

  useEffect(() => {
    const fetchSuccessData = async () => {
      const response = await fetch("api/ssh-logs/success");
      const data = await response.json();
      if (!data.error) setSshSuccessData(Object.values(data) || []);
    };

    const fetchInvalidData = async () => {
      const response = await fetch("api/ssh-logs/invalid");
      const data = await response.json();
      if (!data.error) setSshInvalidData(Object.values(data) || []);
    };

    const fetchSudoData = async () => {
      const response = await fetch("api/sudo-logs/success");
      const data = await response.json();
      if (!data.error) setSudoSuccessData(Object.values(data) || []);
    };

    const fetchInvalidSudoData = async () => {
      const response = await fetch("api/sudo-logs/invalid");
      const data = await response.json();
      if (!data.error) setSudoInvalidData(Object.values(data) || []);
    };

    fetchSudoData();
    fetchInvalidSudoData();
    fetchInvalidData();
    fetchSuccessData();
    setLoading(false);
  }, []);

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
            <MapChart data={sshSuccessData} />
          </BoardCard>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 w-full">
            <BoardCard title="Invalid SSH attempts">
              <BarChart data={sshInvalidData} scheme={ColorScheme.RedScheme} />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {loading ? 0 : Object.keys(sshInvalidData).length}
                </h1>
                <p className="text-md text-center text-zinc-300">
                  Total Failed SSH attempts
                </p>
              </div>
            </BoardCard>
          </div>
          <div className="flex gap-2 w-full">
            <BoardCard title="Successful SSH sessions">
              <BarChart
                data={sshSuccessData}
                scheme={ColorScheme.GreenScheme}
              />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {Object.keys(sshSuccessData).length}
                </h1>
                <p className="text-md text-center text-zinc-300">
                  Total Successful SSH sessions
                </p>
              </div>
            </BoardCard>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 w-full">
            <BoardCard title="Invalid sudo">
              <BarChart data={sudoInvalidData} scheme={ColorScheme.RedScheme} />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {Object.keys(sudoInvalidData).length}
                </h1>
                <p className="text-md text-center text-zinc-300">
                  Total Failed sudo attempts
                </p>
              </div>
            </BoardCard>
          </div>
          <div className="flex gap-2 w-full">
            <BoardCard title="Successful sudo">
              <BarChart
                data={sudoSuccessData}
                scheme={ColorScheme.GreenScheme}
              />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {Object.keys(sudoSuccessData).length}
                </h1>
                <p className="text-md text-center text-zinc-300">
                  Total Successful sudo sessions
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
