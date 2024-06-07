import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { BubbleMapChart, topojson } from "chartjs-chart-geo";
import world from "../assets/countries-110m.json";

const worldFeatures = topojson.feature(world, world.objects.countries).features;

const data = {
  labels: ["New York", "Los Angeles"],
  datasets: [
    {
      label: "Invalid SSH",
      outline: worldFeatures,
      showOutline: true,
      backgroundColor: "steelblue",
      data: [
        {
          x: -74.006,
          y: 40.7128,
          r: 10,
          description: "New York",
          value: Math.round(Math.random() * 10),
        },
        {
          x: -118.2437,
          y: 34.0522,
          r: 5,
          description: "Los Angeles",
          value: Math.round(Math.random() * 10),
        },
      ],
    },
  ],
};

const InvalidSSHMap = () => {
  const [offset, setOffset] = useState([0, 0]);
  const [zoom, setZoom] = useState(1);

  const [chart, setChart] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    if (!chartRef.current) return;
    const chartInstance = chartRef.current.getContext("2d");
    const newChart = new BubbleMapChart(chartInstance, {
      type: "bubbleMap",
      data: data,
      options: getChartOptions(offset, zoom),
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [chartRef]);

  useEffect(() => {
    if (!chart) return;
    chart.options = getChartOptions(offset, zoom);
    chart.update();
  }, [chart, offset, zoom]);

  useEffect(() => {
    if (!chartRef.current) return;
    const startPos = { x: 0, y: 0 };

    const mouseDownListener = (e) => {
      startPos.x = e.clientX;
      startPos.y = e.clientY;
      const clone = chartRef.current.cloneNode(true);
      const wrapper = document.getElementById("cloneWrapper");
      wrapper.appendChild(clone);

      const moveListener = (e) => {
        e.preventDefault();
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        wrapper.style.left = `${chartRef.current.offsetLeft + dx}px`;
        wrapper.style.top = `${chartRef.current.offsetTop + dy}px`;
      };

      chartRef.current.addEventListener("mousemove", moveListener);

      const mouseUpListener = (e) => {
        chartRef.current.removeEventListener("mousemove", moveListener);
        setOffset((prevOffset) => [
          prevOffset[0] + (e.clientX - startPos.x) * 0.1,
          prevOffset[1] + (e.clientY - startPos.y) * 0.1,
        ]);
        wrapper.removeChild(clone);
        chartRef.current.removeEventListener("mouseup", mouseUpListener);
      };

      chartRef.current.addEventListener("mouseup", mouseUpListener, {
        once: true,
      });
    };

    chartRef.current.addEventListener("mousedown", mouseDownListener);

    chartRef.current.addEventListener("wheel", (e) => {
      e.preventDefault();
      setZoom((prevZoom) => {
        const newZoom = prevZoom + e.deltaY * -0.001;
        return Math.min(Math.max(newZoom, 0.7), 5);
      });
    });

    return () => {
      chartRef.current.removeEventListener("mousedown", mouseDownListener);
    };
  }, [chartRef]);

  function getChartOptions(offset, zoom) {
    return {
      plugins: {
        legend: {
          display: true,
        },
        datalabels: {
          align: "top",
          formatter: (v) => {
            return v.description;
          },
        },
      },
      elements: {
        geoFeature: {
          outlineBorderColor: "#FFFFFF",
          outlineBorderWidth: 0.5,
        },
      },
      scales: {
        projection: {
          axis: "x",
          projection: "equirectangular",
          projectionOffset: offset,
          projectionScale: zoom,
        },
        size: {
          axis: "x",
          size: [1, 50],
        },
        color: {
          axis: "x",
          color: "value",
          colors: ["#000"],
        },
      },
      layout: {},
    };
  }

  return (
    <div className="w-full h-full relative overflow-clip">
      <div className="w-full absolute">
        <div id="cloneWrapper" className="bg-red-500"></div>
      </div>
      <div className="w-full absolute">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default InvalidSSHMap;
