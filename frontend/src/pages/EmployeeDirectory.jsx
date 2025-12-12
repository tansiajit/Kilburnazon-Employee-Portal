import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    position: "",
    location: "",
    startDate: ""
  });
  
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchEmployees = useCallback(async () => {
    try {
      const query = new URLSearchParams(filters).toString();

      const res = await fetch(
        `http://localhost:8888/backend/get_employees.php?${query}`
      );

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.warn("Backend returned non-array:", data);
        setEmployees([]);
        return;
      }

      setEmployees(data);

      // Extract unique values for filters - match PHP column names
      setDepartments([...new Set(data.map(emp => emp.Department_Name))].filter(Boolean));
      setPositions([...new Set(data.map(emp => emp.Company_Position_Title))].filter(Boolean));
      setLocations([...new Set(data.map(emp => emp.Office_Region))].filter(Boolean));

    } catch (err) {
      console.error("Fetch error:", err);
      setEmployees([]);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const resetFilters = () => {
    setFilters({
      search: "",
      department: "",
      position: "",
      location: "",
      startDate: ""
    });
  };

  // Helper component for displaying info fields
  const InfoField = ({ label, value }) => (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900">{value || 'N/A'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-white relative overflow-hidden">
      {/* Enhanced Decorative Background with green blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large green blurs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-200/60 to-green-200/60 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-green-200/50 to-emerald-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/40 to-green-100/40 rounded-full blur-3xl"></div>
        
        {/* Smaller accent blurs */}
        <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-emerald-300/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-40 w-[400px] h-[400px] bg-green-300/30 rounded-full blur-2xl"></div>
      </div>

      {/* Header with green accent */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shadow-emerald-100/50 z-10">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')}
                className="w-9 h-9 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-md hover:shadow-emerald-200/50"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-600" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Employee Directory</h1>
            </div>
            <button className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto px-4 py-4 z-10 min-h-screen">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-5 mb-5 shadow-lg max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search Employees ID, Name or Email..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full h-11 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Department Filter */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="w-full h-11 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Position Filter */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
              <select
                value={filters.position}
                onChange={(e) => setFilters({...filters, position: e.target.value})}
                className="w-full h-11 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Positions</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full h-11 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full h-11 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Reset Button */}
            <div className="lg:col-span-1 flex items-end">
              <button
                onClick={resetFilters}
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.2)';
                }}
                className="w-full h-11 px-6 text-white text-sm font-semibold rounded-lg transition-all duration-300"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {employees.map((emp, index) => {
            // Parse full name to get first and last name
            const fullName = emp.Employee_Full_Name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts[nameParts.length - 1] || '';
            const initials = `${firstName[0] || ''}${lastName[0] || ''}`;

            return (
              <div
                key={emp.Employee_ID}
                onClick={() => setSelectedEmployee(emp)}
                className="group relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white"
                style={{
                  animation: 'slideUp 0.5s ease-out forwards',
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0
                }}
              >
                {/* Profile Image */}
                <div className="flex justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {initials}
                  </div>
                </div>

                {/* Employee Info */}
                <div className="text-center">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {fullName}
                  </h3>
                  <p className="text-sm text-emerald-600 font-medium mb-1">
                    {emp.Company_Position_Title || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    {emp.Department_Name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {emp.Office_Region || 'N/A'}
                  </p>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-green-400/0 group-hover:from-emerald-400/10 group-hover:to-green-400/10 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {employees.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-lg">No employees found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedEmployee && (() => {
        const fullName = selectedEmployee.Employee_Full_Name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[nameParts.length - 1] || '';
        const initials = `${firstName[0] || ''}${lastName[0] || ''}`;

        return (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedEmployee(null);
              setActiveTab('overview');
            }}
            style={{ animation: 'fadeIn 0.3s ease' }}
          >
            <div 
              className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'scaleIn 0.3s ease' }}
            >
              {/* Modal Header */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {fullName}
                  </h2>
                  <p className="text-lg text-emerald-600 font-medium mb-1">
                    {selectedEmployee.Company_Position_Title || 'N/A'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${selectedEmployee.Employee_Status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      {selectedEmployee.Employee_Status || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  style={{
                    background: activeTab === 'overview' 
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                      : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    boxShadow: activeTab === 'overview'
                      ? '0 10px 25px rgba(16, 185, 129, 0.4)'
                      : '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'overview') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'overview') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
                    }
                  }}
                  className="flex-1 px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300"
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  style={{
                    background: activeTab === 'personal' 
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                      : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    boxShadow: activeTab === 'personal'
                      ? '0 10px 25px rgba(16, 185, 129, 0.4)'
                      : '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'personal') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'personal') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
                    }
                  }}
                  className="flex-1 px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300"
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('emergency')}
                  style={{
                    background: activeTab === 'emergency' 
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                      : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    boxShadow: activeTab === 'emergency'
                      ? '0 10px 25px rgba(16, 185, 129, 0.4)'
                      : '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'emergency') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'emergency') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
                    }
                  }}
                  className="flex-1 px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300"
                >
                  Emergency Contact
                </button>
                <button
                  onClick={() => setActiveTab('work')}
                  style={{
                    background: activeTab === 'work' 
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' 
                      : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    boxShadow: activeTab === 'work'
                      ? '0 10px 25px rgba(16, 185, 129, 0.4)'
                      : '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'work') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'work') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.2)';
                    }
                  }}
                  className="flex-1 px-6 py-3 font-semibold text-white rounded-lg transition-all duration-300"
                >
                  Work Details
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-6">
                    <InfoField label="Employee ID" value={selectedEmployee.Employee_ID} />
                    <InfoField label="Email Address" value={selectedEmployee.Email_Address} />
                    <InfoField label="Department" value={selectedEmployee.Department_Name} />
                    <InfoField label="Position" value={selectedEmployee.Company_Position_Title} />
                    <InfoField label="Office Name" value={selectedEmployee.Office_Name} />
                    <InfoField label="Office Region" value={selectedEmployee.Office_Region} />
                    <InfoField label="Date of Hire" value={selectedEmployee.Employee_Date_Of_Hire} />
                    <InfoField label="Status" value={selectedEmployee.Employee_Status} />
                  </div>
                )}

                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-2 gap-6">
                    <InfoField label="Full Name" value={selectedEmployee.Employee_Full_Name} />
                    <InfoField label="Date of Birth" value={selectedEmployee.Date_Of_Birth} />
                    <InfoField label="Email Address" value={selectedEmployee.Email_Address} />
                    <InfoField label="NI Number" value={selectedEmployee.Identification_Number_NiN} />
                    <div className="col-span-2">
                      <InfoField label="Home Address" value={selectedEmployee.Home_Address} />
                    </div>
                  </div>
                )}

                {/* Emergency Contact Tab */}
                {activeTab === 'emergency' && (
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-red-900 mb-4">Emergency Contact Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Contact Name" value={selectedEmployee.Emergency_Name} />
                        <InfoField label="Relationship" value={selectedEmployee.Emergency_Relationship} />
                        <div className="col-span-2">
                          <InfoField label="Phone Number" value={selectedEmployee.Emergency_Phone_Number} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      This information should only be used in case of emergencies.
                    </p>
                  </div>
                )}

                {/* Work Details Tab */}
                {activeTab === 'work' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <InfoField label="Employee ID" value={selectedEmployee.Employee_ID} />
                      <InfoField label="Position" value={selectedEmployee.Company_Position_Title} />
                      <InfoField label="Department" value={selectedEmployee.Department_Name} />
                      <InfoField label="Office Name" value={selectedEmployee.Office_Name} />
                      <InfoField label="Office Region" value={selectedEmployee.Office_Region} />
                      <InfoField label="Date of Hire" value={selectedEmployee.Employee_Date_Of_Hire} />
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-6">
                      <h3 className="text-lg font-bold text-emerald-900 mb-4">Employment History</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedEmployee.Company_Position_Title || 'Current Position'}</p>
                            <p className="text-sm text-gray-600">{selectedEmployee.Department_Name || 'Department'} • {selectedEmployee.Office_Name || 'Office'}</p>
                            <p className="text-xs text-gray-500">
                              {selectedEmployee.Employee_Date_Of_Hire ? `Started ${new Date(selectedEmployee.Employee_Date_Of_Hire).toLocaleDateString()}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setActiveTab('overview');
                }}
                style={{
                  background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.2)';
                }}
                className="mt-8 w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
