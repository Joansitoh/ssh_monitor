import React, { useEffect, useState } from "react";
import { MapContainer, CircleMarker, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapChart = ({ data, total }) => {
  const [maxValue, setMaxValue] = useState(0);
  const [dataKeyList, setDataKeyList] = useState([]);

  useEffect(() => {
    if (!data) return;
    const dataKeys = (data && Object.keys(data)) || [];
    const max = Math.max(...dataKeys.map((key) => data[key].count));
    setDataKeyList(dataKeys);
    setMaxValue(max);
  }, [data]);

  const calculateRadius = (count) => {
    if (maxValue === 0) return 0;
    const maxRadius = 24;
    return Math.sqrt(count / maxValue) * maxRadius;
  };

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
        {data &&
          dataKeyList.length !== 0 &&
          dataKeyList.map((key) => {
            const item = data[key];

            const split = item.location ? item.location.split(",") : [];
            let latitude = 0;
            let longitude = 0;

            if (split.length === 2) {
              latitude = parseFloat(split[0]);
              longitude = parseFloat(split[1]);
            }

            return (
              <CircleMarker
                key={key}
                center={[latitude, longitude]}
                radius={calculateRadius(item.count)}
                fillOpacity={0.5}
                stroke={false}
                color="red"
              >
                <Tooltip direction="right" offset={[-8, -2]} opacity={0.8}>
                  <span>{key}</span>
                  <br />
                  <span>
                    {item.count} attempts (
                    {maxValue > 0 ? ((item.count / total) * 100).toFixed(2) : 0}
                    %)
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default MapChart;
