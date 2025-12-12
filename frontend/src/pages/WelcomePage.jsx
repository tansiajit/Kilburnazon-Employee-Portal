import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Edit, TrendingUp, UserX, Cake } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/directory', icon: Users, title: 'Employee Directory', desc: 'Browse all team members' },
    { path: '/add', icon: UserPlus, title: 'Add Employee', desc: 'Onboard new talent' },
    { path: '/update', icon: Edit, title: 'Update Employee', desc: 'Modify employee details' },
    { path: '/promote', icon: TrendingUp, title: 'Promote Employee', desc: 'Advance team members' },
    { path: '/termination', icon: UserX, title: 'Terminate Employee', desc: 'Process departures' },
    { path: '/birthday', icon: Cake, title: 'Birthday Card', desc: 'Celebrate milestones' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-white relative overflow-hidden">
      {/* Enhanced Decorative Background with more green blurs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large green blurs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-200/50 to-green-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-green-200/40 to-emerald-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-100/30 to-green-100/30 rounded-full blur-3xl"></div>
        
        {/* Smaller accent blurs */}
        <div className="absolute top-20 left-20 w-[300px] h-[300px] bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-40 w-[400px] h-[400px] bg-green-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] bg-emerald-200/25 rounded-full blur-2xl"></div>
      </div>

      {/* Header with green accent */}
      <header className="relative bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shadow-emerald-100/50 z-10">
        <div className="max-w-full mx-auto px-6 py-5">
          <div className="flex items-center justify-center">
            {/* Logo Image with subtle green glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
              <img 
                src="/kilburnazon-logo.png" 
                alt="Kilburnazon Logo" 
                className="h-14 object-contain relative z-10"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-16 z-10">
        {/* Hero Section with green accents */}
        <div className="text-center mb-16 relative">
          {/* Green accent blur behind heading */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-emerald-300/20 blur-3xl -z-10"></div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 leading-tight">
            Employee<br />
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">
              Management
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Streamline your HR operations with powerful tools designed for modern teams
          </p>
        </div>

        {/* Quick Access Section with green underline glow */}
        <div className="text-center mb-10 relative">
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent tracking-wide uppercase mb-3">
            Quick Access
          </h3>
          <div className="relative w-20 h-1 mx-auto">
            <div className="absolute inset-0 bg-emerald-400 blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full"></div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  animation: 'slideUp 0.6s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
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
                className="group relative rounded-3xl p-8 text-left transition-all duration-500 hover:scale-[1.02] overflow-hidden"
              >
                {/* Content wrapper */}
                <div className="relative z-10">
                  {/* Icon with white background */}
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110">
                    <Icon className="w-8 h-8 text-emerald-600 group-hover:text-emerald-700" strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-white mb-2 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-white/90 leading-relaxed transition-colors duration-300">
                    {item.desc}
                  </p>
                  
                  {/* Arrow indicator */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 mt-4">
                    <span>Access</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer with green accent */}
      <footer className="relative border-t border-emerald-100 mt-20 z-10 bg-white/80 backdrop-blur-md">
        {/* Green glow line at top of footer */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm"></div>
        
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">© 2024 Kilburnazon. All rights reserved.</p>
            <p className="text-gray-500">Powered by modern HR technology</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
};

export default WelcomePage;
