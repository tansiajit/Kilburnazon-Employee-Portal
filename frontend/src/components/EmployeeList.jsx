import React from "react";

export default function EmployeeList({ employees, onEdit }) {
  return (
    <div className="employee-list">
      <h2>All Employees</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position ID</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.Employee_ID}>
              <td>{emp.Employee_Full_Name}</td>
              <td>{emp.Company_Position_ID}</td>
              <td>{emp.Employee_Salary}</td>
              <td>
                <button onClick={() => onEdit(emp)}>Edit / Promote</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
