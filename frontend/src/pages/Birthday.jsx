import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cake, Calendar, Gift, PartyPopper } from "lucide-react";

const Birthday = () => {
  const navigate = useNavigate();
  const [birthdays, setBirthdays] = useState({ today: [], upcoming: [], all: [] });
  const [stats, setStats] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchBirthdays(selectedMonth);
  }, [selectedMonth]);

  const fetchBirthdays = async (month) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8888/backend/get_birthdays.php?month=${month}`
      );
      const data = await res.json();

      if (data.success) {
        setBirthdays(data.birthdays);
        setStats(data.stats);
        
        if (data.birthdays.today.length > 0) {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 5000);
        }
      }
    } catch (err) {
      console.error("Error fetching birthdays:", err);
    }
    setLoading(false);
  };

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
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

      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: '10px',
                height: '10px',
                background: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'][Math.floor(Math.random() * 5)],
                animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: '50%'
              }}
            />
          ))}
        </div>
      )}

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
                <Cake className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
                Birthday Celebrations
                <PartyPopper className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
              </h1>
              <p className="text-sm text-gray-600 mt-1">Never miss a birthday again!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-12 z-10">
        
        {/* Month Selector */}
        <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-8 shadow-lg shadow-emerald-100/50 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
            <label className="text-lg font-bold text-gray-900">Select Month</label>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full h-12 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-lg font-semibold"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month} {index + 1 === new Date().getMonth() + 1 ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-8 shadow-lg shadow-pink-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Cake className="w-32 h-32" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="text-white/80 text-sm mb-2">Birthdays Today</div>
              <div className="text-5xl font-bold text-white mb-1">{stats.today || 0}</div>
              <div className="text-white/90 text-sm">🎈 Celebrate now!</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl p-8 shadow-lg shadow-emerald-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Calendar className="w-32 h-32" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="text-white/80 text-sm mb-2">Upcoming in {stats.month_name}</div>
              <div className="text-5xl font-bold text-white mb-1">{stats.upcoming || 0}</div>
              <div className="text-white/90 text-sm">📅 Coming soon</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl p-8 shadow-lg shadow-purple-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <Gift className="w-32 h-32" strokeWidth={1} />
            </div>
            <div className="relative z-10">
              <div className="text-white/80 text-sm mb-2">Total This Month</div>
              <div className="text-5xl font-bold text-white mb-1">{stats.total_birthdays || 0}</div>
              <div className="text-white/90 text-sm">🎊 Celebrations</div>
            </div>
          </div>
        </div>

        {/* Today's Birthdays */}
        {birthdays.today && birthdays.today.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <PartyPopper className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
              Celebrating Today!
              <PartyPopper className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {birthdays.today.map((employee) => (
                <div
                  key={employee.Employee_ID}
                  className="group relative bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-300 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
                >
                  {/* Floating cake emoji */}
                  <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-30 transition-opacity animate-bounce">
                    🎂
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Cake className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{employee.Employee_Full_Name}</h3>
                        <p className="text-pink-600 font-semibold">Turning {employee.Age} today!</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Position:</span> {employee.Company_Position_Title}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Department:</span> {employee.Department_Name}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Email:</span> {employee.Email_Address}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-3 px-4 rounded-xl font-bold shadow-lg">
                      🎉 IT'S THEIR BIRTHDAY TODAY! 🎉
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Birthdays */}
        {birthdays.upcoming && birthdays.upcoming.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-emerald-600" strokeWidth={2.5} />
              Upcoming Birthdays in {stats.month_name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {birthdays.upcoming.map((employee) => (
                <div
                  key={employee.Employee_ID}
                  className="group bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">🎂</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{employee.Employee_Full_Name}</h3>
                      <p className="text-emerald-600 font-semibold">
                        {employee.Birthday_Day}{getOrdinalSuffix(employee.Birthday_Day)} {stats.month_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-gray-700">
                      <span className="font-semibold">Turning:</span> {employee.Age} years old
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Position:</span> {employee.Company_Position_Title}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Department:</span> {employee.Department_Name}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Office:</span> {employee.Office_Name}
                    </p>
                  </div>
                  
                  {employee.Days_Until_Birthday !== null && employee.Days_Until_Birthday > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700 text-center py-2 px-4 rounded-xl font-semibold text-sm">
                      🎈 {employee.Days_Until_Birthday} day{employee.Days_Until_Birthday !== 1 ? 's' : ''} to go!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Birthdays Message */}
        {birthdays.all && birthdays.all.length === 0 && !loading && (
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-20 text-center shadow-lg">
            <div className="text-8xl mb-6 animate-bounce">🎂</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No birthdays in {stats.month_name}
            </h3>
            <p className="text-gray-600">Try selecting a different month!</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-3xl p-20 text-center shadow-lg">
            <div className="text-6xl mb-6 animate-spin">⏳</div>
            <p className="text-xl text-gray-600">Loading birthdays...</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Birthday;
