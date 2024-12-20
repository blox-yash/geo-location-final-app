// 'use client'
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);

  const getReverseGeocode = async (latitude, longitude) => {
    const url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${latitude},${longitude}&api_key=${import.meta.env.VITE_OLA_API}`;
    try {
      const response = await fetch(url, {
        headers: {
          "X-Request-Id": "XXX",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setAddress(data.results);
    } catch (err) {
      setError(`Reverse geocoding failed: ${err.message}`);
    }
  };


  const getLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setError(null);
        await getReverseGeocode(latitude, longitude);

      } catch (err) {
        setError(`Geolocation error: ${err.message}`);
        fetchLocationByIP();
      }
    } else {
      setError("Geolocation is not supported by your browser.");
      fetchLocationByIP();
    }
  };

  const fetchLocationByIP = async () => {
    try {
      const ipResponse = await axios.get("https://api.ipify.org/?format=json");
      const userIP = ipResponse.data.ip;

      const locationResponse = await axios.get(`https://ipapi.co/${userIP}/json/`);
      const { latitude, longitude } = locationResponse.data;

      setLocation({ latitude, longitude });
      await getReverseGeocode(latitude, longitude);
      const types = ["airport", "atm", "bakery", "bank", "travel_agency", "university"];
      await getNearbyRestaurants(latitude, longitude, types);
    } catch (err) {
      setError(`IP-based location fetching failed: ${err.message}`);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="app-container">
      <h1>Find My Location</h1>

      {location && (
        <div className="location-info">
          <h2>Your Location:</h2>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}

      {address && (
        <div className="address-container">
          <h2>Reverse-Geocoded Address:</h2>
          {address.map((place, index) => (
            <div key={index} className="address-card">
              <h3>{place.name}</h3>
              <p>{place.formatted_address}</p>
            </div>
          ))}
        </div>
      )}

      

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
