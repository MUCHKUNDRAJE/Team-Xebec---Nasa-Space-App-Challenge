import React, { useEffect, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function App() {
  const [showMagneticField, setShowMagneticField] = useState(true);
  const [solarActivity, setSolarActivity] = useState({
    kpIndex: 5.2,
    solarWindSpeed: 458,
    protonFlux: 12.4,
    magneticStorm: "Moderate",
    lastUpdate: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    const viewer = new Cesium.Viewer("cesiumContainer", {
      infoBox: true,
      selectionIndicator: true,
      shouldAnimate: true,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      timeline: false,
      animation: false,
    });

    viewer.scene.globe.enableLighting = false;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.scene.sun.show = false;

    const latitude = 28.6139;
    const longitude = 77.209;
    const height = 15000000;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-30.0),
        roll: 0.0,
      },
      duration: 3,
    });

    // Sun model
    const sunRadius = 10000000;
    const sunPosition = new Cesium.Cartesian3(75000000.0, -135000000.0, 0);

    viewer.entities.add({
      name: "Sun",
      position: sunPosition,
      ellipsoid: {
        radii: new Cesium.Cartesian3(sunRadius, sunRadius, sunRadius),
        material: Cesium.Color.YELLOW,
        shadows: Cesium.ShadowMode.DISABLED,
      },
    });

    const solarFlareParticleSystem = new Cesium.ParticleSystem({
      image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACLSURBVDhPY/j//z8DJYGMwIADDEBCzD8z//z/P2wgBgYYGr8B8YdMUGBgYGD4//8/AxMDBQYm/v//z8DkPzAwMMj8hxlIA5C5j0AmA5A5DxB5C5A5D1D5EAT5Dsj8xw8w/P//P8PC//8/Awv+/P8PLPj/P8OQ+Q8w/P//P8OY+Q8w/P//P8MRAAAA6W56EgmuSqkAAAAASUVORK5CYII=",
      startColor: Cesium.Color.YELLOW.withAlpha(0.9),
      endColor: Cesium.Color.RED.withAlpha(0.2),
      startScale: 100000,
      endScale: 250000,
      minimumParticleLife: 1.5,
      maximumParticleLife: 2.8,
      minimumSpeed: 900000,
      maximumSpeed: 1500000,
      particleSize: 2,
      emissionRate: 50,
      emitter: new Cesium.SphereEmitter(sunRadius * 1.1),
      bursts: [
        new Cesium.ParticleBurst({ time: 5.0, minimum: 200, maximum: 400 }),
        new Cesium.ParticleBurst({ time: 10.0, minimum: 200, maximum: 400 }),
        new Cesium.ParticleBurst({ time: 15.0, minimum: 200, maximum: 400 }),
      ],
      lifetime: 16.0,
      modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(sunPosition),
    });
    viewer.scene.primitives.add(solarFlareParticleSystem);

    // Magnetic field lines storage
    const magneticFieldEntities = [];
    const vanAllenBeltEntities = [];

    const createMagneticFieldLine = (longitude, distanceFromCenter) => {
      const positions = [];
      for (let lat = 90; lat >= -90; lat -= 1) {
        const latRad = Cesium.Math.toRadians(lat);
        const latNormalized = Math.abs(lat) / 90;
        const heightFactor = Math.cos(latRad);
        const height =
          distanceFromCenter *
          Math.pow(Math.abs(heightFactor), 1.2) *
          (1 - Math.pow(latNormalized, 4));
        positions.push(Cesium.Cartesian3.fromDegrees(longitude, lat, height));
      }
      return positions;
    };

    const fieldLines = [
      { distance: 2000000, color: Cesium.Color.CYAN.withAlpha(0.7), width: 3.5 },
      { distance: 3000000, color: Cesium.Color.DEEPSKYBLUE.withAlpha(0.6), width: 3 },
      { distance: 4000000, color: Cesium.Color.DODGERBLUE.withAlpha(0.5), width: 3 },
      { distance: 5000000, color: Cesium.Color.BLUE.withAlpha(0.5), width: 2.5 },
      { distance: 6000000, color: Cesium.Color.ROYALBLUE.withAlpha(0.4), width: 2.5 },
      { distance: 7000000, color: Cesium.Color.MEDIUMBLUE.withAlpha(0.4), width: 2 },
      { distance: 8000000, color: Cesium.Color.SLATEBLUE.withAlpha(0.3), width: 2 },
    ];

    const longitudeStep = 20;
    for (let lon = 0; lon < 360; lon += longitudeStep) {
      fieldLines.forEach((line) => {
        const positions = createMagneticFieldLine(lon, line.distance);
        const entity = viewer.entities.add({
          name: `Magnetic Field Line ${lon}°`,
          polyline: {
            positions: positions,
            width: line.width,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.2,
              taperPower: 0.5,
              color: line.color,
            }),
            clampToGround: false,
            depthFailMaterial: line.color,
          },
        });
        magneticFieldEntities.push(entity);
      });
    }

    const belts = [
      {
        name: "Outer Van Allen Belt",
        color: Cesium.Color.ORANGE.withAlpha(0.3),
        height: 20000000,
      },
    ];

    belts.forEach((belt) => {
      if (belt.name === "Outer Van Allen Belt") {
        for (let lon = 0; lon < 360; lon += 15) {
          const positions = [];
          for (let lat = 90; lat >= -90; lat -= 2) {
            const height = belt.height * Math.cos(Cesium.Math.toRadians(lat));
            positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
          }
          const entity = viewer.entities.add({
            name: belt.name,
            polyline: {
              positions: positions,
              width: 2.5,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.3,
                color: belt.color,
              }),
            },
          });
          vanAllenBeltEntities.push(entity);
        }
      }
    });

    viewer.entities.add({
      name: "North Pole",
      position: Cesium.Cartesian3.fromDegrees(0, 90, 0),
      point: {
        pixelSize: 10,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.CYAN,
        outlineWidth: 2,
      },
    });

    viewer.entities.add({
      name: "South Pole",
      position: Cesium.Cartesian3.fromDegrees(0, -90, 0),
      point: {
        pixelSize: 10,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.CYAN,
        outlineWidth: 2,
      },
    });

    // Update solar activity data periodically
    const interval = setInterval(() => {
      setSolarActivity({
        kpIndex: (Math.random() * 3 + 4).toFixed(1),
        solarWindSpeed: Math.floor(Math.random() * 200 + 350),
        protonFlux: (Math.random() * 20 + 5).toFixed(1),
        magneticStorm: Math.random() > 0.5 ? "Moderate" : "Minor",
        lastUpdate: new Date().toLocaleTimeString(),
      });
    }, 5000);

    // Toggle magnetic field visibility
    const toggleField = (show) => {
      magneticFieldEntities.forEach((entity) => {
        entity.show = show;
      });
      vanAllenBeltEntities.forEach((entity) => {
        entity.show = show;
      });
    };

    // Store toggle function
    window.toggleMagneticField = toggleField;

    return () => {
      clearInterval(interval);
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  // Handle toggle
  useEffect(() => {
    if (window.toggleMagneticField) {
      window.toggleMagneticField(showMagneticField);
    }
  }, [showMagneticField]);

  return (
    <div className="h-full w-screen overflow-hidden relative">
      <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }}></div>

      {/* Dashboard */}
      <div className="absolute top-6 left-6 bg-zinc-900 bg-opacity-90 text-white rounded-xl p-4 shadow-2xl border border-zinc-700 w-80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-cyan-400">Space Weather</h2>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 text-sm">Kp Index</span>
            <span className="text-lg font-bold text-yellow-400">{solarActivity.kpIndex}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 text-sm">Solar Wind</span>
            <span className="text-lg font-bold text-blue-400">{solarActivity.solarWindSpeed} km/s</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 text-sm">Proton Flux</span>
            <span className="text-lg font-bold text-purple-400">{solarActivity.protonFlux} pfu</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-zinc-400 text-sm">Storm Level</span>
            <span className="text-sm font-semibold text-orange-400 bg-orange-900 bg-opacity-30 px-2 py-1 rounded">
              {solarActivity.magneticStorm}
            </span>
          </div>

          <div className="text-xs text-zinc-500 text-center pt-2 border-t border-zinc-700">
            Last Update: {solarActivity.lastUpdate}
          </div>
        </div>

        {/* Toggle Button */}
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <button
            onClick={() => setShowMagneticField(!showMagneticField)}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
              showMagneticField
                ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                : "bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
            }`}
          >
            {showMagneticField ? "Hide" : "Show"} Magnetic Field
          </button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="h-22 w-[85%] bg-white rounded-2xl p-2 border-2 border-zinc-600 shadow absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <h1 className="alan font-bold text-2xl text-zinc-600">Solar Shield 🛡️</h1>
        <p className="leading-5 alan text-zinc-500">
          Solar Shield is an AI-powered platform that predicts geomagnetic storms using real NASA space-weather data and visualizes impact zones on an interactive 3D Earth map, sending timely alerts to protect critical infrastructure.
        </p>
      </div>
    </div>
  );
}