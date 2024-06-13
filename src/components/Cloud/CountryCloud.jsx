import { useEffect, useState, useRef } from "react";
import ReactWordcloud from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

const CountryCloud = ({ data }) => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    if (!data) return;

    const wordsArray = Object.keys(data).map((key) => ({
      text: key,
      value: data[key].count,
      cities: data[key].cities,
      locations: data[key].locations,
    }));

    // Ordena las palabras en orden descendente por valor
    wordsArray.sort((a, b) => b.value - a.value);

    setWords(wordsArray);
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
