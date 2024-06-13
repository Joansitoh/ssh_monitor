import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ColorScheme from "../Colors/ColorScheme";

// Util functions
const stringToHash = (str) => {
  return str.split("").reduce((hash, char) => {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    return hash & hash; // Convert to 32bit integer
  }, 0);
};

const getColorForUser = (user, scheme) => {
  const index = Math.abs(stringToHash(user)) % scheme.length;
  return scheme[index];
};

// Fetch data function
const fetchData = async ({ endpoint, minDate, maxDate, data, setData }) => {
  const response = await fetch(
    `api/${endpoint}?start=${minDate.getTime()}&end=${maxDate.getTime()}`
  );
  const json = await response.json();

  if (!json.error) {
    const newData = json.filter(
      (entry) => !data.some((item) => item.timestamp === entry.timestamp)
    );
    setData((prevData) => [...prevData, ...newData]);
  }
};

const BarChart = ({
  endpoint,
  scheme = ColorScheme.RedScheme,
  legend = true,
}) => {
  const [chart, setChart] = useState(null);
  const [data, setData] = useState([]);
  const chartRef = useRef();

  // Initial data fetch
  useEffect(() => {
    const minDate = new Date();
    minDate.setHours(minDate.getHours() - 2);
    const maxDate = new Date();

    fetchData({ endpoint, minDate, maxDate, data, setData });
  }, [endpoint]);

  // Filter data within range
  const filterDataWithinRange = (data, minTime, maxTime, buffer = 100) => {
    const filteredData = data.filter(
      (entry) => entry.timestamp >= minTime && entry.timestamp <= maxTime
    );
    const bufferData = data
      .filter((entry) => entry.timestamp > maxTime)
      .slice(0, buffer);
    return [...filteredData, ...bufferData];
  };

  // Create datasets
  const obtainDatasets = (data) => {
    const groupedData = data.reduce((acc, { user, timestamp }) => {
      const hour = new Date(timestamp);
      hour.setSeconds(0, 0);

      const timeKey = hour.getTime();
      acc[timeKey] = acc[timeKey] || {};
      acc[timeKey][user] = (acc[timeKey][user] || 0) + 1;
      return acc;
    }, {});

    const datasets = Object.keys(groupedData).flatMap((timeKey) => {
      return Object.entries(groupedData[timeKey]).map(([user, count]) => ({
        x: parseInt(timeKey, 10),
        y: count,
        user,
      }));
    });

    const userGroups = datasets.reduce((acc, { x, y, user }) => {
      acc[user] = acc[user] || [];
      acc[user].push({ x, y });
      return acc;
    }, {});

    return Object.entries(userGroups).map(([user, data]) => {
      const color = getColorForUser(user, scheme);
      const colorString = `rgba(${color.r},${color.g},${color.b}`;

      return {
        label: user,
        backgroundColor: `${colorString},0.2)`,
        borderColor: `${colorString},1)`,
        borderWidth: 1,
        hoverBackgroundColor: `${colorString},0.4)`,
        hoverBorderColor: `${colorString},1)`,
        data,
      };
    });
  };

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current.getContext("2d");
    const newChart = new Chart(chartInstance, {
      type: "bar",
      data: { datasets: obtainDatasets(data) },
      options: {
        plugins: {
          legend: { display: legend, position: "right" },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
              onPanComplete: ({ chart }) => {
                const { min, max } = chart.scales.x;
                const minDate = new Date(min);
                const maxDate = new Date(max);
                setData(filterDataWithinRange(data, min, max));

                fetchData({ endpoint, minDate, maxDate, data, setData });
              },
            },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "x",
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            type: "time",
            time: {
              unit: data.length > 0 ? "minute" : undefined,
              tooltipFormat: "YYYY-MM-DD HH:mm",
              displayFormats: { hour: "HH:mm" },
            },
            grid: { display: false },
            suggestedMin: new Date().setHours(new Date().getHours() - 2),
            suggestedMax: Date.now(),
            ticks: { maxRotation: 0, autoSkip: true },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 10,
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    setChart(newChart);

    return () => newChart.destroy();
  }, [chartRef]);

  // Update chart data
  useEffect(() => {
    if (chart) {
      chart.options.animation = false;
      chart.data.datasets = obtainDatasets(data);
      chart.update();
      chart.options.animation = { duration: 1000 };
    }
  }, [data, chart]);

  return (
    <div className="w-full h-full relative overflow-clip">
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default BarChart;
