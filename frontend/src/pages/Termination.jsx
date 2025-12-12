import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, UserX, History, AlertTriangle, Calendar, Trash2 } from "lucide-react";

const Termination = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('terminate');
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [terminationReason, setTerminationReason] = useState("");
  const [terminatedBy, setTerminatedBy] = useState("HR Manager");
  
  const [terminations, setTerminations] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

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

  const loadTerminations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8888/backend/get_terminations.php?filter=${filter}`);
      const data = await res.json();

      if (data.success) {
        setTerminations(data.terminations);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error loading terminations:", err);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (view === 'history') {
      loadTerminations();
    }
  }, [view, loadTerminations]);

  const loadEmployee = async (employeeId) => {
    try {
      const res = await fetch(`http://localhost:8888/backend/get_employee.php?employee_id=${employeeId}`);
      const data = await res.json();

      if (data.success) {
        setSelectedEmployee(data.employee);
        setShowResults(false);
        setSearchTerm("");
      } else {
        alert("Error loading employee: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error loading employee data");
    }
  };

  const handleTerminate = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee");
      return;
    }

    if (!terminationReason.trim()) {
      alert("Please provide a termination reason");
      return;
    }

    const confirmMsg = `Are you sure you want to terminate the contract of:\n\n${selectedEmployee.Employee_Full_Name}\n${selectedEmployee.Company_Position_Title}\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      const res = await fetch("http://localhost:8888/backend/terminate_employee.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: selectedEmployee.Employee_ID,
          termination_reason: terminationReason,
          terminated_by: terminatedBy
        })
      });

      const data = await res.json();
      console.log("Termination response:", data);

      if (data.success) {
        alert(`Contract Terminated Successfully\n\nEmployee: ${data.employee_name}\nTermination ID: ${data.termination_id}\n\n${data.gdpr_notice}`);
        
        setSelectedEmployee(null);
        setTerminationReason("");
        setSearchTerm("");
      } else {
        alert("Failed to terminate contract: " + (data.error || "unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process termination. Check console for details.");
    }
  };

  const runGDPRCleanup = async () => {
    if (!window.confirm("Run GDPR cleanup?\n\nThis will permanently delete all termination records older than 3 years.\n\nThis action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch("http://localhost:8888/backend/gdpr_cleanup.php", {
        method: "POST"
      });
      const data = await res.json();

      if (data.success) {
        alert(`GDPR Cleanup Complete\n\nRecords Deleted: ${data.cleanup_result.Records_Deleted}\nRemaining Records: ${data.remaining_records.remaining_records}`);
        loadTerminations();
      } else {
        alert("Cleanup failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to run cleanup");
    }
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
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Contract Terminations
              </h1>
              <p className="text-sm text-gray-600 mt-1">GDPR Compliant: Records retained for 3 years</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-12 z-10">
        
        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setView('terminate')}
            style={{
              background: view === 'terminate' 
                ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' 
                : 'white',
              boxShadow: view === 'terminate'
                ? '0 10px 25px rgba(16, 185, 129, 0.3)'
                : '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
            className={`flex-1 px-8 py-4 ${view === 'terminate' ? 'text-white' : 'text-gray-700'} font-bold rounded-xl transition-all duration-300 border ${view === 'terminate' ? 'border-emerald-300' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserX className="w-5 h-5" strokeWidth={2.5} />
              <span>Terminate Contract</span>
            </div>
          </button>
          
          <button
            onClick={() => setView('history')}
            style={{
              background: view === 'history' 
                ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' 
                : 'white',
              boxShadow: view === 'history'
                ? '0 10px 25px rgba(16, 185, 129, 0.3)'
                : '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
            className={`flex-1 px-8 py-4 ${view === 'history' ? 'text-white' : 'text-gray-700'} font-bold rounded-xl transition-all duration-300 border ${view === 'history' ? 'border-emerald-300' : 'border-gray-200'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <History className="w-5 h-5" strokeWidth={2.5} />
              <span>Termination History</span>
            </div>
          </button>
        </div>

        {/* Terminate View */}
        {view === 'terminate' && (
          <div className="space-y-8">
            
            {/* Warning Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" strokeWidth={2.5} />
                <div>
                  <p className="font-bold text-amber-900 mb-1">Warning</p>
                  <p className="text-sm text-amber-800">
                    Terminating an employee contract will permanently delete their active record. All data will be logged for audit purposes and retained for 3 years per GDPR requirements.
                  </p>
                </div>
              </div>
            </div>

            {!selectedEmployee ? (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Search Employee to Terminate</h2>
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
            ) : (
              <div className="space-y-6">
                
                {/* Selected Employee Banner */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-3xl p-8 shadow-lg">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <UserX className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-red-900 mb-1">Employee to Terminate</h2>
                      <p className="text-sm text-red-700">Review details before proceeding</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-red-800/70 text-sm mb-1">Name</div>
                      <div className="text-red-900 font-bold">{selectedEmployee.Employee_Full_Name}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-red-800/70 text-sm mb-1">Employee ID</div>
                      <div className="text-red-900 font-bold">{selectedEmployee.Employee_ID}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-red-800/70 text-sm mb-1">Position</div>
                      <div className="text-red-900 font-bold">{selectedEmployee.Company_Position_Title}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-red-800/70 text-sm mb-1">Department</div>
                      <div className="text-red-900 font-bold">{selectedEmployee.Department_Name}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-red-800/70 text-sm mb-1">Office</div>
                      <div className="text-red-900 font-bold">{selectedEmployee.Office_Name}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4">
                      <div className="text-red-800/70 text-sm mb-1">Email</div>
                      <div className="text-red-900 font-bold">{selectedEmployee.Email_Address}</div>
                    </div>
                  </div>
                </div>

                {/* Termination Form */}
                <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Termination Details</h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Terminated By *</label>
                      <input
                        type="text"
                        value={terminatedBy}
                        onChange={(e) => setTerminatedBy(e.target.value)}
                        placeholder="Your name or HR ID"
                        required
                        className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Termination *</label>
                      <textarea
                        value={terminationReason}
                        onChange={(e) => setTerminationReason(e.target.value)}
                        placeholder="e.g., Resignation, Performance issues, Redundancy, End of contract..."
                        rows="4"
                        required
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                      />
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-700">Termination Date:</span>
                          <span className="text-gray-900">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-700">Termination Time:</span>
                          <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-700">GDPR Retention:</span>
                          <span className="text-gray-900">Record will be kept for 3 years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleTerminate}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      Terminate Contract
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedEmployee(null);
                        setTerminationReason("");
                        setSearchTerm("");
                      }}
                      className="flex-1 px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl p-8 shadow-lg shadow-emerald-200/50">
                <div className="text-white/80 text-sm mb-2">Total Terminations</div>
                <div className="text-5xl font-bold text-white">{stats.total_terminations || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 shadow-lg shadow-orange-200/50">
                <div className="text-white/80 text-sm mb-2">Last 30 Days</div>
                <div className="text-5xl font-bold text-white">{stats.recent_30_days || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-red-400 to-pink-500 rounded-3xl p-8 shadow-lg shadow-red-200/50">
                <div className="text-white/80 text-sm mb-2">Expiring Soon</div>
                <div className="text-5xl font-bold text-white">{stats.expiring_soon || 0}</div>
              </div>
            </div>

            {/* Filter and Actions */}
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 shadow-lg shadow-emerald-100/50">
              <div className="flex gap-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1 h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="all">All Terminations</option>
                  <option value="recent">Last 30 Days</option>
                  <option value="expiring_soon">Expiring Soon (GDPR)</option>
                </select>
                
                <button
                  onClick={runGDPRCleanup}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
                >
                  <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                  Run GDPR Cleanup
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-20 text-center shadow-lg">
                <p className="text-gray-600 text-lg">Loading...</p>
              </div>
            ) : terminations.length > 0 ? (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl overflow-hidden shadow-lg shadow-emerald-100/50">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Employee</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Position</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Reason</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">GDPR Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {terminations.map((term) => (
                      <tr key={term.Termination_ID} className="border-t border-emerald-50 hover:bg-emerald-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{term.Employee_Full_Name}</div>
                          <div className="text-sm text-gray-600">ID: {term.Original_Employee_ID}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{term.Company_Position_Title}</div>
                          <div className="text-sm text-gray-600">{term.Department_Name}</div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="truncate text-gray-700">{term.Termination_Reason}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{term.Termination_Date}</div>
                          <div className="text-sm text-gray-600">{term.Days_Since_Termination} days ago</div>
                        </td>
                        <td className="px-6 py-4">
                          {term.Days_Until_Deletion > 30 ? (
                            <span className="text-emerald-600 font-semibold">✓ {term.Days_Until_Deletion} days left</span>
                          ) : (
                            <span className="text-red-600 font-bold">⚠️ {term.Days_Until_Deletion} days left</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-20 text-center shadow-lg">
                <p className="text-gray-500 text-lg">No termination records found</p>
              </div>
            )}
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

export default Termination;
