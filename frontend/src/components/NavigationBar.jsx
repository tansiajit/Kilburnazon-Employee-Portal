// frontend/src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "12px", display: "flex", gap: "12px" }}>
      <Link to="/">Employee Directory</Link>
      <Link to="/management">Employee Management</Link>
    </nav>
  );
}
