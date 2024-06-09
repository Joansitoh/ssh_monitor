import React, { useEffect, useState } from "react";
import { getCountry } from "iso-3166-1-alpha-2";
import { MapContainer, CircleMarker, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const groupByCountry = (data) => {
  const grouped = {};

  data.forEach((item) => {
    const [longitude, latitude] = item.location.loc.split(",").map(parseFloat);
    const country = getCountry(item.location.country);

    if (!grouped[country]) {
      grouped[country] = { country, longitude, latitude, count: 0 };
    }
    grouped[country].count += 1;
  });

  return Object.values(grouped);
};

const MapChart = ({ data }) => {
  const [maxValue, setMaxValue] = useState(0);

  useEffect(() => {
    const groupedData = groupByCountry(data);
    const max = Math.max(...groupedData.map((d) => d.count));
    setMaxValue(max);
  }, [data]);

  const calculateRadius = (count) => {
    // Custom scaling logic based on your requirements
    if (maxValue === 0) return 0; // Handle division by zero case
    const maxRadius = 24; // Maximum radius you want to use
    return Math.sqrt(count / maxValue) * maxRadius;
  };

  const groupedData = groupByCountry(data);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        style={{ height: "100%", width: "100%" }}
        zoom={1}
        center={[-0.09, 51.505]}
        maxBounds={[
          [-120, -300],
          [120, 300],
        ]}
      >
        <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {groupedData.map((item) => (
          <CircleMarker
            key={item.country}
            center={[item.longitude, item.latitude]}
            radius={calculateRadius(item.count)}
            fillOpacity={0.5}
            stroke={false}
          >
            <Tooltip
              direction="right"
              offset={[-8, -2]}
              opacity={0.8}
            >
              <span>{item.country}</span>
              <br />
              <span>{item.count} attempts</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapChart;
