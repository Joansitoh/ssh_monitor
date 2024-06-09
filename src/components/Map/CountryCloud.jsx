import { useEffect, useState, useRef } from "react";
import ReactWordcloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

const CountryCloud = ({ data }) => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    const wordList = data.reduce((acc, curr) => {
      if (acc[curr.location?.city || "Unknown"]) {
        acc[curr.location?.city || "Unknown"]++;
      } else {
        acc[curr.location?.city || "Unknown"] = 1;
      }
      return acc;
    }, {});

    setWords(
      Object.keys(wordList).map((key) => ({
        text: key,
        value: wordList[key],
      }))
    );
  }, [data]);

  const callbacks = {
    getWordTooltip: (word) => `${word.text}: ${word.value}`,
  };

  const options = {
    enableTooltip: true,
    deterministic: false,
    fontFamily: "impact",
    fontSizes: [5, 60],
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
    <div style={{ width: "100%", height: "100%" }}>
      <ReactWordcloud words={words} callbacks={callbacks} options={options} />
    </div>
  );
};

export default CountryCloud;
