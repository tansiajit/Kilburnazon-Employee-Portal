import React from "react";

export default function EmployeeModal({ employee, onClose }) {
  if (!employee) return null; // Don't render if no employee selected

  return (
    <div className="employee-modal">
      <div className="employee-modal-content">
        <button onClick={onClose}>Close</button>
        <h2>{employee.Employee_Full_Name}</h2>
        <p>{employee.Company_Position_Title} - {employee.Department_Name}</p>
        <p>Email: {employee.Email_Address}</p>
        <p>Office: {employee.Office_Name} ({employee.Office_Region})</p>
        {employee.Emergency_Name && (
          <>
            <h4>Emergency Contact</h4>
            <p>{employee.Emergency_Name} ({employee.Emergency_Relationship})</p>
            <p>{employee.Emergency_Phone_Number}</p>
          </>
        )}
      </div>
    </div>
  );
}
