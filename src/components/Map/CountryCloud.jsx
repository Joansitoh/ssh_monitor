import { useEffect, useState, useRef } from "react";
import WordCloud from "wordcloud";

const CountryCloud = ({ data }) => {
  const [words, setWords] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    WordCloud(canvas, {
      list: words || [["No data available yet", 100]],
      gridSize: 8,
      weightFactor: 10,
      fontFamily: "Times, serif",
      color: "random-dark",
      backgroundColor: "#fff",
      rotateRatio: 0.5,
      rotationSteps: 2,
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
