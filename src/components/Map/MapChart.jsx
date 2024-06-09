import React, { useEffect, useRef, useState } from "react";
import { BubbleMapChart, topojson } from "chartjs-chart-geo";
import world from "../../assets/countries-110m.json";
import Chart from "chart.js/auto";
import { getCountry } from "iso-3166-1-alpha-2";

const worldFeatures = topojson.feature(world, world.objects.countries).features;

const tempData = {
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

const obtainDataset = (data) => {
  const labels = [];
  const datasets = [
    {
      label: "Invalid SSH",
      outline: worldFeatures,
      showOutline: true,
      backgroundColor: "steelblue",
      data: [],
    },
  ];

  data.forEach(async (item) => {
    const [longitude, latitude] = item.location.loc.split(",").map(parseFloat);
    const country = item.location.city;

    const index = labels.indexOf(country);
    if (index === -1) {
      labels.push(country);
      if (country === "Unknown" || longitude === 0 || latitude === 0) {
        datasets[0].data.push({
          x: 0,
          y: 0,
          r: 1,
          description: "Unknown",
          value: 1,
        });
      } else {
        datasets[0].data.push({
          name: country,
          x: latitude,
          y: longitude,
          value: 1,
        });
      }
    } else {
      datasets[0].data[index].value += 1;
    }
  });

  return { labels, datasets };
};

const MapChart = ({ data }) => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef();
  const wrapperRef = useRef();

  // Clone and interactivity
  const [zoom, setZoom] = useState(2);
  const [offset, setOffset] = useState([0, 0]);

  const [imageSrc, setImageSrc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current.getContext("2d");
    const newChart = new BubbleMapChart(chartInstance, {
      type: "bubbleMap",
      data: obtainDataset(data),
      options: getChartOptions(offset, zoom),
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [chartRef, data]);

  useEffect(() => {
    if (!chartRef.current) return;
    const startPos = { x: 0, y: 0 };

    const mouseDownListener = (e) => {
      startPos.x = e.clientX;
      startPos.y = e.clientY;
      const wrapper = wrapperRef.current;

      setShowPreview(true);

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
          prevOffset[0] + (e.clientX - startPos.x),
          prevOffset[1] + (e.clientY - startPos.y),
        ]);
        wrapper.style.left = 0;
        wrapper.style.top = 0;
        chartRef.current.removeEventListener("mouseup", mouseUpListener);

        setShowPreview(false);
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

  useEffect(() => {
    if (!chart) return;

    chart.options = getChartOptions(offset, zoom);
    chart.update();

    // Generate image preview
    const imgUrl = chartRef.current.toDataURL("image/png");
    setImageSrc(imgUrl);
  }, [chart, offset, zoom]);

  useEffect(() => {
    if (!chartRef.current || !chart) return;

    chart.options = getChartOptions(offset, zoom);
    chart.update();

    if (showPreview) {
      const imgUrl = chartRef.current.toDataURL("image/png");
      setImageSrc(imgUrl);
    }
  }, [chart, offset, zoom, showPreview]);

  function getChartOptions(offset, zoom) {
    return {
      plugins: {
        legend: {
          display: false,
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
          outlineBorderWidth: 0.2,
          outlineBackgroundColor: "rgba(0, 0, 0, 0.5)",
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
      },
      layout: {},
    };
  }

  return (
    <>
      <div
        className="w-full absolute pointer-events-none opacity-30"
        ref={wrapperRef}
      >
        {showPreview && imageSrc && <img src={imageSrc} alt="Chart Preview" />}
      </div>
      <div className="w-full absolute">
        <canvas ref={chartRef} />
      </div>
    </>
  );
};

export default MapChart;
