import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlApi } from '../api';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { ArrowLeft, Copy, MousePointerClick, Calendar, ExternalLink, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [code]);

  const fetchAnalytics = async () => {
    try {
      const { data: res } = await urlApi.getAnalytics(code);
      setData(res);
    } catch (err) {
      toast.error('Failed to load analytics');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="center-loader"><Loader2 size={32} className="spin" /></div>;
  if (!data) return null;

  // Build last-14-days chart data
  const today = new Date();
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return { date: label, clicks: data.clicksByDay?.[key] || 0 };
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.shortUrl);
    toast.success('Copied!');
  };

  return (
    <div className="analytics-page">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="analytics-header">
        <div className="analytics-url-row">
          <a href={data.shortUrl} target="_blank" rel="noopener noreferrer" className="short-url-lg">
            {data.shortUrl.replace(/^https?:\/\//, '')}
            <ExternalLink size={14} />
          </a>
          <button className="icon-btn" onClick={handleCopy}><Copy size={15} /></button>
        </div>
        <p className="analytics-original" title={data.originalUrl}>→ {data.originalUrl}</p>
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <StatCard icon={<MousePointerClick size={20} />} label="Total Clicks" value={data.totalClicks} />
        <StatCard icon={<Calendar size={20} />} label="Created" value={new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
        <StatCard icon={<MousePointerClick size={20} />} label="Last 7 Days" value={
          chartData.slice(-7).reduce((s, d) => s + d.clicks, 0)
        } />
      </div>

      {/* Chart */}
      <div className="chart-card">
        <h3>Clicks — Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888' }} />
            <YAxis tick={{ fontSize: 11, fill: '#888' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent clicks */}
      {data.recentClicks?.length > 0 && (
        <div className="recent-clicks">
          <h3>Recent Clicks</h3>
          <div className="clicks-table">
            <div className="table-head">
              <span>Time</span>
              <span>Referrer</span>
              <span>Device</span>
            </div>
            {data.recentClicks.map((click, i) => (
              <div key={i} className="table-row">
                <span>{new Date(click.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="referer">{formatReferer(click.referer)}</span>
                <span className="ua">{parseDevice(click.userAgent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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

function formatReferer(ref) {
  if (!ref || ref === 'direct') return '(direct)';
  try { return new URL(ref).hostname; } catch { return ref; }
}

function parseDevice(ua = '') {
  if (/Mobile|Android|iPhone/i.test(ua)) return '📱 Mobile';
  if (/Tablet|iPad/i.test(ua)) return '📟 Tablet';
  return '🖥 Desktop';
}
