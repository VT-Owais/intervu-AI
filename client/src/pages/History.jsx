import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Sparkles, Home, Calendar, Target, Clock, ChevronRight, Trophy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/history')
      .then(({ data }) => setSessions(data.sessions))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const viewSession = async (id) => {
    try {
      const { data } = await api.get(`/history/${id}`);
      // Store as result and navigate
      sessionStorage.setItem('interview_result', JSON.stringify({ evaluation: {
        overallScore: data.session.overallScore,
        summary: data.session.summary,
        strengths: data.session.strengths,
        improvements: data.session.improvements,
        questions: data.session.questions.map(q => ({
          question: q.question,
          userAnswer: q.userAnswer,
          modelAnswer: q.modelAnswer,
          score: q.score,
          feedback: q.feedback
        }))
      }, sessionId: id }));
      navigate('/results');
    } catch {
      toast.error('Failed to load session');
    }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview history?')) return;
    try {
      await api.delete(`/history/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success('History deleted successfully');
    } catch {
      toast.error('Failed to delete history');
    }
  };

  const avgScore = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.overallScore || 0), 0) / sessions.length) : 0;
  const best = sessions.length ? Math.max(...sessions.map(s => s.overallScore || 0)) : 0;

  const scoreColor = s => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mesh-bg min-h-screen">
      {/* Navbar */}
      <nav style={{ borderBottom:'1px solid var(--border)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', backdropFilter:'blur(20px)', background:'rgba(10,10,15,0.8)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Sparkles size={18} style={{ color:'var(--primary)' }} />
          <span style={{ fontWeight:'800', fontSize:'18px' }} className="gradient-text">IntervuAI</span>
          <span style={{ color:'var(--text-secondary)', fontSize:'14px' }}>/ Interview History</span>
        </div>
        <button id="back-to-dashboard" onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', cursor:'pointer', fontSize:'14px', fontFamily:'Inter,sans-serif' }}>
          <Home size={15} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 24px' }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ marginBottom:'36px' }}>
          <h1 style={{ fontSize:'34px', fontWeight:'900', marginBottom:'8px', display:'flex', alignItems:'center', gap:'12px' }}>
            <HistoryIcon size={32} style={{ color:'var(--primary)' }} />
            Interview History
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'16px' }}>Track your progress over time</p>
        </div>

        {/* Stats row */}
        {sessions.length > 0 && (
          <div className="animate-fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px', marginBottom:'32px' }}>
            {[
              { label:'Total Sessions', value: sessions.length, icon: <HistoryIcon size={20} />, color:'var(--primary)' },
              { label:'Average Score', value: `${avgScore}/100`, icon: <Target size={20} />, color:'var(--accent)' },
              { label:'Best Score', value: `${best}/100`, icon: <Trophy size={20} />, color:'#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="glass-card" style={{ padding:'20px', display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`rgba(${s.color === 'var(--primary)' ? '99,102,241' : s.color === 'var(--accent)' ? '6,182,212' : '245,158,11'},0.15)`, display:'flex', alignItems:'center', justifyContent:'center', color: s.color, flexShrink:0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize:'22px', fontWeight:'800', color:'var(--text-primary)' }}>{s.value}</div>
                  <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sessions list */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px', color:'var(--text-secondary)' }}>
            <span style={{ width:'32px', height:'32px', border:'3px solid var(--border)', borderTopColor:'var(--primary)', borderRadius:'50%', display:'inline-block', animation:'spin-slow 0.8s linear infinite' }} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card animate-fade-in" style={{ padding:'60px', textAlign:'center' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>🎯</div>
            <h2 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'8px' }}>No interviews yet</h2>
            <p style={{ color:'var(--text-secondary)', marginBottom:'24px' }}>Complete your first AI interview to see your results here</p>
            <button id="start-first-interview" onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding:'12px 28px' }}>
              Start My First Interview
            </button>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {sessions.map((s, i) => (
              <button key={s.id} id={`session-${i}`} onClick={() => viewSession(s.id)} style={{ width:'100%', textAlign:'left', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                <div className="glass-card" style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:'16px', transition:'all 0.2s ease', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                >
                  {/* Score badge */}
                  <div style={{ width:'56px', height:'56px', borderRadius:'14px', background:`rgba(${scoreColor(s.overallScore) === '#10b981' ? '16,185,129' : scoreColor(s.overallScore) === '#f59e0b' ? '245,158,11' : '239,68,68'},0.15)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'18px', fontWeight:'900', color: scoreColor(s.overallScore) }}>{s.overallScore}</span>
                    <span style={{ fontSize:'10px', color:'var(--text-secondary)' }}>/100</span>
                  </div>

                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'600', fontSize:'15px', marginBottom:'4px', color:'var(--text-primary)' }}>
                      {s.topics ? `Topics: ${s.topics.substring(0,60)}${s.topics.length > 60 ? '...' : ''}` : 'General Interview'}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', color:'var(--text-secondary)' }}>
                        <Calendar size={13} />{formatDate(s.date)}
                      </span>
                      {s.duration > 0 && (
                        <span style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'13px', color:'var(--text-secondary)' }}>
                          <Clock size={13} />{formatDuration(s.duration)}
                        </span>
                      )}
                      <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>📝 {s.questionCount} questions</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => deleteSession(e, s.id)} 
                    style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete session"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  >
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={20} style={{ color:'var(--text-secondary)', flexShrink:0 }} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
