import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Sparkles, Tag, ChevronRight, LogOut, History, Mic, Brain } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [file, setFile] = useState(null);
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      toast.success(`📄 ${f.name} loaded`);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleStart = async () => {
    if (loading) return;
    if (!file && !topics.trim()) {
      toast.error('Please upload a resume OR enter at least one topic');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) formData.append('resume', file);
      if (topics.trim()) formData.append('topics', topics.trim());

      const { data } = await api.post('/interview/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Store interview data in sessionStorage
      sessionStorage.setItem('interview_questions', JSON.stringify(data.questions));
      sessionStorage.setItem('interview_resume', data.resumeText);
      sessionStorage.setItem('interview_topics', topics);

      toast.success('15 questions generated! Starting interview...');
      navigate('/interview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: <Brain size={20} />, label: 'AI-Powered', value: 'Questions' },
    { icon: <Mic size={20} />, label: 'Voice', value: 'Recording' },
    { icon: <Sparkles size={20} />, label: 'Instant', value: 'Feedback' },
  ];

  return (
    <div className="mesh-bg min-h-screen">
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,15,0.8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800' }} className="gradient-text">IntervuAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>👋 {user?.email}</span>
          <button id="nav-history" onClick={() => navigate('/history')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter,sans-serif' }}>
            <History size={15} /> History
          </button>
          <button id="nav-logout" onClick={() => { logout(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '8px 14px', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter,sans-serif' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', lineHeight: '1.1', marginBottom: '16px' }}>
            Ready to ace your<br />
            <span className="gradient-text">next interview?</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
            Upload your resume and our AI will generate 15 personalized questions tailored to your profile.
          </p>
        </div>

        {/* Stats */}
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {stats.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'var(--primary)' }}>{s.icon}</div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="glass-card animate-fade-in" style={{ padding: '40px' }}>
          {/* Resume Upload */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
              <FileText size={18} style={{ color: 'var(--primary)' }} />
              Resume / CV (PDF)
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '400' }}>(optional if topics provided)</span>
            </label>

            <div
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : file ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: dragOver ? 'rgba(99,102,241,0.08)' : file ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} id="resume-upload" />
              {file ? (
                <>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <div style={{ fontWeight: '600', color: 'var(--success)', fontSize: '15px' }}>{file.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>({(file.size / 1024).toFixed(1)} KB) — Click to change</div>
                </>
              ) : (
                <>
                  <Upload size={36} style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>Drop your PDF here</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>or click to browse your files</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>Supports: PDF (max 10MB)</div>
                </>
              )}
            </div>
          </div>

          {/* Topics */}
          <div style={{ marginBottom: '36px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600', marginBottom: '14px' }}>
              <Tag size={18} style={{ color: 'var(--secondary)' }} />
              Focus Topics
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '400' }}>(optional if resume uploaded)</span>
            </label>
            <textarea
              id="topics-input"
              value={topics}
              onChange={e => setTopics(e.target.value)}
              placeholder="e.g. React, Node.js, System Design, JavaScript fundamentals, Data structures..."
              className="input-field"
              rows={3}
              style={{ resize: 'vertical', minHeight: '90px' }}
            />
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
              💡 Add specific topics to get targeted questions beyond what's in your resume
            </p>
          </div>

          {/* Start Button */}
          <button
            id="start-interview-btn"
            onClick={() => {
              if (!loading) handleStart();
            }}
            disabled={loading || (!file && !topics.trim())}
            className="btn-primary"
            style={{ width: '100%', height: '56px', fontSize: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {loading ? (
              <>
                <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin-slow 0.8s linear infinite' }} />
                Generating 15 Questions with AI...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Start AI Interview
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* How it works */}
        <div className="animate-fade-in" style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { step: '1', title: 'Upload Resume', desc: 'PDF is parsed by AI', icon: '📄' },
            { step: '2', title: 'AI Generates', desc: '15 tailored questions', icon: '🤖' },
            { step: '3', title: 'Answer by Voice', desc: 'Or type your answers', icon: '🎤' },
            { step: '4', title: 'Get Feedback', desc: 'Scores & model answers', icon: '📊' },
          ].map(s => (
            <div key={s.step} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Step {s.step}</div>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{s.title}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
