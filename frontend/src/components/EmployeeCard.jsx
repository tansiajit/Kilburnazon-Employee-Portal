import React from "react";

export default function EmployeeCard({ employee, onClick }) {
  return (
    <div className="employee-card" onClick={() => onClick(employee)}>
      <h3>{employee.Employee_Full_Name}</h3>
      <p>{employee.Company_Position_Title}</p>
      <p>{employee.Department_Name}</p>
    </div>
  );
}
