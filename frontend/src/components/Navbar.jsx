import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Scale, History, Bookmark, User, LogOut, Search } from 'lucide-react';
import { signOut } from '../services/supabase.js';

export default function Navbar({ user, onSignOut }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      if (onSignOut) onSignOut();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="logo-icon">
            <Scale size={24} />
          </span>
          <span>Legal Case Finder AI</span>
        </Link>

        <nav>
          <ul className="navbar-nav">
            <li>
              <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Search size={16} />
                <span>Find Cases</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <History size={16} />
                <span>Search History</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/saved" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Bookmark size={16} />
                <span>Saved Cases</span>
              </NavLink>
            </li>

            {user ? (
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-badge" title={user.email}>
                  <div className="user-avatar">{userInitial}</div>
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </li>
            ) : (
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <span>Sign In</span>
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  <User size={13} />
                  <span>Sign Up</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
