import { useEffect, useState, useRef } from "react";
import WordCloud from "react-d3-cloud";

const NamesCloud = ({ data }) => {
  const [words, setWords] = useState([]);
  const containerRef = useRef();

  useEffect(() => {
    const wordList = data.reduce((acc, curr) => {
      if (acc[curr.user]) {
        acc[curr.user]++;
      } else {
        acc[curr.user] = 1;
      }
      return acc;
    }, {});

    setWords(
      Object.keys(wordList).map((key) => ({
        text: key,
        value: wordList[key] * 4,
      }))
    );
  }, [data]);

  const width = containerRef.current ? containerRef.current.offsetWidth : 0;
  const height = containerRef.current ? containerRef.current.offsetHeight : 0;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <WordCloud
        width={width}
        height={height}
        spiral="rectangular"
        fontSize={(word) => Math.log2(word.value) * 10}
        data={words}
      />
    </div>
  );
};

export default NamesCloud;