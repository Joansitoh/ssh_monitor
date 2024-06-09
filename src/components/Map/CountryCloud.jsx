import { useEffect, useState, useRef } from "react";
import WordCloud from "wordcloud";

const CountryCloud = ({ data }) => {
  const [words, setWords] = useState([]);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    WordCloud(canvas, {
      list: [
        ["Barcelona", 16],
        ["Budapest", 92],
        ["Tanhyeon", 4],
        ["Kaunas", 16],
        ["Moscow", 32],
        ["Hāpur", 4],
        ["Märsta", 4],
        ["Amsterdam", 36],
        ["Da Nang", 80],
        ["Kolkata", 4],
        ["Sydney", 16],
        ["Kharkiv", 4],
        ["Göteborg", 108],
        ["Ghāziābād", 4],
        ["Qingdao", 4],
        ["Lincolnwood", 4],
        ["Seoul", 4],
        ["Taiyuan", 4],
        ["Praia", 4],
        ["Oakland", 4],
        ["Eslöv", 4],
        ["Pasadena", 4],
        ["Kuningan", 4],
        ["Kasauli", 4],
      ],
      gridSize: Math.round(16 * window.devicePixelRatio),
      weightFactor: function (size) {
        return size * 2; // Ajusta este valor según tus necesidades
      },
      fontFamily: "Helvetica, Arial, sans-serif",
      color: "random-dark",
      backgroundColor: "#f0f0f0",
      rotateRatio: 0.5,
      rotationSteps: 2,
      shuffle: true,
      shape: "circle",
      drawOutOfBound: false,
      click: function (item) {
        alert(item[0] + ": " + item[1]);
      },
    });
  }, []);

  useEffect(() => {
    const wordList = data.reduce((acc, curr) => {
      if (acc[curr.location?.city || "Unknown"]) {
        acc[curr.location?.city || "Unknown"]++;
      } else {
        acc[curr.location?.city || "Unknown"] = 1;
      }
      return acc;
    }, {});

    setWords(Object.keys(wordList).map((key) => [key, wordList[key] * 4]));
  }, [data]);

  const width = containerRef.current ? containerRef.current.offsetWidth : 0;
  const height = containerRef.current ? containerRef.current.offsetHeight : 0;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CountryCloud;
