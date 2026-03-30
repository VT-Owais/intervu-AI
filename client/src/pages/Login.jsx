import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-4">
      <div style={{ position:'fixed', top:'-10%', left:'-5%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-10%', right:'-5%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div className="animate-fade-in" style={{ width:'100%', maxWidth:'440px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg, #6366f1, #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Sparkles size={22} color="white" />
            </div>
            <span style={{ fontSize:'28px', fontWeight:'800' }} className="gradient-text">IntervuAI</span>
          </div>
          <p style={{ color:'var(--text-secondary)', fontSize:'15px' }}>Practice. Learn. Get hired.</p>
        </div>

        <div className="glass-card" style={{ padding:'36px' }}>
          <h1 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'6px' }}>Welcome back</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'28px' }}>Sign in to continue your interview practice</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'500', color:'var(--text-secondary)', marginBottom:'8px' }}>Email address</label>
              <div style={{ position:'relative' }}>
                <Mail size={16} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
                <input id="login-email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required className="input-field" style={{ paddingLeft:'42px' }} />
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:'500', color:'var(--text-secondary)', marginBottom:'8px' }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={16} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
                <input id="login-password" name="password" type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={handleChange} required className="input-field" style={{ paddingLeft:'42px', paddingRight:'42px' }} />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" disabled={loading} className="btn-primary" style={{ width:'100%', height:'50px', fontSize:'16px', marginTop:'4px' }}>
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                  <span style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin-slow 0.8s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'24px', color:'var(--text-secondary)', fontSize:'14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--primary)', fontWeight:'600', textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>

        {/* Features hint */}
        <div style={{ display:'flex', justifyContent:'center', gap:'24px', marginTop:'32px', flexWrap:'wrap' }}>
          {['🤖 AI-Powered Questions', '🎤 Voice Interview', '📊 Instant Feedback'].map(f => (
            <span key={f} style={{ fontSize:'12px', color:'var(--text-secondary)', background:'rgba(255,255,255,0.05)', padding:'6px 12px', borderRadius:'20px', border:'1px solid var(--border)' }}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
