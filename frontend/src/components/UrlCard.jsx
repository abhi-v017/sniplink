import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../api';
import toast from 'react-hot-toast';
import { Copy, Trash2, BarChart2, QrCode, ExternalLink, Check, X } from 'lucide-react';

export default function UrlCard({ url, onDeleted }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this link? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await urlApi.delete(url.shortCode);
      toast.success('Link deleted');
      onDeleted(url.shortCode);
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
    }
  };

  const formattedDate = new Date(url.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const originalDisplay = url.originalUrl.length > 55
    ? url.originalUrl.slice(0, 55) + '…'
    : url.originalUrl;

  return (
    <div className="url-card">
      <div className="url-card-top">
        <div className="url-info">
          <div className="short-url-row">
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
              {url.shortUrl.replace(/^https?:\/\//, '')}
            </a>
            <ExternalLink size={12} className="ext-icon" />
          </div>
          <p className="original-url" title={url.originalUrl}>{originalDisplay}</p>
          <div className="url-meta">
            <span className="meta-chip">
              <BarChart2 size={12} />
              {url.clicks} click{url.clicks !== 1 ? 's' : ''}
            </span>
            <span className="meta-chip">{formattedDate}</span>
          </div>
        </div>

        <div className="url-actions">
          <button className="icon-btn" onClick={handleCopy} title="Copy">
            {copied ? <Check size={16} className="green" /> : <Copy size={16} />}
          </button>
          <button className="icon-btn" onClick={() => setShowQR(v => !v)} title="QR Code">
            {showQR ? <X size={16} /> : <QrCode size={16} />}
          </button>
          <button className="icon-btn" onClick={() => navigate(`/analytics/${url.shortCode}`)} title="Analytics">
            <BarChart2 size={16} />
          </button>
          <button className="icon-btn danger" onClick={handleDelete} disabled={deleting} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showQR && (
        <div className="qr-panel">
          <QRCodeSVG value={url.shortUrl} size={140} includeMargin bgColor="#ffffff" />
          <div className="qr-actions">
            <p className="qr-label">Scan to open</p>
            <button className="btn-outline-sm" onClick={() => downloadQR(url.shortCode, url.shortUrl)}>
              Download QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function downloadQR(code, shortUrl) {
  const svg = document.querySelector(`[data-qr="${code}"] svg`) || document.querySelector('.qr-panel svg');
  if (!svg) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  canvas.width = 200; canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.drawImage(img, 0, 0, 200, 200);
    const a = document.createElement('a');
    a.download = `qr-${code}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}
