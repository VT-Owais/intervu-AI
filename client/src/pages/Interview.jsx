import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, ChevronRight, Clock, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const QUESTION_TIME = 90; // 90 seconds per question

export default function Interview() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [submitting, setSubmitting] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [startTime] = useState(Date.now());
  const [phase, setPhase] = useState('setup'); // setup | interview | done
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const qs = sessionStorage.getItem('interview_questions');
    if (!qs) { navigate('/dashboard'); return; }
    setQuestions(JSON.parse(qs));
    setAnswers(new Array(JSON.parse(qs).length).fill(''));

    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (phase !== 'interview') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleNextQuestion(); return QUESTION_TIME; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, currentQ]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
  }, [currentQ]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      toast.error('Camera access denied. You can continue without it.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported in this browser'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
        else interim += event.results[i][0].transcript;
      }
      if (final) setCurrentAnswer(prev => prev + final);
      setInterimText(interim);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'aborted') toast.error('Speech recognition error: ' + e.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText('');
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText('');
  };

  const handleNextQuestion = useCallback(() => {
    if (listening) stopListening();
    const finalAnswer = currentAnswer.trim() || '(No answer provided)';
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentQ] = finalAnswer;
      return updated;
    });
    setCurrentAnswer('');
    setInterimText('');

    if (currentQ + 1 >= questions.length) {
      setPhase('done');
      stopCamera();
    } else {
      setCurrentQ(p => p + 1);
    }
  }, [currentQ, currentAnswer, listening, questions.length]);

  const submitInterview = async () => {
    setSubmitting(true);
    const resumeText = sessionStorage.getItem('interview_resume') || '';
    const topics = sessionStorage.getItem('interview_topics') || '';
    const duration = Math.round((Date.now() - startTime) / 1000);

    const questionsAndAnswers = questions.map((q, i) => ({
      question: q,
      answer: answers[i] || '(No answer provided)'
    }));

    try {
      toast.loading('AI is evaluating your answers... This may take 30-60 seconds ⏳', { id: 'eval' });
      const { data } = await api.post('/interview/evaluate', {
        questionsAndAnswers, resumeText, topics, duration
      });
      toast.success('Evaluation complete!', { id: 'eval' });
      sessionStorage.setItem('interview_result', JSON.stringify(data));
      sessionStorage.removeItem('interview_questions');
      sessionStorage.removeItem('interview_resume');
      sessionStorage.removeItem('interview_topics');
      navigate('/results');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Evaluation failed. Please try again.', { id: 'eval' });
      setSubmitting(false);
    }
  };

  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 30 ? '#10b981' : timeLeft > 10 ? '#f59e0b' : '#ef4444';

  if (!questions.length) return null;

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-card animate-fade-in" style={{ maxWidth:'560px', width:'100%', padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'56px', marginBottom:'16px' }}>🎯</div>
          <h1 style={{ fontSize:'26px', fontWeight:'800', marginBottom:'8px' }}>Interview Ready!</h1>
          <p style={{ color:'var(--text-secondary)', marginBottom:'32px', lineHeight:'1.6' }}>
            You have <strong style={{ color:'var(--primary)' }}>15 questions</strong>. Answer each by voice or typing.<br />
            You have <strong style={{ color:'var(--primary)' }}>{QUESTION_TIME} seconds</strong> per question.
          </p>

          {/* Camera preview */}
          <div style={{ marginBottom:'24px', background:'rgba(0,0,0,0.3)', borderRadius:'16px', overflow:'hidden', height:'200px', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', display: cameraOn ? 'block' : 'none' }} />
            {!cameraOn && (
              <div style={{ textAlign:'center', color:'var(--text-secondary)' }}>
                <VideoOff size={32} style={{ marginBottom:'8px', opacity:0.5 }} />
                <p style={{ fontSize:'14px' }}>Camera off</p>
              </div>
            )}
          </div>

          <div style={{ display:'flex', gap:'12px', marginBottom:'28px', justifyContent:'center' }}>
            <button id="toggle-camera-setup" onClick={cameraOn ? stopCamera : startCamera} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px', borderRadius:'10px', border:'1px solid var(--border)', background:'rgba(255,255,255,0.05)', color:'var(--text-primary)', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'14px' }}>
              {cameraOn ? <><VideoOff size={16} /> Turn Off Camera</> : <><Video size={16} /> Enable Camera</>}
            </button>
          </div>

          {!speechSupported && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', textAlign:'left' }}>
              <AlertCircle size={18} style={{ color:'#f59e0b', flexShrink:0 }} />
              <p style={{ fontSize:'13px', color:'#f59e0b' }}>Speech recognition not supported. Use Chrome for voice input, or type your answers.</p>
            </div>
          )}

          <button id="begin-interview-btn" onClick={() => setPhase('interview')} className="btn-primary" style={{ width:'100%', height:'52px', fontSize:'17px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
            <Sparkles size={20} /> Begin Interview <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Done phase
  if (phase === 'done') {
    return (
      <div className="mesh-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-card animate-fade-in" style={{ maxWidth:'560px', width:'100%', padding:'40px', textAlign:'center' }}>
          <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
          <h1 style={{ fontSize:'28px', fontWeight:'800', marginBottom:'8px' }}>Interview Complete!</h1>
          <p style={{ color:'var(--text-secondary)', marginBottom:'32px' }}>All 15 questions answered. Ready to get your AI evaluation?</p>

          {/* Quick answer summary */}
          <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'12px', padding:'16px', marginBottom:'28px', textAlign:'left', maxHeight:'200px', overflowY:'auto' }}>
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom:'12px', padding:'10px', background:'rgba(99,102,241,0.08)', borderRadius:'8px', borderLeft:'3px solid var(--primary)' }}>
                <div style={{ fontSize:'12px', color:'var(--primary)', fontWeight:'600', marginBottom:'4px' }}>Q{i+1}</div>
                <div style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'6px' }}>{q}</div>
                <div style={{ fontSize:'13px', color:'var(--text-primary)', fontStyle: answers[i] === '(No answer provided)' ? 'italic' : 'normal', opacity: answers[i] === '(No answer provided)' ? 0.5 : 1 }}>{answers[i]}</div>
              </div>
            ))}
          </div>

          <button id="submit-for-evaluation-btn" onClick={submitInterview} disabled={submitting} className="btn-primary" style={{ width:'100%', height:'52px', fontSize:'17px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
            {submitting ? (
              <>
                <span style={{ width:'20px', height:'20px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin-slow 0.8s linear infinite' }} />
                AI Evaluating... Please wait
              </>
            ) : (
              <><Sparkles size={20} /> Get AI Feedback</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Interview phase
  return (
    <div className="mesh-bg min-h-screen flex flex-col" style={{ minHeight:'100vh' }}>
      {/* Top bar */}
      <div style={{ padding:'14px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(10,10,15,0.8)', backdropFilter:'blur(20px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Sparkles size={18} style={{ color:'var(--primary)' }} />
          <span style={{ fontWeight:'700' }} className="gradient-text">IntervuAI</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          {/* Progress */}
          <span style={{ color:'var(--text-secondary)', fontSize:'14px' }}>Question {currentQ + 1} of {questions.length}</span>
          {/* Timer */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'10px', padding:'8px 14px' }}>
            <Clock size={16} style={{ color: timerColor }} />
            <span style={{ fontWeight:'700', fontSize:'16px', color: timerColor, fontVariantNumeric:'tabular-nums' }}>
              {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height:'4px', background:'rgba(255,255,255,0.1)' }}>
        <div style={{ height:'100%', background:'linear-gradient(90deg, var(--primary), var(--secondary))', width:`${((currentQ) / questions.length) * 100}%`, transition:'width 0.5s ease' }} />
      </div>

      {/* Timer bar */}
      <div style={{ height:'3px', background:'rgba(255,255,255,0.05)' }}>
        <div style={{ height:'100%', background: timerColor, width:`${timerPct}%`, transition:'width 1s linear' }} />
      </div>

      <div style={{ flex:1, display:'flex', gap:'24px', padding:'24px', maxWidth:'1100px', margin:'0 auto', width:'100%' }}>
        
        {/* Left: Camera */}
        <div style={{ width:'280px', flexShrink:0 }}>
          <div style={{ background:'rgba(0,0,0,0.4)', borderRadius:'16px', overflow:'hidden', height:'200px', position:'relative', marginBottom:'12px', border:'1px solid var(--border)' }}>
            <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', height:'100%', objectFit:'cover', display: cameraOn ? 'block' : 'none' }} />
            {!cameraOn && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-secondary)' }}>
                <VideoOff size={28} style={{ marginBottom:'8px', opacity:0.4 }} />
                <span style={{ fontSize:'13px', opacity:0.6 }}>Camera off</span>
              </div>
            )}
            {listening && cameraOn && (
              <div style={{ position:'absolute', bottom:'10px', left:'10px', display:'flex', alignItems:'center', gap:'6px', background:'rgba(239,68,68,0.9)', borderRadius:'20px', padding:'4px 10px' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'white', animation:'pulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize:'11px', color:'white', fontWeight:'600' }}>LIVE</span>
              </div>
            )}
          </div>

          {/* Camera + Mic toggles */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
            <button id="toggle-camera-interview" onClick={cameraOn ? stopCamera : startCamera} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', borderRadius:'10px', border:`1px solid ${cameraOn ? 'var(--primary)' : 'var(--border)'}`, background: cameraOn ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', color: cameraOn ? 'var(--primary)' : 'var(--text-secondary)', cursor:'pointer', fontSize:'13px', fontFamily:'Inter,sans-serif' }}>
              {cameraOn ? <Video size={16} /> : <VideoOff size={16} />}
              {cameraOn ? 'On' : 'Off'}
            </button>
            <button id="toggle-mic-btn" onClick={listening ? stopListening : startListening} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', padding:'10px', borderRadius:'10px', border:`1px solid ${listening ? '#ef4444' : 'var(--border)'}`, background: listening ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', color: listening ? '#ef4444' : 'var(--text-secondary)', cursor:'pointer', fontSize:'13px', fontFamily:'Inter,sans-serif', ...(listening ? { animation:'recording-pulse 1.5s ease-in-out infinite' } : {}) }}>
              {listening ? <Mic size={16} /> : <MicOff size={16} />}
              {listening ? 'Stop' : 'Speak'}
            </button>
          </div>

          {/* Question list mini nav */}
          <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'12px', padding:'12px' }}>
            <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginBottom:'10px', fontWeight:'600' }}>QUESTIONS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'4px' }}>
              {questions.map((_, i) => (
                <div key={i} style={{ aspectRatio:'1', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'600', background: i < currentQ ? 'rgba(16,185,129,0.3)' : i === currentQ ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: i <= currentQ ? 'white' : 'var(--text-secondary)', border: i === currentQ ? '2px solid var(--primary)' : 'none' }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Question + Answer */}
        <div style={{ flex:1 }}>
          {/* Question */}
          <div className="glass-card" style={{ padding:'28px', marginBottom:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
              <div style={{ background:'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius:'8px', padding:'6px 12px', fontSize:'13px', fontWeight:'700', color:'white' }}>Q{currentQ + 1}</div>
              <span style={{ color:'var(--text-secondary)', fontSize:'13px' }}>Interview Question</span>
            </div>
            <p style={{ fontSize:'20px', fontWeight:'600', lineHeight:'1.5', color:'var(--text-primary)' }}>{questions[currentQ]}</p>
          </div>

          {/* Answer textarea */}
          <div className="glass-card" style={{ padding:'24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
              <label style={{ fontSize:'14px', fontWeight:'600', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'8px' }}>
                {listening ? <><Mic size={16} style={{ color:'#ef4444' }} /> Listening… speak now</> : <><Mic size={16} /> Your Answer</>}
              </label>
              <span style={{ fontSize:'12px', color:'var(--text-secondary)' }}>{currentAnswer.length} chars</span>
            </div>
            <textarea
              id="answer-textarea"
              value={currentAnswer + interimText}
              onChange={e => { setCurrentAnswer(e.target.value); setInterimText(''); }}
              placeholder="Speak your answer (click 'Speak' to start) or type here…"
              className="input-field"
              rows={7}
              style={{ resize:'none', lineHeight:'1.7', fontSize:'15px', opacity: listening && currentAnswer.length === 0 && interimText.length === 0 ? 0.5 : 1 }}
            />
            {interimText && (
              <div style={{ fontSize:'13px', color:'var(--text-secondary)', fontStyle:'italic', marginTop:'8px', padding:'8px 12px', background:'rgba(99,102,241,0.08)', borderRadius:'8px' }}>
                🎤 {interimText}
              </div>
            )}

            <div style={{ display:'flex', gap:'12px', marginTop:'16px' }}>
              {currentQ < questions.length - 1 ? (
                <button id="next-question-btn" onClick={handleNextQuestion} className="btn-primary" style={{ flex:1, height:'48px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  Next Question <ChevronRight size={18} />
                </button>
              ) : (
                <button id="finish-interview-btn" onClick={handleNextQuestion} className="btn-primary" style={{ flex:1, height:'48px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  Finish Interview ✅
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
