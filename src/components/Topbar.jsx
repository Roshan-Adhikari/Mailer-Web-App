import './Topbar.css';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="search-bar glass-panel">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search contacts, templates..." />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn glass-panel">
          <Bell size={20} />
        </button>
        <div className="user-profile glass-panel">
          <User size={20} />
          <span>{user?.email || 'User'}</span>
        </div>
        <button className="icon-btn glass-panel" onClick={logout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
