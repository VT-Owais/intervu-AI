import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Home, History } from 'lucide-react';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement);

function ScoreRing({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const data = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [color, 'rgba(255,255,255,0.05)'],
      borderWidth: 0,
      circumference: 280,
      rotation: -140,
    }]
  };
  return (
    <div style={{ position:'relative', width:'160px', height:'160px', margin:'0 auto' }}>
      <Doughnut data={data} options={{ cutout:'75%', plugins:{ legend:{ display:false }, tooltip:{ enabled:false } }, animation:{ duration:1500 } }} />
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:'36px', fontWeight:'900', color }}>{score}</div>
        <div style={{ fontSize:'13px', color:'var(--text-secondary)', fontWeight:'500' }}>/ 100</div>
      </div>
    </div>
  );
}

function QuestionCard({ qa, index }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = qa.score >= 8 ? '#10b981' : qa.score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-card" style={{ marginBottom:'12px', overflow:'hidden' }}>
      <button onClick={() => setExpanded(p => !p)} style={{ width:'100%', padding:'18px 20px', display:'flex', alignItems:'center', gap:'14px', background:'none', border:'none', cursor:'pointer', textAlign:'left', color:'var(--text-primary)', fontFamily:'Inter,sans-serif' }}>
        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg, var(--primary), var(--secondary))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px', color:'white', flexShrink:0 }}>
          Q{index + 1}
        </div>
        <div style={{ flex:1, fontSize:'14px', fontWeight:'500', lineHeight:'1.4' }}>{qa.question}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ background:`rgba(${scoreColor === '#10b981' ? '16,185,129' : scoreColor === '#f59e0b' ? '245,158,11' : '239,68,68'},0.15)`, padding:'6px 12px', borderRadius:'20px', fontSize:'14px', fontWeight:'700', color: scoreColor }}>
            {qa.score}/10
          </div>
          {expanded ? <ChevronUp size={18} style={{ color:'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color:'var(--text-secondary)' }} />}
        </div>
      </button>

      {expanded && (
        <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)' }}>
          {/* Your answer */}
          <div style={{ marginTop:'16px', marginBottom:'16px' }}>
            <div style={{ fontSize:'12px', fontWeight:'700', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Your Answer</div>
            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'14px', fontSize:'14px', lineHeight:'1.6', color: qa.userAnswer === '(No answer provided)' ? 'var(--text-secondary)' : 'var(--text-primary)', fontStyle: qa.userAnswer === '(No answer provided)' ? 'italic' : 'normal' }}>
              {qa.userAnswer}
            </div>
          </div>

          {/* Feedback */}
          <div style={{ marginBottom:'16px', background:'rgba(245,158,11,0.08)', borderRadius:'10px', padding:'14px', borderLeft:'3px solid #f59e0b' }}>
            <div style={{ fontSize:'12px', fontWeight:'700', color:'#f59e0b', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>💡 Feedback</div>
            <div style={{ fontSize:'14px', lineHeight:'1.6', color:'var(--text-primary)' }}>{qa.feedback}</div>
          </div>

          {/* Model Answer */}
          <div style={{ background:'rgba(16,185,129,0.08)', borderRadius:'10px', padding:'14px', borderLeft:'3px solid #10b981' }}>
            <div style={{ fontSize:'12px', fontWeight:'700', color:'#10b981', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'1px' }}>✅ Model Answer</div>
            <div style={{ fontSize:'14px', lineHeight:'1.6', color:'var(--text-primary)' }}>{qa.modelAnswer}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('interview_result');
    if (!stored) { navigate('/dashboard'); return; }
    setResult(JSON.parse(stored));
  }, [navigate]);

  if (!result) return null;

  const { evaluation, sessionId } = result;
  const { overallScore, summary, strengths, improvements, questions } = evaluation;

  const radarData = {
    labels: questions.slice(0, 6).map((_, i) => `Q${i+1}`),
    datasets: [{
      label: 'Score',
      data: questions.slice(0, 6).map(q => q.score),
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      pointBackgroundColor: '#6366f1',
      borderWidth: 2,
    }]
  };

  const scoreLabel = overallScore >= 80 ? '🏆 Excellent' : overallScore >= 60 ? '👍 Good' : overallScore >= 40 ? '📈 Fair' : '💪 Needs Work';
  const scoreColor = overallScore >= 75 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="mesh-bg min-h-screen">
      {/* Navbar */}
      <nav style={{ borderBottom:'1px solid var(--border)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', backdropFilter:'blur(20px)', background:'rgba(10,10,15,0.8)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Sparkles size={18} style={{ color:'var(--primary)' }} />
          <span style={{ fontWeight:'800', fontSize:'18px' }} className="gradient-text">IntervuAI</span>
          <span style={{ color:'var(--text-secondary)', fontSize:'14px' }}>/ Interview Results</span>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button id="go-dashboard-btn" onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', cursor:'pointer', fontSize:'14px', fontFamily:'Inter,sans-serif' }}>
            <Home size={15} /> Dashboard
          </button>
          <button id="go-history-btn" onClick={() => navigate('/history')} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', cursor:'pointer', fontSize:'14px', fontFamily:'Inter,sans-serif' }}>
            <History size={15} /> History
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'40px 24px' }}>
        {/* Header */}
        <div className="animate-fade-in" style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>{scoreLabel.split(' ')[0]}</div>
          <h1 style={{ fontSize:'32px', fontWeight:'900', marginBottom:'8px' }}>Interview Feedback Report</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'16px' }}>{summary}</p>
        </div>

        {/* Top cards */}
        <div className="animate-fade-in" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'20px', marginBottom:'32px' }}>
          {/* Score */}
          <div className="glass-card" style={{ padding:'28px', textAlign:'center', gridColumn:'1' }}>
            <div style={{ fontSize:'13px', color:'var(--text-secondary)', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'16px' }}>Overall Score</div>
            <ScoreRing score={overallScore} />
            <div style={{ marginTop:'12px', fontSize:'18px', fontWeight:'700', color: scoreColor }}>{scoreLabel.split(' ').slice(1).join(' ')}</div>
          </div>

          {/* Radar */}
          <div className="glass-card" style={{ padding:'28px', gridColumn:'2 / 4' }}>
            <div style={{ fontSize:'13px', color:'var(--text-secondary)', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'16px' }}>Per-Question Scores (first 6)</div>
            <Radar data={radarData} options={{ scales:{ r:{ min:0, max:10, ticks:{ stepSize:2, color:'var(--text-secondary)', backdropColor:'transparent' }, grid:{ color:'rgba(255,255,255,0.1)' }, pointLabels:{ color:'var(--text-secondary)', font:{ size:12 } } } }, plugins:{ legend:{ display:false } } }} />
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="animate-fade-in" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'32px' }}>
          <div className="glass-card" style={{ padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <CheckCircle size={20} style={{ color:'var(--success)' }} />
              <h3 style={{ fontWeight:'700', fontSize:'16px', color:'var(--success)' }}>Strengths</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 14px', background:'rgba(16,185,129,0.08)', borderRadius:'10px' }}>
                  <span style={{ color:'var(--success)', fontWeight:'700', fontSize:'14px', flexShrink:0 }}>✓</span>
                  <span style={{ fontSize:'14px', lineHeight:'1.5' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <AlertTriangle size={20} style={{ color:'var(--warning)' }} />
              <h3 style={{ fontWeight:'700', fontSize:'16px', color:'var(--warning)' }}>Areas to Improve</h3>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {improvements.map((imp, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 14px', background:'rgba(245,158,11,0.08)', borderRadius:'10px' }}>
                  <span style={{ color:'var(--warning)', fontWeight:'700', fontSize:'14px', flexShrink:0 }}>→</span>
                  <span style={{ fontSize:'14px', lineHeight:'1.5' }}>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Questions breakdown */}
        <div className="animate-fade-in">
          <h2 style={{ fontSize:'20px', fontWeight:'800', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px' }}>
            <TrendingUp size={22} style={{ color:'var(--primary)' }} />
            Question-by-Question Breakdown
          </h2>
          {questions.map((qa, i) => (
            <QuestionCard key={i} qa={qa} index={i} />
          ))}
        </div>

        {/* Action buttons */}
        <div className="animate-fade-in" style={{ display:'flex', gap:'14px', marginTop:'32px', justifyContent:'center' }}>
          <button id="practice-again-btn" onClick={() => navigate('/dashboard')} className="btn-primary" style={{ height:'50px', padding:'0 32px', fontSize:'16px' }}>
            <Sparkles size={18} style={{ marginRight:'8px' }} />
            Practice Again
          </button>
          <button id="view-history-btn" onClick={() => navigate('/history')} style={{ height:'50px', padding:'0 32px', borderRadius:'12px', border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', cursor:'pointer', fontSize:'16px', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', gap:'8px' }}>
            <History size={18} />
            View All History
          </button>
        </div>
      </div>
    </div>
  );
}
