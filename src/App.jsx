import React, { useEffect } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function App() {
  useEffect(() => {
    const viewer = new Cesium.Viewer("cesiumContainer", {
      infoBox: true,
      selectionIndicator: true,
    });

    // Example coordinates: latitude, longitude, height (meters)
    const latitude = 28.6139; // e.g., New Delhi
    const longitude = 77.2090;
    const height = 1000000; // 1,000 km above Earth

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0,
      },
      duration: 3, // seconds to fly
    });

    // --- Add a belt around the Earth (Equator) ---
   // Example belts (height in meters above Earth surface)
const belts = [
  { name: "Inner Radiation Belt", color: Cesium.Color.RED.withAlpha(0.4), height: 1000000 }, // 1000 km
  { name: "Outer Radiation Belt", color: Cesium.Color.ORANGE.withAlpha(0.3), height: 2000000 }, // 2000 km
  { name: "Plasmasphere", color: Cesium.Color.BLUE.withAlpha(0.2), height: 3000000 }, // 3000 km
];

// Create circular belts along equator
belts.forEach((belt) => {
  const positions = [];
  for (let lon = -180; lon <= 180; lon += 5) {
    positions.push(Cesium.Cartesian3.fromDegrees(lon, 0, belt.height));
  }

  viewer.entities.add({
    name: belt.name,
    polyline: {
      positions: positions,
      width: 5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: belt.color,
      }),
    },
  });
});


  }, []);

  return (
    <div className="h-full w-screen overflow-hidden">
      <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }}></div>
      <div className="h-22 w-[85%] bg-white rounded-2xl p-2 border-2 border-zinc-600 shadow absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <h1 className="alan font-bold text-2xl text-zinc-600">Solar Shield 🛡️</h1>
        <p className="leading-5 alan text-zinc-500">
          Solar Shield is an AI-powered platform that predicts geomagnetic storms using real NASA space-weather data and visualizes impact zones on an interactive 3D Earth map, sending timely alerts to protect critical infrastructure.
        </p>
      </div>
    </div>
  );
}
