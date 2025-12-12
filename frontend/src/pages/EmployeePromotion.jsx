import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TrendingUp, Award, DollarSign, Calendar, ChevronDown, ChevronUp } from "lucide-react";

const EmployeePromotion = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [employeeSelected, setEmployeeSelected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  const [promotionData, setPromotionData] = useState({
    new_position_id: "",
    salary_increase_percentage: "5",
    promotion_date: new Date().toISOString().split('T')[0],
    promotion_reason: ""
  });

  const [promotionHistory, setPromotionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [calculatedSalary, setCalculatedSalary] = useState(null);

  // Fetch departments on mount
  useEffect(() => {
    fetch("http://localhost:8888/backend/api.php?table=departments")
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Departments fetch error:", err));
  }, []);

  // Fetch positions when department changes
  useEffect(() => {
    if (!selectedDepartment) {
      setPositions([]);
      return;
    }

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

  // Calculate new salary when percentage changes
  useEffect(() => {
    if (selectedEmployee && promotionData.salary_increase_percentage) {
      const currentSalary = parseFloat(selectedEmployee.Employee_Salary || 0);
      const increase = parseFloat(promotionData.salary_increase_percentage);
      const newSalary = currentSalary * (1 + (increase / 100));
      setCalculatedSalary(newSalary.toFixed(2));
    }
  }, [selectedEmployee, promotionData.salary_increase_percentage]);

  // Load employee
  const loadEmployee = async (employeeId) => {
    try {
      const res = await fetch(`http://localhost:8888/backend/get_employee.php?employee_id=${employeeId}`);
      const data = await res.json();

      if (data.success) {
        setSelectedEmployee(data.employee);
        setEmployeeSelected(true);
        setShowResults(false);
        setSearchTerm("");
        
        // Load promotion history
        loadPromotionHistory(employeeId);
      } else {
        alert("Error loading employee: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading employee data");
    }
  };

  // Load promotion history
  const loadPromotionHistory = async (employeeId) => {
    try {
      const res = await fetch(`http://localhost:8888/backend/get_promotion_history.php?employee_id=${employeeId}`);
      const data = await res.json();

      if (data.success) {
        setPromotionHistory(data.promotions);
      }
    } catch (err) {
      console.error("Error loading promotion history:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotionData(prev => ({ ...prev, [name]: value }));
  };

  // Submit promotion
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!promotionData.new_position_id) {
      alert("Please select a new position");
      return;
    }

    const payload = {
      employee_id: selectedEmployee.Employee_ID,
      new_position_id: promotionData.new_position_id,
      salary_increase_percentage: promotionData.salary_increase_percentage,
      promotion_date: promotionData.promotion_date,
      promotion_reason: promotionData.promotion_reason
    };

    console.log("Processing promotion:", payload);

    try {
      const res = await fetch("http://localhost:8888/backend/process_promotion.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log("Promotion response:", data);

      if (data.success) {
        const message = `
Promotion Successful!

Employee: ${data.employee_name}
Old Position: ${data.old_position}
New Position: ${data.new_position}

Old Salary: £${data.old_salary.toLocaleString()}
New Salary: £${data.new_salary.toLocaleString()}
Increase: £${data.salary_increase.toLocaleString()} (+${data.increase_percentage}%)
        `;
        alert(message);
        
        // Reload employee and history
        loadEmployee(selectedEmployee.Employee_ID);
        
        // Reset form
        setPromotionData({
          new_position_id: "",
          salary_increase_percentage: "5",
          promotion_date: new Date().toISOString().split('T')[0],
          promotion_reason: ""
        });
        setSelectedDepartment("");
      } else {
        alert("Failed to process promotion: " + (data.error || "unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process promotion. Check console for details.");
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    setEmployeeSelected(false);
    setSelectedEmployee(null);
    setPromotionData({
      new_position_id: "",
      salary_increase_percentage: "5",
      promotion_date: new Date().toISOString().split('T')[0],
      promotion_reason: ""
    });
    setSelectedDepartment("");
    setPromotionHistory([]);
    setCalculatedSalary(null);
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Employee Promotion</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 py-12 z-10">
        
        {/* Search Section */}
        {!employeeSelected && (
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Search Employee to Promote</h2>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type employee name or ID..."
                className="w-full px-5 py-4 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-emerald-600 font-semibold">
                  Searching...
                </div>
              )}

              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-200 rounded-2xl shadow-2xl shadow-emerald-200/50 max-h-[400px] overflow-y-auto z-50">
                  {searchResults.map((emp) => (
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
            </div>
          </div>
        )}

        {/* Promotion Form */}
        {employeeSelected && selectedEmployee && (
          <div className="space-y-8">
            
            {/* Current Employee Banner */}
            <div className="bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl p-8 shadow-lg shadow-emerald-200/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedEmployee.Employee_Full_Name}</h2>
                  <div className="text-white/90 text-sm">Ready for promotion</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Employee ID</div>
                  <div className="text-white font-bold text-lg">{selectedEmployee.Employee_ID}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Current Position</div>
                  <div className="text-white font-bold text-lg">{selectedEmployee.Company_Position_Title}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Department</div>
                  <div className="text-white font-bold text-lg">{selectedEmployee.Department_Name}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-white/70 text-sm mb-1">Current Salary</div>
                  <div className="text-white font-bold text-lg">£{parseFloat(selectedEmployee.Employee_Salary || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Promotion Details Form */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Promotion Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Department *</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setPromotionData(prev => ({ ...prev, new_position_id: "" }));
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Position *</label>
                    <select
                      name="new_position_id"
                      value={promotionData.new_position_id}
                      onChange={handleChange}
                      disabled={!selectedDepartment}
                      required
                      className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all disabled:bg-gray-100"
                    >
                      <option value="">Select New Position</option>
                      {positions.map(pos => (
                        <option key={pos.Company_Position_ID} value={pos.Company_Position_ID}>
                          {pos.Company_Position_Title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Increase % *</label>
                    <input
                      type="number"
                      name="salary_increase_percentage"
                      value={promotionData.salary_increase_percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Date *</label>
                    <input
                      type="date"
                      name="promotion_date"
                      value={promotionData.promotion_date}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {calculatedSalary && (
                    <div className="md:col-span-2">
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <DollarSign className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
                          <span className="font-bold text-gray-900 text-lg">New Salary Calculation</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-emerald-600">
                            £{parseFloat(calculatedSalary).toLocaleString()}
                          </span>
                          <span className="text-lg text-emerald-600 font-semibold">
                            (+£{(parseFloat(calculatedSalary) - parseFloat(selectedEmployee.Employee_Salary || 0)).toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Reason (Optional)</label>
                    <textarea
                      name="promotion_reason"
                      value={promotionData.promotion_reason}
                      onChange={handleChange}
                      rows="4"
                      placeholder="e.g., Excellent performance, increased responsibilities..."
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
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
                    Process Promotion
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    Cancel / Select Another
                  </button>
                </div>
              </div>
            </form>

            {/* Promotion History */}
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Promotion History ({promotionHistory.length})
                  </h2>
                </div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-lg transition-all"
                >
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showHistory ? "Hide" : "Show"}
                </button>
              </div>

              {showHistory && promotionHistory.length > 0 && (
                <div className="overflow-hidden border border-emerald-100 rounded-2xl">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">From Position</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">To Position</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Salary Change</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {promotionHistory.map((promo) => (
                        <tr key={promo.Promotion_ID} className="border-t border-emerald-50 hover:bg-emerald-50/50 transition-all">
                          <td className="px-6 py-4 text-gray-900">{promo.Promotion_Date}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{promo.Old_Position}</div>
                            <div className="text-sm text-gray-600">£{parseFloat(promo.Old_Salary).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{promo.New_Position}</div>
                            <div className="text-sm text-gray-600">£{parseFloat(promo.New_Salary).toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-emerald-600">
                              +£{parseFloat(promo.Salary_Increase_Amount).toLocaleString()}
                            </div>
                            <div className="text-sm text-emerald-600">
                              ({promo.Salary_Increase_Percentage}%)
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showHistory && promotionHistory.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl">
                  No promotion history for this employee
                </div>
              )}
            </div>
          </div>
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

export default EmployeePromotion;
