// frontend/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeDirectory from "./pages/EmployeeDirectory";
import EmployeeManagement from "./pages/EmployeeManagement";
import UpdateEmployee from "./pages/UpdateEmployee";
import EmployeePromotion from './pages/EmployeePromotion'
import Birthday from './pages/Birthday';
import Termination from './pages/Termination';
import WelcomePage from './pages/WelcomePage';
import './App.css';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/directory" element={<EmployeeDirectory />} />
          <Route path="/add" element={<EmployeeManagement />} />
          <Route path="/update" element={<UpdateEmployee />} />
          <Route path="/promote" element={<EmployeePromotion />} />
          <Route path="/birthday" element={<Birthday />} />
          <Route path="/termination" element={<Termination />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App;
