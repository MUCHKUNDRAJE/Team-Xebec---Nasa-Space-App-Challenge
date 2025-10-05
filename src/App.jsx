import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Control from "./pages/home";


export default function App() {
  return (
    <Router>
     

      <Routes>
        <Route path="/" element={<Control />} />
       
      </Routes>
    </Router>
  );
}
