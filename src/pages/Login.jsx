import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || "An unexpected error occurred.");
    }
  };

  const autofill = (e, p) => {
    setEmail(e);
    setPassword(p);
    setError(null);
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundColor: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card col gap-6" style={{
        width: '100%', maxWidth: '420px',
        padding: '32px', border: '1px solid var(--b)'
      }}>

        {/* Logo block */}
        <div className="col gap-2 items-center">
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>
            ⚡
          </div>
          <div className="col items-center">
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>InvoiceIQ</h1>
            <span style={{ fontSize: '10px', color: 'var(--accent)', fontFamily: 'DM Mono', backgroundColor: 'var(--ag)', padding: '2px 6px', borderRadius: '4px', fontWeight: 500, marginTop: '4px' }}>BETA</span>
          </div>
        </div>

        {/* Heading */}
        <div className="col gap-1 items-center">
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Welcome back</h2>
          <div style={{ color: 'var(--t2)', fontSize: '13px' }}>Sign in to your account</div>
        </div>

        {/* Form */}
        <form className="col gap-4" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label text-xs">EMAIL ADDRESS</label>
            <input
              type="email" className="input"
              required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label text-xs">PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input w-full"
                required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn bp w-full" style={{ padding: '10px 0', marginTop: '4px' }}>
            Sign in
          </button>

          {error && (
            <div style={{ color: 'var(--red)', fontSize: '12px', textAlign: 'center', marginTop: '4px', fontWeight: 500 }}>
              {error}
            </div>
          )}
        </form>

        {/* Demo credentials helper */}
        <div style={{
          backgroundColor: 'var(--s2)', borderRadius: 'var(--rs)',
          padding: '10px', marginTop: '8px',
          maxHeight: '200px', overflowY: 'auto'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--b)' }}>
            INVOICEIQ OWNER
          </div>
          <table style={{ width: '100%', fontSize: '11px', fontFamily: 'DM Mono', color: 'var(--t2)', marginBottom: '12px' }}>
            <tbody>
              <tr style={{ cursor: 'pointer' }} onClick={() => autofill('rahul@invoiceiq.io', 'password123')} className="hover:bg-s3">
                <td style={{ padding: '2px 0', width: '120px' }}>rahul@invoiceiq.io</td>
                <td style={{ padding: '2px 0', color: 'var(--t3)' }}>/ password123</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--b)' }}>
            ORG ADMINS
          </div>
          <table style={{ width: '100%', fontSize: '11px', fontFamily: 'DM Mono', color: 'var(--t2)', marginBottom: '12px' }}>
            <tbody>
              <tr style={{ cursor: 'pointer' }} onClick={() => autofill('admin@tcs.com', 'password123')} className="hover:bg-s3">
                <td style={{ padding: '2px 0', width: '120px' }}>admin@tcs.com</td>
                <td style={{ padding: '2px 0', color: 'var(--t3)' }}>/ password123</td>
              </tr>
            </tbody>
          </table>

          <div style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid var(--b)' }}>
            EMPLOYEES
          </div>
          <table style={{ width: '100%', fontSize: '11px', fontFamily: 'DM Mono', color: 'var(--t2)' }}>
            <tbody>
              <tr style={{ cursor: 'pointer' }} onClick={() => autofill('sneha@tcs.com', 'password123')} className="hover:bg-s3">
                <td style={{ padding: '2px 0', width: '120px' }}>sneha@tcs.com</td>
                <td style={{ padding: '2px 0', color: 'var(--t3)' }}>/ password123</td>
              </tr>
            </tbody>
          </table>
          <style>{`
            .hover\\:bg-s3:hover td { color: var(--t); }
          `}</style>
        </div>

      </div>
    </div>
  );
}
