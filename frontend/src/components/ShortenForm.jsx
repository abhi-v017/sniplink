import { useState } from 'react';
import { urlApi } from '../api';
import toast from 'react-hot-toast';
import { Link2, Wand2, Loader2 } from 'lucide-react';

export default function ShortenForm({ onCreated }) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl.trim()) return toast.error('Please enter a URL');

    setLoading(true);
    try {
      const { data } = await urlApi.create({
        originalUrl: originalUrl.trim(),
        customCode: customCode.trim() || undefined,
      });
      toast.success('Short link created!');
      onCreated(data);
      setOriginalUrl('');
      setCustomCode('');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create short link';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="input-group">
          <Link2 size={16} className="input-icon" />
          <input
            type="url"
            className="form-input"
            placeholder="Paste your long URL here..."
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <Wand2 size={16} className="input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Custom alias (optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            pattern="[a-zA-Z0-9_-]{3,20}"
            title="3–20 chars: letters, numbers, - or _"
          />
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : 'Shorten'}
        </button>
      </div>
    </form>
  );
}
