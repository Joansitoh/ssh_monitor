import React, { useEffect, useState, useMemo } from "react";
import world from "../../assets/countries-110m.json";
import { getCountry } from "iso-3166-1-alpha-2";
import { scaleSqrt } from "d3-scale";
import "react-tooltip/dist/react-tooltip.css";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

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

  const popScale = useMemo(
    () =>
      scaleSqrt()
        .domain([0, isNaN(maxValue) ? 0 : maxValue])
        .range([0, 24]),
    [maxValue]
  );

  const groupedData = groupByCountry(data);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={world}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#DDD"
                />
              ))
            }
          </Geographies>
          {groupedData.map(({ country, longitude, latitude, count }) => {
            const radius = popScale(count);
            const safeRadius = isNaN(radius) ? 0 : radius;
            return (
                <Marker
                  key={country}
                  coordinates={[longitude, latitude]}
                >
                  <circle fill="#F53" stroke="#FFF" r={safeRadius} />
                </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default MapChart;
