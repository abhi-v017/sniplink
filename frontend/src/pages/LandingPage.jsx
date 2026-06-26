import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Link2, BarChart2, Shuffle, QrCode, Zap } from 'lucide-react';

export default function LandingPage() {
  const { loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
    } catch (err) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-badge">
          <Zap size={14} />
          Free · No credit card required
        </div>
        <h1 className="hero-title">
          Short links.<br />
          <span className="gradient-text">Real insights.</span>
        </h1>
        <p className="hero-sub">
          Paste a long URL, get a clean short link in seconds.
          Track every click with a built-in analytics dashboard.
        </p>
        <button className="btn-google" onClick={handleLogin}>
          <GoogleIcon />
          Continue with Google
        </button>
      </section>

      <section className="features">
        <FeatureCard icon={<Link2 size={22} />} title="Custom Short Codes" desc="Pick your own alias — brand it your way." />
        <FeatureCard icon={<BarChart2 size={22} />} title="Click Analytics" desc="See total clicks and daily trends for every link." />
        <FeatureCard icon={<QrCode size={22} />} title="QR Code" desc="Instant QR for every link — download and share." />
        <FeatureCard icon={<Shuffle size={22} />} title="Auto Short Code" desc="Skip the alias and get a random code instantly." />
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
