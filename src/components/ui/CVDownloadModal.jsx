import { useState } from 'react';

const REPLIT_BASE = 'https://mujeeb-lawal.replit.app';

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.55)',
  zIndex: 10000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const card = {
  background: '#fdfaf5',
  border: '2px solid #1a1a1a',
  borderRadius: '10px',
  boxShadow: '6px 6px 0 rgba(0,0,0,0.25)',
  padding: '28px 28px 24px',
  width: '100%',
  maxWidth: '360px',
  fontFamily: '"Inter", sans-serif',
  position: 'relative',
};

const label = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#555',
  marginBottom: '6px',
};

const inputStyle = {
  width: '100%',
  border: '1.5px solid #c8bfb0',
  borderRadius: '6px',
  padding: '9px 11px',
  fontSize: '14px',
  fontFamily: '"Inter", sans-serif',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const primaryBtn = {
  width: '100%',
  padding: '11px',
  background: '#1a1a1a',
  color: '#f4f0e7',
  border: 'none',
  borderRadius: '7px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: '"Caveat", cursive',
  fontSize: '18px',
  letterSpacing: '0.02em',
};

export default function CVDownloadModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Please fill in your name and email.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${REPLIT_BASE}/api/cv/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Mujeeb_Lawal_CV.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      setError('Something went wrong. Please try again or visit the classic site to download.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={card} role="dialog" aria-modal="true" aria-label="Download CV">
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555', lineHeight: 1 }}
          aria-label="Close"
        >×</button>

        <h2 style={{ margin: '0 0 4px', fontFamily: '"Caveat", cursive', fontSize: '26px', fontWeight: 700, color: '#1a1a1a' }}>
          Download CV
        </h2>
        <p style={{ margin: '0 0 22px', fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
          Enter your details to receive Mujeeb's CV.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={label} htmlFor="cv-name">Full Name *</label>
            <input
              id="cv-name"
              style={inputStyle}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label style={label} htmlFor="cv-email">Email Address *</label>
            <input
              id="cv-email"
              style={inputStyle}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={submitting}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: '#c0392b', background: '#fdf0ee', border: '1px solid #f5c6c6', padding: '8px 10px', borderRadius: '5px' }}>
              {error}
            </p>
          )}

          <button type="submit" style={{ ...primaryBtn, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
            {submitting ? 'Downloading…' : '↓ Download CV'}
          </button>
        </form>
      </div>
    </div>
  );
}
