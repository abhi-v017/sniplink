import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Link2, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
        <Link2 size={20} />
        <span>Sniplink</span>
      </Link>

      {user && (
        <div className="navbar-right">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <div className="user-info">
            <img src={user.photoURL} alt="" className="avatar" referrerPolicy="no-referrer" />
            <span className="user-name">{user.displayName?.split(' ')[0]}</span>
          </div>
          <button className="btn-ghost" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
