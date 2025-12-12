import React, { useState } from "react";

export default function PromotionForm({ employee, onSuccess }) {
  const [newPosition, setNewPosition] = useState(employee.Company_Position_ID);
  const [raisePercent, setRaisePercent] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8888/Kilburnazon_Employee_Portal/backend/promote_employee.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Employee_ID: employee.Employee_ID,
        New_Position_ID: newPosition,
        Raise_Percent: raisePercent
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Promotion applied. New salary: ${data.new_salary}`);
      onSuccess();
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Promote Employee: {employee.Employee_Full_Name}</h2>
      <input type="number" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="New Position ID" required/>
      <input type="number" value={raisePercent} onChange={e => setRaisePercent(e.target.value)} placeholder="Raise %" required/>
      <button type="submit">Apply Promotion</button>
    </form>
  );
}
