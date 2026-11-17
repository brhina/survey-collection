import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  MoreVertical,
  LogIn,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import Badge from '../ui/Badge';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                SurveyFlow
              </span>
            </div>
          </Link>

          {/* Right Navigation & MoreVertical Dropdown */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Surveys</span>
            </Link>

            {/* Overflow MoreVertical Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer ${
                  menuOpen
                    ? 'bg-slate-100 border-slate-300 text-slate-900'
                    : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900'
                }`}
                aria-label="User options menu"
                aria-expanded={menuOpen}
              >
                {isAuthenticated && user && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {user.name}
                          </p>
                          <Badge variant="emerald" className="text-[10px] capitalize px-2 py-0.5">
                            {user.role === 'admin' ? (
                              <ShieldCheck className="w-3 h-3 mr-1" />
                            ) : (
                              <UserCheck className="w-3 h-3 mr-1" />
                            )}
                            {user.role === 'admin' ? 'Manager' : user.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Dashboard Links */}
                      {isAdmin && (
                        <div className="py-1">
                          <Link
                            to="/admin"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                              location.pathname === '/admin'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                            <span>Dashboard</span>
                          </Link>

                          <Link
                            to="/admin/create"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                              location.pathname === '/admin/create'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <PlusCircle className="w-4 h-4 text-emerald-600" />
                            <span>Create Survey</span>
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      {/* Logout Action */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/70 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    /* Unauthenticated Menu: Login Option */
                    <div className="py-1">
                      <Link
                        to="/admin/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <LogIn className="w-4 h-4 text-emerald-600" />
                        <span>Log In</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
