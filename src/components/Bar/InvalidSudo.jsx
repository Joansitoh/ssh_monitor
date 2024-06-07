import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const InvalidSudo = () => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef();

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current.getContext("2d");

    const generateLabels = () => {
      const labels = [];
      const now = new Date();
      for (let i = 0; i < 48; i++) {
        // 48 intervalos de 1 hora = 48 horas
        const hour = new Date(now - i * 3600000); // 3600000 ms = 1 hora
        labels.unshift(
          hour.toLocaleDateString() +
            " " +
            hour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }
      return labels;
    };

    const data = {
      labels: generateLabels(),
      datasets: [
        {
          label: "pedro.local",
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(75,192,192,0.4)",
          hoverBorderColor: "rgba(75,192,192,1)",
          data: [
            65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 50, 30, 20, 10, 5, 0, 10,
            20, 30, 40, 50, 60, 70, 20, 30, 40, 50, 60, 70, 20, 30, 40, 50, 60,
            70,
          ],
        },
        {
          label: "manolo.local",
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(255,99,132,0.4)",
          hoverBorderColor: "rgba(255,99,132,1)",
          data: [
            65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 50, 30, 20, 10, 5, 0, 10,
            20, 30, 40, 50, 60, 70, 20, 30, 40, 50, 60, 70, 20, 30, 40, 50, 60,
            70,
          ],
        },
      ],
    };

    const newChart = new Chart(chartInstance, {
      type: "bar",
      data: data,
      options: {
        plugins: {
          legend: {
            display: true,
            position: "right",
          },
        },
        scales: {
          x: {
            gridLines: {
              display: false,
            },
            ticks: {
              callback: function (value, index) {
                // Solo muestra la etiqueta cada 6 horas
                let val = data.labels[index];
                // elimina el día de la semana
                val = val.split(" ")[1];
                return index % 6 === 0 ? val : null;
              },
            },
          },
          y: {
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
  }, [chartRef]);

  return (
    <div className="w-full h-full relative overflow-clip">
      <canvas ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default InvalidSudo;
