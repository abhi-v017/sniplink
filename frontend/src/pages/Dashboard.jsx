import { useState, useEffect } from 'react';
import { urlApi } from '../api';
import ShortenForm from '../components/ShortenForm';
import UrlCard from '../components/UrlCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link2, TrendingUp, MousePointerClick, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const { data } = await urlApi.getAll();
      setUrls(data.urls);
    } catch {
      toast.error('Failed to load your links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (newUrl) => {
    setUrls(prev => [newUrl, ...prev]);
  };

  const handleDeleted = (code) => {
    setUrls(prev => prev.filter(u => u.shortCode !== code));
  };

  const totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.displayName?.split(' ')[0]} 👋</h1>
          <p className="dash-sub">Manage and track all your short links</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <StatCard icon={<Link2 size={20} />} label="Total Links" value={urls.length} />
        <StatCard icon={<MousePointerClick size={20} />} label="Total Clicks" value={totalClicks} />
        <StatCard icon={<TrendingUp size={20} />} label="Avg. Clicks" value={urls.length ? (totalClicks / urls.length).toFixed(1) : 0} />
      </div>

      {/* Shorten Form */}
      <div className="form-section">
        <h2>Create a new link</h2>
        <ShortenForm onCreated={handleCreated} />
      </div>

      {/* Links List */}
      <div className="links-section">
        <h2>Your Links {urls.length > 0 && <span className="count-badge">{urls.length}</span>}</h2>

        {loading ? (
          <div className="center-loader"><Loader2 size={28} className="spin" /></div>
        ) : urls.length === 0 ? (
          <div className="empty-state">
            <Link2 size={40} />
            <p>No links yet. Paste a URL above to get started.</p>
          </div>
        ) : (
          <div className="urls-list">
            {urls.map(url => (
              <UrlCard key={url.shortCode} url={url} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
