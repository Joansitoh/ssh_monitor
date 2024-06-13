import { useEffect, useState } from "react";
import {
  MapContainer,
  CircleMarker,
  TileLayer,
  Tooltip as LeafTooltip,
} from "react-leaflet";
import ReactWordcloud from "react-wordcloud";
import Popup from "../Popup/Popup";
import { FaCloud, FaClipboardList } from "react-icons/fa";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";

const NamesCloud = ({ data }) => {
  const [mode, setMode] = useState("words");
  const [words, setWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    if (data) {
      const wordsArray = Object.keys(data).map((key) => ({
        text: key,
        value: data[key].count,
        cities: data[key].cities,
        locations: data[key].locations,
      }));
      wordsArray.sort((a, b) => b.value - a.value);
      setWords(wordsArray);

      const max = Math.max(...wordsArray.map((word) => word.value));
      setMaxValue(max);
    }
  }, [data]);

  const handleNextPage = async () => {
    if (loadingPage) return;
    setLoadingPage(true);

    try {
      const nextPage = page + 1;
      const response = await fetch(
        `api/ssh-logs/invalid/users?page=${nextPage}`
      );
      const result = await response.json();

      if (!result.error) {
        const newWords = Object.keys(result.usernames).map((key) => ({
          text: key,
          value: result.usernames[key].count,
          cities: result.usernames[key].cities,
          locations: result.usernames[key].locations,
        }));

        if (newWords.length === 0) {
          setLimitReached(true);
        } else {
          newWords.sort((a, b) => b.value - a.value);
          setWords((prev) => [...prev, ...newWords]);
          setPage(nextPage);

          const newMax = Math.max(
            maxValue,
            ...newWords.map((word) => word.value)
          );
          setMaxValue(newMax);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoadingPage(false);
    }
  };

  const calculateRadius = (count) => {
    if (maxValue === 0) return 0;
    const maxRadius = 50;
    return Math.sqrt(count / maxValue) * maxRadius;
  };

  const callbacks = {
    getWordTooltip: (word) => `${word.text}: ${word.value}`,
    onWordClick: (word) => setSelectedWord(word),
  };

  const options = {
    enableTooltip: true,
    deterministic: true,
    fontFamily: "impact",
    fontSizes: [5, 90],
    fontStyle: "normal",
    fontWeight: "normal",
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: "sqrt",
    spiral: "archimedean",
    transitionDuration: 1000,
  };

  return (
    <div className="w-full h-full relative">
      <div className="absolute left-2 top-2 flex flex-col">
        <div
          data-tooltip-id="buttons"
          data-tooltip-content="Show the word cloud"
          className="w-8 h-8 rounded-t bg-white hover:bg-gray-200 flex items-center justify-center border cursor-pointer"
          onClick={() => setMode("words")}
        >
          <FaCloud className="text-zinc-800" />
        </div>
        <div
          data-tooltip-id="buttons"
          data-tooltip-content="Show the list"
          className="w-8 h-8 rounded-b bg-white hover:bg-gray-200 flex items-center justify-center border cursor-pointer"
          onClick={() => setMode("list")}
        >
          <FaClipboardList className="text-zinc-800" />
        </div>
        <Tooltip id="buttons" />
      </div>
      <div style={{ width: "100%", height: "100%" }}>
        <Popup
          isOpen={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          closeOnOutsideClick
        >
          <div className="bg-zinc-800 shadow-lg drop-shadow-lg rounded-lg p-5 gap-2 flex flex-col">
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <h1 className="text-lg font-medium">Uses of user:</h1>
                <h1 className="text-lg font-bold text-red-500">
                  {selectedWord?.text}
                </h1>
              </div>
              <div className="flex gap-2 items-center">
                <h1 className="text-sm font-bold px-3 py-1 border-red-500 bg-red-500 bg-opacity-25 rounded">
                  {selectedWord?.value}
                </h1>
              </div>
            </div>
            <MapContainer
              style={{ height: "500px", width: "500px" }}
              zoom={1}
              center={[-0.09, 51.505]}
              maxBounds={[
                [-120, -300],
                [120, 300],
              ]}
            >
              <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {selectedWord &&
                Object.entries(selectedWord.cities).map(([city, attempts]) => {
                  const location = selectedWord.locations[city];
                  if (!location) return null;

                  const [lat, long] = location.split(",").map(parseFloat);
                  if (isNaN(lat) || isNaN(long)) return null;

                  return (
                    <CircleMarker
                      key={city}
                      center={[lat, long]}
                      radius={calculateRadius(attempts)}
                      fillOpacity={0.5}
                      stroke={false}
                      color="red"
                    >
                      <LeafTooltip
                        direction="right"
                        offset={[-8, -2]}
                        opacity={0.8}
                      >
                        <span>{city}</span>
                        <br />
                        <span>
                          {attempts} attempts (
                          {selectedWord.value > 0
                            ? ((attempts / selectedWord.value) * 100).toFixed(2)
                            : 0}
                          %)
                        </span>
                      </LeafTooltip>
                    </CircleMarker>
                  );
                })}
            </MapContainer>
          </div>
        </Popup>
        {mode === "words" ? (
          <ReactWordcloud
            words={words}
            options={options}
            callbacks={callbacks}
          />
        ) : (
          <div className="w-full h-full flex flex-col overflow-auto">
            <div className="grid grid-cols-4 gap-4 p-4">
              {words.map((word) => (
                <div key={word.text}>
                  <p>
                    {word.text}: <strong>{word.value}</strong>
                  </p>
                </div>
              ))}
              {!limitReached && (
                <motion.div
                  className="col-span-4 flex justify-center items-center"
                  onViewportEnter={handleNextPage}
                >
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"
                    id="loader"
                  ></div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NamesCloud;
