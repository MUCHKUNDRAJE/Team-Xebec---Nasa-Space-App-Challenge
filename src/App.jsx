import React, { useEffect } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

export default function App() {
  useEffect(() => {
    const viewer = new Cesium.Viewer("cesiumContainer");

  


    viewer.zoomTo(viewer.entities);

  }, []);

  return (
    <>
   <div className="h-full w-screen overflow-hidden">
    <div id="cesiumContainer" style={{ width: "100%", height: "100vh" }}></div>
    <div className="h-22 w-[85%] bg-white rounded-2xl p-2  border-2 border-zinc-600  shadow  absolute bottom-8 left-43  ">
          <h1 className="alan font-bold text-2xl text-zinc-600">Solar Shied 🛡️ </h1>
          <p className="leading-5 alan text-zinc-500 ">Solar Shield is an AI-powered platform that predicts geomagnetic storms using real NASA space-weather data and visualizes impact zones on an interactive 3D Earth map, sending timely alerts to protect critical infrastructure.</p>

    </div>
   </div>
   
    
    </>
  );
}
