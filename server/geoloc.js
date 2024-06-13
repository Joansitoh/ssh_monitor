import fetch from "node-fetch";

const fetchIPLocation = async (ip) => {
  try {
    const url = `http://ip-api.com/json/${ip}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (data.status !== "success")
      throw new Error(`API error! Message: ${data.message}`);

    const location = {
      country: data.country,
      city: data.city,
      loc: [data.lat, data.lon].join(","),
    };

    return location;
  } catch (error) {
    console.error(`Failed to get location for IP ${ip}:`, error);
    return { country: "Unknown", loc: "0,0" };
  }
};

export { fetchIPLocation };
