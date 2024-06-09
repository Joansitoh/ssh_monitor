import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ColorScheme from "../Colors/ColorScheme";

const varyColor = (color, variation) => {
  return {
    r: Math.max(Math.min(color.r + variation, 255), 0),
    g: Math.max(Math.min(color.g + variation, 255), 0),
    b: Math.max(Math.min(color.b + variation, 255), 0),
  };
};

const BarChart = ({ scheme = ColorScheme.RedScheme, data }) => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current.getContext("2d");

    const obtainDatasets = (data) => {
      // Agrupar y sumar datos por hora
      const groupedData = data.reduce((acc, { user, timestamp }) => {
        const hour = new Date(timestamp);
        //hour.setMinutes(0, 0, 0); // Redondear al inicio de la hora
        hour.setSeconds(0, 0); // Redondear al inicio de la hora

        const timeKey = hour.getTime();
        if (!acc[timeKey]) acc[timeKey] = {};
        if (!acc[timeKey][user]) acc[timeKey][user] = 0;
        acc[timeKey][user] += 1;
        return acc;
      }, {});

      const datasets = Object.keys(groupedData)
        .map((timeKey) => {
          const timeData = groupedData[timeKey];
          return Object.keys(timeData).map((user) => ({
            x: parseInt(timeKey, 10),
            y: timeData[user],
            user: user,
          }));
        })
        .flat();

      const userGroups = datasets.reduce((acc, { x, y, user }) => {
        if (!acc[user]) {
          acc[user] = [];
        }
        acc[user].push({ x, y });
        return acc;
      }, {});

      let colorIndex = 0;
      return Object.entries(userGroups).map(([user, data]) => {
        // Si el índice de color excede la longitud del esquema de colores, reinícialo a 0
        if (colorIndex >= scheme.length) {
          colorIndex = 0;
        }

        const color = scheme[colorIndex];
        console.log(scheme);
        colorIndex++;

        const mainColorPrefix = `rgba(${color.r},${color.g},${color.b}`;

        return {
          label: user,
          backgroundColor: mainColorPrefix + ",0.2)",
          borderColor: mainColorPrefix + ",1)",
          borderWidth: 1,
          hoverBackgroundColor: mainColorPrefix + ",0.4)",
          hoverBorderColor: mainColorPrefix + ",1)",
          data,
        };
      });
    };

    const newChart = new Chart(chartInstance, {
      type: "bar",
      data: {
        datasets: obtainDatasets(data),
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: "right",
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            type: "time",
            time: {
              //unit: "hour", // Agrupar por horas
              tooltipFormat: "YYYY-MM-DD HH:mm",
              displayFormats: {
                hour: "HH:mm",
              },
            },
            grid: {
              display: false,
            },
            min: new Date().setHours(new Date().getHours() - 2),
            ticks: {
              maxRotation: 0,
              autoSkip: true,
            },
          },
          y: {
            stacked: true,
            ticks: {
              beginAtZero: true,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [chartRef, data]);

  return (
    <div className="w-full h-full relative overflow-clip">
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default BarChart;
