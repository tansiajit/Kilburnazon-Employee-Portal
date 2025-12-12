import React, { useState, useEffect } from "react";

export default function EmployeeForm({ employee, onSuccess }) {
  const [formData, setFormData] = useState({
    Employee_Full_Name: "",
    Company_Position_ID: "",
    Employee_Salary: "",
    Office_ID: "",
    Employee_Date_Of_Hire: "",
    Employee_Contract: "Full-Time",
    Employee_Status: "Active",
    Email_Address: "",
    Date_Of_Birth: "",
    Home_Address: "",
    Identification_Number_NiN: ""
  });

  useEffect(() => {
    if (employee) setFormData(employee);
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = employee ? "update_employee.php" : "add_employee.php";

    const res = await fetch(`http://localhost:8888/Kilburnazon_Employee_Portal/backend/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      alert(data.message);
      onSuccess();
      setFormData({
        Employee_Full_Name: "",
        Company_Position_ID: "",
        Employee_Salary: "",
        Office_ID: "",
        Employee_Date_Of_Hire: "",
        Employee_Contract: "Full-Time",
        Employee_Status: "Active",
        Email_Address: "",
        Date_Of_Birth: "",
        Home_Address: "",
        Identification_Number_NiN: ""
      });
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{employee ? "Update Employee" : "Add New Employee"}</h2>
      <input placeholder="Full Name" value={formData.Employee_Full_Name} onChange={e => setFormData({ ...formData, Employee_Full_Name: e.target.value })} required/>
      <input placeholder="Position ID" value={formData.Company_Position_ID} onChange={e => setFormData({ ...formData, Company_Position_ID: e.target.value })} required/>
      <input placeholder="Salary" type="number" value={formData.Employee_Salary} onChange={e => setFormData({ ...formData, Employee_Salary: e.target.value })} required/>
      <input placeholder="Office ID" value={formData.Office_ID} onChange={e => setFormData({ ...formData, Office_ID: e.target.value })} required/>
      <input placeholder="Date of Hire" type="date" value={formData.Employee_Date_Of_Hire} onChange={e => setFormData({ ...formData, Employee_Date_Of_Hire: e.target.value })} required/>
      <select value={formData.Employee_Contract} onChange={e => setFormData({ ...formData, Employee_Contract: e.target.value })}>
        <option>Full-Time</option>
        <option>Part-Time</option>
        <option>Freelance</option>
        <option>Internship</option>
      </select>
      <select value={formData.Employee_Status} onChange={e => setFormData({ ...formData, Employee_Status: e.target.value })}>
        <option>Active</option>
        <option>On Leave</option>
      </select>
      <input placeholder="Email" type="email" value={formData.Email_Address} onChange={e => setFormData({ ...formData, Email_Address: e.target.value })} required/>
      <input placeholder="Date of Birth" type="date" value={formData.Date_Of_Birth} onChange={e => setFormData({ ...formData, Date_Of_Birth: e.target.value })} required/>
      <input placeholder="Home Address" value={formData.Home_Address} onChange={e => setFormData({ ...formData, Home_Address: e.target.value })} required/>
      <input placeholder="NIN" value={formData.Identification_Number_NiN} onChange={e => setFormData({ ...formData, Identification_Number_NiN: e.target.value })} required/>
      <button type="submit">{employee ? "Update" : "Add Employee"}</button>
    </form>
  );
}
