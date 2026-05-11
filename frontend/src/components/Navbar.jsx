import React from 'react';
import { Search, LogOut, User as UserIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-[0_4px_12px_rgba(10,31,68,0.08)] sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 max-w-[1280px] mx-auto h-20">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img 
            alt="JECRC University Logo" 
            className="h-12 w-auto object-contain" 
            src="/logo.png" 
          />
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md ml-12">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm" 
              placeholder="Search clubs by name, category..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 mx-8">
          <Link to="/dashboard" className="text-primary border-b-2 border-primary pb-1 font-bold text-sm">Dashboard</Link>
          <Link to="/events" className="text-gray-500 hover:text-primary transition-colors text-sm font-semibold">Events</Link>
          <Link to="/directory" className="text-gray-500 hover:text-primary transition-colors text-sm font-semibold">Directory</Link>
        </nav>

        {/* User Actions & Profile */}
        <div className="flex items-center gap-6">
          <Link to="/profile" className="flex items-center gap-3 pr-6 border-r border-gray-200 group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{user?.full_name || user?.name || 'Student'}</p>
              <p className="text-[12px] text-gray-500">{user?.semester || user?.year || 'JECRC University'}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-secondary bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserIcon size={20} className="text-primary" />
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-bold active:scale-95"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
