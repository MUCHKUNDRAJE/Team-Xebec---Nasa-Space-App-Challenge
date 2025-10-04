import React, { useEffect } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function App() {
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
    
    // ================== NEW FIX ==================
    // This disables the glowing atmosphere effect around the Earth,
    // which often causes flickering against the star background.
    viewer.scene.skyAtmosphere.show = false;
    // =============================================

    // Fix z-fighting for polylines on the globe surface
    viewer.scene.globe.depthTestAgainstTerrain = false;

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

    // Create 3D magnetic field lines from North to South pole
    const createMagneticFieldLine = (longitude, distanceFromCenter) => {
      const positions = [];
      const earthRadius = 6371000; // Earth's radius in meters

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

    // Define magnetic field lines
    const fieldLines = [
        { distance: 2000000, color: Cesium.Color.CYAN.withAlpha(0.7), width: 3.5 },
        { distance: 3000000, color: Cesium.Color.DEEPSKYBLUE.withAlpha(0.6), width: 3 },
        { distance: 4000000, color: Cesium.Color.DODGERBLUE.withAlpha(0.5), width: 3 },
        { distance: 5000000, color: Cesium.Color.BLUE.withAlpha(0.5), width: 2.5 },
        { distance: 6000000, color: Cesium.Color.ROYALBLUE.withAlpha(0.4), width: 2.5 },
        { distance: 7000000, color: Cesium.Color.MEDIUMBLUE.withAlpha(0.4), width: 2 },
        { distance: 8000000, color: Cesium.Color.SLATEBLUE.withAlpha(0.3), width: 2 },
    ];

    // Create multiple field lines around the globe
    const longitudeStep = 20;
    for (let lon = 0; lon < 360; lon += longitudeStep) {
      fieldLines.forEach((line) => {
        const positions = createMagneticFieldLine(lon, line.distance);
        viewer.entities.add({
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
      });
    }

    // Add Van Allen radiation belts
    const belts = [
      {
        name: "Inner Van Allen Belt",
        color: Cesium.Color.RED.withAlpha(0.35),
        height: 8000000,
        latitudeRange: 25,
      },
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
          viewer.entities.add({
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
        }
      } 
      else {
        for (let lat = -belt.latitudeRange; lat <= belt.latitudeRange; lat += 5) {
          const positions = [];
          for (let lon = 0; lon <= 360; lon += 5) {
            const latFactor = 1 - Math.pow(Math.abs(lat) / belt.latitudeRange, 2);
            const height = belt.height * (0.7 + 0.3 * latFactor);
            positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
          }
          viewer.entities.add({
            name: belt.name,
            polyline: {
              positions: positions,
              width: 3,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.3,
                color: belt.color,
              }),
            },
          });
        }
      }
    });

    // Add pole markers for reference
    viewer.entities.add({
      name: "North Pole",
      position: Cesium.Cartesian3.fromDegrees(0, 90, 0),
      point: { pixelSize: 10, color: Cesium.Color.WHITE, outlineColor: Cesium.Color.CYAN, outlineWidth: 2, },
    });

    viewer.entities.add({
      name: "South Pole",
      position: Cesium.Cartesian3.fromDegrees(0, -90, 0),
      point: { pixelSize: 10, color: Cesium.Color.WHITE, outlineColor: Cesium.Color.CYAN, outlineWidth: 2, },
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