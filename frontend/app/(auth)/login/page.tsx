'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeVisible, EyeNotVisible } from '@/components/icons/PasswordIcons';
import { login } from '@/lib/api';
import { saveTokens, clearTokens } from '@/lib/auth';

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: '39px',
  borderRadius: '6px',
  border: '1px solid #957139',
  padding: '7px 15px',
  outline: 'none',
  backgroundColor: 'transparent',
  fontFamily: 'Inter, sans-serif',
  fontSize: '12px',
  fontWeight: 400,
  color: '#000000',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    clearTokens(); // remove any stale tokens before logging in
    try {
      const data = await login(email, password);
      saveTokens(data.access, data.refresh);
      window.location.href = '/';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } })?.response?.data;
      if (msg?.detail) setError(msg.detail);
      else if (msg?.non_field_errors) setError(msg.non_field_errors[0]);
      else setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF1E3' }}
    >
      <div className="flex flex-col items-center" style={{ width: '384px', gap: '24px' }}>

        {/* Cactus illustration */}
        <img src="/cactus.png" alt="Cactus" style={{ width: '95px', height: '114px', objectFit: 'contain' }} />

        {/* Title */}
        <h1
          style={{
            fontFamily: '"Inria Serif", Georgia, serif',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '100%',
            color: '#88642A',
            textAlign: 'center',
          }}
        >
          Yay, You&apos;re Back!
        </h1>

        {/* Error */}
        {error && (
          <div
            className="w-full text-sm rounded-md px-4 py-3"
            style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col" style={{ gap: '8px' }}>
          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
            style={INPUT_STYLE}
          />

          {/* Password */}
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              style={{ ...INPUT_STYLE, paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ right: '12px', color: '#957139', lineHeight: 0 }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeVisible size={16} /> : <EyeNotVisible size={16} />}
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full disabled:opacity-60 transition-all active:scale-[0.98]"
            style={{
              marginTop: '8px',
              height: '43px',
              borderRadius: '46px',
              border: '1px solid #957139',
              backgroundColor: 'transparent',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              color: '#957139',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(149,113,57,0.20)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Link */}
        <Link
          href="/signup"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: '#957139',
            textDecoration: 'underline',
          }}
        >
          Oops! I&apos;ve never been here before
        </Link>
      </div>
    </div>
  );
}
