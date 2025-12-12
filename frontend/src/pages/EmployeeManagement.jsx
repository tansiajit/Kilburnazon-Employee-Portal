import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, FileText, AlertCircle } from "lucide-react";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [offices, setOffices] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [formData, setFormData] = useState({
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

  const [addEmergency, setAddEmergency] = useState(false);
  const [emergency, setEmergency] = useState({
    name: "",
    relationship: "",
    phone: "",
  });

  // ----------------------- FETCH DEPARTMENTS & OFFICES -----------------------
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

  // ----------------------- FETCH POSITIONS BASED ON DEPARTMENT -----------------------
  useEffect(() => {
    if (!selectedDepartment) return;

    fetch(`http://localhost:8888/backend/api.php?table=positions&department=${selectedDepartment}`)
      .then(res => res.json())
      .then(data => setPositions(data))
      .catch(err => console.error("Positions fetch error:", err));
  }, [selectedDepartment]);

  // ----------------------- AUTO-GENERATE EMAIL FROM FULL NAME -----------------------
  useEffect(() => {
    if (formData.full_name.trim()) {
      const nameParts = formData.full_name.trim().split(/\s+/);
      
      if (nameParts.length >= 2) {
        // Take first name and last name
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        
        // Format: FirstName.LastName@kilburnazon.com
        const generatedEmail = `${firstName}.${lastName}@kilburnazon.com`;
        
        setFormData(prev => ({ ...prev, email: generatedEmail }));
      } else {
        // Clear email if name is incomplete
        setFormData(prev => ({ ...prev, email: "" }));
      }
    } else {
      setFormData(prev => ({ ...prev, email: "" }));
    }
  }, [formData.full_name]);

  // ----------------------- HANDLE FORM CHANGE -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setEmergency(prev => ({ ...prev, [name]: value }));
  };

  // ----------------------- SUBMIT FORM -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.department_name !== "Executives" && formData.salary === "") {
      alert("Salary is required unless employee is in the Executive department.");
      return;
    }

    const payload = {
      full_name: formData.full_name,
      company_position_id: formData.company_position_id,
      department_name: formData.department_name,
      office_id: formData.office_id,
      salary: formData.salary === "" ? "" : formData.salary,
      hire_date: formData.hire_date,
      contract: formData.contract,
      status: formData.status,
      email: formData.email,
      dob: formData.dob,
      address: formData.address,
      nin: formData.nin
    };

    console.log("Sending payload:", payload);

    try {
      const res = await fetch("http://localhost:8888/backend/add_employee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("Response:", data);

      if (data.success) {
        const newEmployeeId = data.employee_id;
        
        alert(`Employee added successfully! Employee ID: ${newEmployeeId}`);

        if (addEmergency && emergency.name && emergency.relationship && emergency.phone) {
          await fetch("http://localhost:8888/backend/add_emergency.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employee_id: newEmployeeId, ...emergency })
          });
        }

        // Reset form
        setFormData({
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
        setEmergency({ name: "", relationship: "", phone: "" });
        setAddEmergency(false);
        setSelectedDepartment(null);
        setPositions([]);

      } else {
        alert("Failed to add employee: " + (data.error || "unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add employee. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-white relative overflow-hidden">
      {/* Enhanced Decorative Background with green blurs */}
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Add New Employee</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 py-12 z-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information */}
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Auto-generated from name"
                  readOnly
                />
                {formData.email && (
                  <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Email generated successfully</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                  className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  
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
                  className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Enter full home address"
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
                  disabled={!selectedDepartment}
                  className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-gray-100"
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos.Company_Position_ID} value={pos.Company_Position_Title}>{pos.Company_Position_Title}</option>
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
                    <option key={office.Office_ID} value={office.Office_Name}>{office.Office_Name}</option>
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
                  placeholder="Enter salary (e.g., 39000)"
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Emergency Contact (Optional)</h2>
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={addEmergency}
                onChange={() => setAddEmergency(!addEmergency)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-gray-700">Add emergency contact</span>
            </label>

            {addEmergency && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-emerald-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={emergency.name}
                    onChange={handleEmergencyChange}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                  <input
                    type="text"
                    name="relationship"
                    value={emergency.relationship}
                    onChange={handleEmergencyChange}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g., Mother, Spouse, Parent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={emergency.phone}
                    onChange={handleEmergencyChange}
                    className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Emergency phone number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
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
            className="w-full px-8 py-4 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Add Employee
          </button>
        </form>
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

export default EmployeeManagement;
