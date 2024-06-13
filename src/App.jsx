import { useEffect, useState } from "react";
import { Chart } from "chart.js";
import "chartjs-adapter-date-fns";
import "chartjs-adapter-moment";

import {
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale,
} from "chartjs-chart-geo";
import zoomPlugin from "chartjs-plugin-zoom";

import BoardCard from "./components/Card/BoardCard";
import BarChart from "./components/Bar/BarChart";
import MapChart from "./components/Map/MapChart";
import ColorScheme from "./components/Colors/ColorScheme";
import CountryCloud from "./components/Cloud/CountryCloud";
import NamesCloud from "./components/Cloud/NamesCloud";

import logo from "./assets/logo.png";
import github from "./assets/github.ico";
Chart.register(
  zoomPlugin,
  ChoroplethController,
  GeoFeature,
  ColorScale,
  ProjectionScale
);

function App() {
  const [loading, setLoading] = useState(true);

  // 6 hours
  const defaultRange = [
    new Date().getTime(),
    new Date().getTime() - 2 * 60 * 60 * 1000,
  ];

  // SSH Data
  const [sshSuccessGeneral, setSshSuccessGeneral] = useState([]);
  const [sshInvalidGeneral, setSshInvalidGeneral] = useState([]);

  // Sudo Data
  const [sudoSuccessGeneral, setSudoSuccessGeneral] = useState([]);
  const [sudoInvalidGeneral, setSudoInvalidGeneral] = useState([]);

  useEffect(() => {
    const fetchSuccessGeneral = async () => {
      const sshResponse = await fetch("api/ssh-logs/success/general");
      const sshData = await sshResponse.json();
      if (!sshData.error) setSshSuccessGeneral(sshData);

      const sudoResponse = await fetch("api/sudo-logs/success/general");
      const sudoData = await sudoResponse.json();
      if (!sudoData.error) setSudoSuccessGeneral(sudoData);
    };

    const fetchInvalidGeneral = async () => {
      const sshResponse = await fetch("api/ssh-logs/invalid/general");
      const sshData = await sshResponse.json();
      if (!sshData.error) setSshInvalidGeneral(sshData);

      const sudoResponse = await fetch("api/sudo-logs/invalid/general");
      const sudoData = await sudoResponse.json();
      if (!sudoData.error) setSudoInvalidGeneral(sudoData);
    };

    // General data
    fetchSuccessGeneral();
    fetchInvalidGeneral();

    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-900">
      <div className="h-24 p-5 flex justify-between items-center border-b gap-2">
        <div className="flex gap-2 items-center">
          <img src={logo} alt="logo" className="h-10" />
          <h1 className="text-3xl font-bold text-zinc-100">
            NetVisr SSH Monitor
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          <img
            src={github}
            alt="github"
            className="h-10 cursor-pointer"
            onClick={() =>
              window.open("https://github.com/joansitoh/ssh-monitor/", "_blank")
            }
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col p-5 gap-2">
        <div className="flex gap-2">
          <BoardCard title="Invalid SSH attempts">
            <MapChart data={loading ? [] : sshInvalidGeneral?.countries} total={sshInvalidGeneral?.total} />
          </BoardCard>
          <BoardCard title="Successful SSH sessions">
            <MapChart data={loading ? [] : sshSuccessGeneral?.countries} total={sshSuccessGeneral?.total} />
          </BoardCard>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2 w-full">
            <BoardCard title="Invalid SSH attempts">
              <BarChart
                endpoint="ssh-logs/invalid/data"
                scheme={ColorScheme.RedScheme}
                legend={false}
              />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {loading ? 0 : sshInvalidGeneral?.total}
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
                endpoint="ssh-logs/success/data"
                scheme={ColorScheme.GreenScheme}
              />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {loading ? 0 : sshSuccessGeneral?.total}
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
              <BarChart
                endpoint="sudo-logs/invalid/data"
                scheme={ColorScheme.RedScheme}
              />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {loading ? 0 : sudoInvalidGeneral?.total}
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
                endpoint="sudo-logs/success/data"
                scheme={ColorScheme.GreenScheme}
              />
            </BoardCard>
            <BoardCard width="25%">
              <div className="flex flex-col justify-center items-center w-full h-full">
                <h1 className="text-6xl font-bold text-zinc-100">
                  {loading ? 0 : sudoSuccessGeneral?.total}
                </h1>
                <p className="text-md text-center text-zinc-300">
                  Total Successful sudo sessions
                </p>
              </div>
            </BoardCard>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <BoardCard height={300} title="Invalid SSH Names">
            <div className="h-full w-full">
              <NamesCloud data={loading ? [] : sshInvalidGeneral?.usernames} />
            </div>
          </BoardCard>
          <BoardCard height={300} title="Invalid SSH Countries">
            <div className="h-full w-full">
              <CountryCloud data={loading ? [] : sshInvalidGeneral?.cities} />
            </div>
          </BoardCard>
        </div>
      </div>
    </div>
  );
}

export default App;
