import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Send, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/institute', icon: <LayoutDashboard size={20} /> },
    { name: 'Templates', path: '/templates', icon: <FileText size={20} /> },
    { name: 'Compose Mail', path: '/compose', icon: <Send size={20} /> },
  ];

  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-brand">
        <h2>MailApp</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
