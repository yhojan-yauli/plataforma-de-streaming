import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Menu, X, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useContentStore } from '@/store';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useContentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Inicio', path: '/home' },
    { label: 'Películas', path: '/browse?type=MOVIE' },
    { label: 'Series', path: '/browse?type=SERIES' },
    { label: 'Mi Lista', path: '/my-list' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-background/80 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to={isAuthenticated ? '/home' : '/'} className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-primary">STREAMIX</span>
        </Link>

        {/* Desktop nav links */}
        {isAuthenticated && (
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  location.pathname === link.path.split('?')[0] ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-40 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary md:w-56"
                    autoFocus
                  />
                  <button type="button" onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="ml-1 p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button onClick={() => setShowSearch(true)} className="p-2 text-muted-foreground transition-colors hover:text-foreground">
                  <Search className="h-5 w-5" />
                </button>
              )}

              <button className="relative p-2 text-muted-foreground transition-colors hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-secondary"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 w-48 animate-scale-in rounded-md border border-border bg-card p-1 shadow-xl">
                    <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
                      <User className="h-4 w-4" /> Mi Perfil
                    </Link>
                    <Link to="/profile/settings" onClick={() => setShowMenu(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
                      <Settings className="h-4 w-4" /> Configuración
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={() => { logout(); navigate('/'); setShowMenu(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button onClick={() => setShowMobile(!showMobile)} className="p-2 text-muted-foreground md:hidden">
                {showMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {showMobile && isAuthenticated && (
        <div className="animate-fade-in border-t border-border bg-background px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setShowMobile(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setShowMobile(false)} className="block py-2 text-sm text-primary">
              Panel Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
