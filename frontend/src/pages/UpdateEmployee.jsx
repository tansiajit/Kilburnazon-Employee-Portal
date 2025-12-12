import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, FileText, CheckCircle, AlertCircle } from "lucide-react";

const UpdateEmployee = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [employeeFound, setEmployeeFound] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    company_position_id: "",
    department_name: "",
    office_id: "",
    salary: "",
    hire_date: "",
    contract: "Full-Time",
    status: "Active",
    email: "",
    dob: "",
    address: "",
    nin: "",
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    relationship: "",
    phone: ""
  });
  const [hasEmergencyContact, setHasEmergencyContact] = useState(false);

  const [originalData, setOriginalData] = useState(null);

  // Fetch departments & offices
  useEffect(() => {
    fetch("http://localhost:8888/backend/api.php?table=departments")
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Departments fetch error:", err));

    fetch("http://localhost:8888/backend/api.php?table=offices")
      .then(res => res.json())
      .then(data => setOffices(data))
      .catch(err => console.error("Offices fetch error:", err));
  }, []);

  // Fetch positions based on department
  useEffect(() => {
    if (!selectedDepartment) return;

    fetch(`http://localhost:8888/backend/api.php?table=positions&department=${selectedDepartment}`)
      .then(res => res.json())
      .then(data => setPositions(data))
      .catch(err => console.error("Positions fetch error:", err));
  }, [selectedDepartment]);

  // Search employees
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:8888/backend/search_employees.php?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();

        if (data.success) {
          setSearchResults(data.employees);
          setShowResults(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Load employee data
  const loadEmployee = async (employeeId) => {
    try {
      const res = await fetch(`http://localhost:8888/backend/get_employee.php?employee_id=${employeeId}`);
      const data = await res.json();

      if (data.success) {
        const emp = data.employee;
        const employeeData = {
          employee_id: emp.Employee_ID,
          full_name: emp.Employee_Full_Name,
          company_position_id: emp.Company_Position_ID,
          department_name: emp.Department_Name,
          office_id: emp.Office_ID,
          salary: emp.Employee_Salary || "",
          hire_date: emp.Employee_Date_Of_Hire,
          contract: emp.Employee_Contract,
          status: emp.Employee_Status,
          email: emp.Email_Address,
          dob: emp.Date_Of_Birth,
          address: emp.Home_Address,
          nin: emp.Identification_Number_NiN,
        };

        setFormData(employeeData);
        setOriginalData(employeeData);
        setSelectedDepartment(emp.Department_Name);
        setEmployeeFound(true);
        setShowResults(false);
        setSearchTerm("");
        
        console.log("Loaded employee:", employeeData);

        // Load emergency contact
        const emergencyRes = await fetch(`http://localhost:8888/backend/get_emergency_contact.php?employee_id=${employeeId}`);
        const emergencyData = await emergencyRes.json();

        if (emergencyData.success && emergencyData.contact) {
          setEmergencyContact({
            name: emergencyData.contact.Emergency_Name || "",
            relationship: emergencyData.contact.Emergency_Relationship || "",
            phone: emergencyData.contact.Emergency_Phone_Number || ""
          });
          setHasEmergencyContact(true);
        } else {
          setEmergencyContact({ name: "", relationship: "", phone: "" });
          setHasEmergencyContact(false);
        }
      } else {
        alert("Error loading employee: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading employee data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.department_name !== "Executives" && formData.salary === "") {
      alert("Salary is required unless employee is in the Executive department.");
      return;
    }

    console.log("Submitting update:", formData);

    try {
      const res = await fetch("http://localhost:8888/backend/update_employee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Server response:", data);

      if (data.success) {
        // Update emergency contact
        if (emergencyContact.name || emergencyContact.relationship || emergencyContact.phone) {
          await fetch("http://localhost:8888/backend/update_emergency_contact.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employee_id: formData.employee_id,
              ...emergencyContact
            })
          });
        }

        alert("Employee updated successfully!");
        
        // Log changes
        const changes = [];
        for (let key in formData) {
          if (originalData[key] !== formData[key]) {
            changes.push(`${key}: ${originalData[key]} → ${formData[key]}`);
          }
        }
        if (changes.length > 0) {
          console.log("Changes made:", changes);
        }
        
        setOriginalData(formData);
      } else {
        alert("Failed to update employee: " + (data.error || "unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update employee. Check console for details.");
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    setEmployeeFound(false);
    setFormData({
      employee_id: "",
      full_name: "",
      company_position_id: "",
      department_name: "",
      office_id: "",
      salary: "",
      hire_date: "",
      contract: "Full-Time",
      status: "Active",
      email: "",
      dob: "",
      address: "",
      nin: "",
    });
    setEmergencyContact({ name: "", relationship: "", phone: "" });
    setOriginalData(null);
    setSelectedDepartment(null);
    setPositions([]);
    setHasEmergencyContact(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-white relative overflow-hidden">
      {/* Enhanced Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-200/50 to-green-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-green-200/40 to-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-green-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-40 w-[400px] h-[400px] bg-green-300/20 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shadow-emerald-100/50 z-10">
        <div className="max-w-full mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-md hover:shadow-emerald-200/50"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-600" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Update Employee</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-12 z-10">
        
        {/* Search Section */}
        {!employeeFound && (
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50 mb-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Search Employee</h2>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type employee name or ID..."
                className="w-full px-5 py-4 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-emerald-600 font-semibold">
                  Searching...
                </div>
              )}

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-200 rounded-2xl shadow-2xl shadow-emerald-200/50 max-h-[400px] overflow-y-auto z-50">
                  {searchResults.map((emp, index) => (
                    <div
                      key={emp.Employee_ID}
                      onClick={() => loadEmployee(emp.Employee_ID)}
                      className="p-4 cursor-pointer border-b border-emerald-50 last:border-b-0 hover:bg-emerald-50 transition-all"
                    >
                      <div className="font-bold text-gray-900">{emp.Employee_Full_Name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        ID: {emp.Employee_ID} • {emp.Company_Position_Title} • {emp.Department_Name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {showResults && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-4 text-gray-500 text-center">
                  No employees found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee Form */}
        {employeeFound && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Currently Editing Banner */}
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl p-6 shadow-lg shadow-emerald-200/50">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                <span className="text-white font-bold text-lg">Currently Editing</span>
              </div>
              <div className="text-white text-2xl font-bold">{formData.full_name}</div>
              <div className="text-white/90 text-sm mt-1">Employee ID: {formData.employee_id}</div>
            </div>

            {/* Basic Information */}
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">NIN (9 digits) *</label>
                  <input
                    type="text"
                    name="nin"
                    value={formData.nin}
                    onChange={handleChange}
                    required
                    maxLength="9"
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Home Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Employment Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                  <select
                    name="department_name"
                    value={formData.department_name}
                    onChange={e => {
                      handleChange(e);
                      setSelectedDepartment(e.target.value);
                      setFormData(prev => ({ ...prev, company_position_id: "" }));
                    }}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, i) => (
                      <option key={i} value={dept.Department_Name}>{dept.Department_Name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                  <select
                    name="company_position_id"
                    value={formData.company_position_id}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos.Company_Position_ID} value={pos.Company_Position_ID}>{pos.Company_Position_Title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Office *</label>
                  <select
                    name="office_id"
                    value={formData.office_id}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">Select Office</option>
                    {offices.map(office => (
                      <option key={office.Office_ID} value={office.Office_ID}>{office.Office_Name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Salary {formData.department_name === "Executives" ? "(Optional)" : "*"}
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    required={formData.department_name !== "Executives"}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hire Date *</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    required
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contract *</label>
                  <select
                    name="contract"
                    value={formData.contract}
                    onChange={handleChange}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Emergency Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact(prev => ({...prev, name: e.target.value}))}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    value={emergencyContact.relationship}
                    onChange={(e) => setEmergencyContact(prev => ({...prev, relationship: e.target.value}))}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g., Mother, Spouse, Parent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact(prev => ({...prev, phone: e.target.value}))}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Emergency phone number"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
                }}
                className="flex-1 px-8 py-4 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Update Employee
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Cancel / Search Another
              </button>
            </div>
          </form>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default UpdateEmployee;