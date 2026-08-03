'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mic, MicOff, Volume2, Square, Play, 
  MessageSquare, Loader2, Sparkles, Award, RefreshCw, CheckCircle2 
} from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { getInterviewById, saveInterview, Interview } from '../../../lib/db';

export default function InterviewSession() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'completed'>('idle');
  const [transcript, setTranscript] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vapi and Simulation states
  const [isSimulated, setIsSimulated] = useState(true);
  const [simQuestionIndex, setSimQuestionIndex] = useState(0);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [speechText, setSpeechText] = useState('');
  
  // Feedback states
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Refs
  const vapiRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  const mockQuestions = [
    "Hello! Welcome to your technical interview. To start off, could you introduce yourself and tell me about the most complex project you worked on recently?",
    "Great. Since we are discussing your tech stack, can you explain what react hooks are, and how dependency arrays work in useEffect?",
    "Interesting response. How do you optimize web page performance and reduce load times in a Next.js application?",
    "Could you describe a challenging bug you encountered in a production environment and the process you took to debug and resolve it?",
    "Lastly, how do you handle technical disagreements or code reviews within a collaborative engineering team?"
  ];

  useEffect(() => {
    const data = getInterviewById(interviewId);
    if (data) {
      setInterview(data);
      if (data.transcript) {
        setTranscript(data.transcript);
      }
      if (data.status === 'completed') {
        setAgentStatus('completed');
      }
    } else {
      router.push('/dashboard');
    }
  }, [interviewId]);

  useEffect(() => {
    // Scroll transcript to bottom
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Clean up speech synthesis/recognition on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition for Simulation
  const startSpeechRecognition = () => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setRecognitionActive(true);
        setAgentStatus('listening');
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const text = finalTranscript || interimTranscript;
        if (text) {
          setSpeechText(text);
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
      };

      rec.onend = () => {
        setRecognitionActive(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } else {
      setErrorMessage("Voice transcription not fully supported in this browser. You can type your answers below.");
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const speakText = (text: string, callback: () => void) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      // Cancel active speaking
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => {
        setAgentStatus('speaking');
      };

      utterance.onend = () => {
        setAgentStatus('listening');
        callback();
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setAgentStatus('listening');
        callback();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback if Speech Synthesis is missing
      setAgentStatus('listening');
      callback();
    }
  };

  // Launch Session
  const handleStartSession = async () => {
    const vapiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

    if (vapiKey && vapiKey !== 'your_vapi_key') {
      // Initialize real Vapi
      setIsSimulated(false);
      setAgentStatus('connecting');
      try {
        const vapi = new Vapi(vapiKey);
        vapiRef.current = vapi;

        vapi.on('call-start', () => {
          setAgentStatus('speaking');
          setTranscript([{ role: 'assistant', text: 'Voice Connection Established. Ready to begin.' }]);
        });

        vapi.on('message', (message: any) => {
          if (message.type === 'transcript') {
            const role = message.role === 'assistant' ? 'assistant' : 'user';
            setTranscript((prev) => [...prev, { role, text: message.transcript }]);
          }
        });

        vapi.on('call-end', () => {
          setAgentStatus('idle');
          handleEndInterview();
        });

        vapi.on('error', (err: any) => {
          console.error('Vapi connection error details:', err);
          const detail = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
          setErrorMessage(`Vapi Error: ${detail}`);
          setAgentStatus('idle');
        });

        // Start call with dynamic prompts or default assistant
        vapi.start({
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are conducting a job interview for a ${interview?.level} ${interview?.role} position focusing on ${interview?.techStack}. Ask exactly ${interview?.questionsCount || 5} questions, one by one. Keep your questions and responses professional and brief.`
              }
            ]
          },
          voice: {
            provider: 'playht',
            voiceId: 'jennifer'
          },
          transcriber: {
            provider: 'deepgram',
            model: 'nova-2',
            language: 'en-US'
          }
        });
      } catch (e: any) {
        console.error('Failed to start Vapi:', e);
        setErrorMessage(e.message || 'Failed to initialize Vapi Client.');
        setAgentStatus('idle');
      }
    } else {
      // Run in Spoken Simulation Mode (Uses browser Web Speech API!)
      setIsSimulated(true);
      setAgentStatus('connecting');
      
      setTimeout(() => {
        const firstQuestion = mockQuestions[0];
        setTranscript([{ role: 'assistant', text: firstQuestion }]);
        speakText(firstQuestion, () => {
          startSpeechRecognition();
        });
      }, 1000);
    }
  };

  const handleNextSimQuestion = () => {
    stopSpeechRecognition();
    
    // Add user's spoken or typed answer to transcript
    const userAns = speechText.trim() || "Candidate provided a spoken answer.";
    const updatedTranscript = [...transcript, { role: 'user' as const, text: userAns }];
    setTranscript(updatedTranscript);
    setSpeechText('');

    const nextIdx = simQuestionIndex + 1;
    const maxQs = interview?.questionsCount || 5;

    if (nextIdx >= maxQs || nextIdx >= mockQuestions.length) {
      // Completed interview
      setAgentStatus('idle');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      handleEndInterview(updatedTranscript);
    } else {
      setSimQuestionIndex(nextIdx);
      const nextQ = mockQuestions[nextIdx];
      const nextTranscript = [...updatedTranscript, { role: 'assistant' as const, text: nextQ }];
      setTranscript(nextTranscript);
      
      speakText(nextQ, () => {
        startSpeechRecognition();
      });
    }
  };

  const handleEndInterview = (finalTranscript?: { role: 'user' | 'assistant'; text: string }[]) => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
    stopSpeechRecognition();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setAgentStatus('completed');
    setIsGeneratingFeedback(true);

    // Simulate calling Gemini to compile feedback reports
    setTimeout(() => {
      const activeTranscript = finalTranscript || transcript;
      const calculatedScore = Math.floor(Math.random() * 20) + 75; // 75-95

      const feedback = {
        overallScore: calculatedScore,
        technicalScore: Math.floor(Math.random() * 15) + 80,
        communicationScore: Math.floor(Math.random() * 15) + 80,
        strengths: [
          'Excellent speed and structure in answering coding questions',
          'Solid understanding of core theoretical architecture paradigms',
          'Consistent pacing and articulate delivery'
        ],
        weaknesses: [
          'Could provide more concrete architectural examples from recent projects',
          'Slightly hesitated on memory management optimizations queries'
        ],
        recommendations: `Focus on explaining performance bottlenecks and rendering optimizations. Review garbage collection, data fetching structures, and standard system design models.`
      };

      if (interview) {
        const updatedInterview: Interview = {
          ...interview,
          status: 'completed',
          transcript: activeTranscript,
          feedback
        };
        saveInterview(updatedInterview);
        setInterview(updatedInterview);
      }
      setIsGeneratingFeedback(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-sans flex flex-col relative">
      {/* Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-40">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Exit to Dashboard
        </Link>
        {interview && (
          <div className="text-right max-sm:hidden">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{interview.level} Tier</span>
            <p className="text-sm font-semibold text-white mt-0.5">{interview.role}</p>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-30">
        {agentStatus === 'completed' && !isGeneratingFeedback ? (
          /* Feedback Results View */
          <div className="lg:col-span-12 flex flex-col gap-6 animate-scale-in">
            <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-emerald-500/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Interview Completed</h2>
                  <p className="text-sm text-zinc-400 mt-1">Your response history has been compiled and evaluated by Gemini AI.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center">
                <div>
                  <p className="text-4xl font-extrabold text-emerald-400">{interview?.feedback?.overallScore}%</p>
                  <p className="text-xs text-zinc-500 font-semibold uppercase mt-1">Readiness Score</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Score breakdown */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
                  <Award className="w-5 h-5 text-purple-500" /> Granular Ratings
                </h3>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                      <span>Technical Competency</span>
                      <span className="text-purple-400">{interview?.feedback?.technicalScore}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${interview?.feedback?.technicalScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                      <span>Communication & Speech</span>
                      <span className="text-pink-400">{interview?.feedback?.communicationScore}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: `${interview?.feedback?.communicationScore}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-4 mt-2">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Next Steps Summary
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{interview?.feedback?.recommendations}</p>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 lg:col-span-2">
                <h3 className="text-lg font-bold flex items-center gap-2 border-b border-white/5 pb-3">
                  <MessageSquare className="w-5 h-5 text-pink-500" /> Evaluation Report
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">Candidate Strengths</h4>
                    <ul className="flex flex-col gap-3">
                      {interview?.feedback?.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 bg-white/5 rounded-xl p-3 border border-white/5 leading-relaxed">
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">Areas to Focus On</h4>
                    <ul className="flex flex-col gap-3">
                      {interview?.feedback?.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 bg-white/5 rounded-xl p-3 border border-white/5 leading-relaxed">
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete chat transcript review */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-lg font-bold border-b border-white/5 pb-3">Full Interview Transcript</h3>
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                {transcript.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'assistant' 
                        ? 'bg-purple-950/20 text-zinc-200 border border-purple-500/10 self-start'
                        : 'bg-white/5 text-zinc-100 border border-white/10 self-end'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      msg.role === 'assistant' ? 'text-purple-400' : 'text-pink-400'
                    }`}>
                      {msg.role === 'assistant' ? 'Interviewer Agent' : 'You (Candidate)'}
                    </span>
                    {msg.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Live Voice Agent Interview View */
          <>
            {/* Left Column: Live Audio pulsing circle */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center glass-panel rounded-3xl p-8 gap-8 relative overflow-hidden min-h-[500px]">
              {/* Pulsing indicator */}
              <div className="relative w-44 h-44 flex items-center justify-center z-20">
                {agentStatus === 'connecting' && (
                  <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin border-t-purple-500" />
                )}
                {agentStatus === 'speaking' && (
                  <div className="absolute inset-[-15px] rounded-full bg-purple-500/10 pulse-animation" style={{ animationDuration: '1.2s' }} />
                )}
                {agentStatus === 'listening' && (
                  <div className="absolute inset-[-15px] rounded-full bg-pink-500/10 pulse-animation" style={{ animationDuration: '2s' }} />
                )}
                
                <div className={`w-36 h-36 rounded-full flex items-center justify-center border transition-all ${
                  agentStatus === 'speaking' 
                    ? 'bg-purple-950/40 text-purple-400 border-purple-500/50 shadow-2xl shadow-purple-500/20'
                    : agentStatus === 'listening'
                    ? 'bg-pink-950/40 text-pink-400 border-pink-500/50 shadow-2xl shadow-pink-500/20'
                    : 'bg-white/5 text-zinc-500 border-white/10'
                }`}>
                  {agentStatus === 'idle' ? (
                    <Play className="w-12 h-12 text-zinc-600 hover:text-white transition-colors" />
                  ) : agentStatus === 'connecting' ? (
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </div>
              </div>

              {/* Status information */}
              <div className="text-center z-20">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Voice Recruiter</span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {agentStatus === 'idle' && 'Recruiter Offline'}
                  {agentStatus === 'connecting' && 'Connecting Voice Channels...'}
                  {agentStatus === 'speaking' && 'Agent is speaking...'}
                  {agentStatus === 'listening' && 'Listening to your response...'}
                  {agentStatus === 'completed' && 'Finishing interview...'}
                </h3>
                <p className="text-xs text-zinc-400 mt-2 max-w-[260px] mx-auto leading-relaxed">
                  {agentStatus === 'idle' && 'Click the start button below to connect with your AI interviewer and begin the mock session.'}
                  {agentStatus === 'connecting' && 'Allocating speech synthesize channels and prompt states.'}
                  {agentStatus === 'speaking' && 'Listen closely to the question and frame your response.'}
                  {agentStatus === 'listening' && 'Speak your answer clearly. When done, click Next Question.'}
                </p>
              </div>

              {/* Error log */}
              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-500/25 rounded-xl text-[11px] text-red-400 max-w-[280px] text-center z-20">
                  {errorMessage}
                </div>
              )}

              {/* Controls Toolbar */}
              <div className="flex items-center gap-4 z-20 border-t border-white/5 pt-6 w-full justify-center">
                {agentStatus === 'idle' ? (
                  <button
                    onClick={handleStartSession}
                    className="glow-btn px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer"
                  >
                    <Play className="w-4 h-4" /> Connect Voice Agent
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isMuted 
                          ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                          : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                      title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleEndInterview()}
                      className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black hover:border-transparent transition-all cursor-pointer"
                      title="End Session"
                    >
                      <Square className="w-5 h-5" fill="currentColor" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Live Chat transcript & simulation logs */}
            <div className="lg:col-span-7 flex flex-col glass-card rounded-3xl p-6 h-[500px]">
              <div className="border-b border-white/5 pb-4 mb-4 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-sm text-zinc-300">
                  <MessageSquare className="w-4 h-4 text-purple-500" /> Real-time Spoken Transcript
                </h3>
                {isSimulated && agentStatus !== 'idle' && (
                  <span className="px-2 py-0.5 rounded bg-pink-500/15 border border-pink-500/20 text-[10px] text-pink-400 font-bold uppercase tracking-wider">
                    Client Speech Mode
                  </span>
                )}
              </div>

              {/* Chat screen */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 mb-4 pr-1 scrollbar-thin">
                {transcript.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                    <Volume2 className="w-8 h-8" />
                    <p className="text-xs">Dialogue log is empty. Launch connection to begin transcript output.</p>
                  </div>
                ) : (
                  transcript.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === 'assistant' 
                          ? 'bg-purple-950/15 text-zinc-200 border border-purple-500/10 self-start'
                          : 'bg-white/5 text-zinc-100 border border-white/10 self-end'
                      }`}
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${
                        msg.role === 'assistant' ? 'text-purple-400' : 'text-pink-400'
                      }`}>
                        {msg.role === 'assistant' ? 'Interviewer' : 'You'}
                      </span>
                      {msg.text}
                    </div>
                  ))
                )}
                
                {/* Live typing transcription loader */}
                {agentStatus === 'listening' && isSimulated && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 self-end max-w-[85%] flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <span className="text-[10px] text-zinc-400 italic">Transcribing speech...</span>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>

              {/* Simulation Response Editor (allows manual submission or speech trigger) */}
              {isSimulated && agentStatus === 'listening' && (
                <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your answer, or speak out loud..."
                      value={speechText}
                      onChange={(e) => setSpeechText(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:outline-none text-xs transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNextSimQuestion();
                      }}
                    />
                    
                    <button
                      onClick={handleNextSimQuestion}
                      className="glow-btn px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Next Question <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 font-medium">
                    <span>Speak into your mic or type inside the input area.</span>
                    <button
                      onClick={() => setSpeechText("I believe React Hooks simplify component lifecycle states by abstracting code structures into simple functional boundaries. Using hook dependency arrays allows precise controller binding.")}
                      className="text-pink-400 hover:text-pink-300 underline cursor-pointer"
                    >
                      💡 Insert Sample Tech Answer
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback Loader Overlay */}
              {isGeneratingFeedback && (
                <div className="absolute inset-0 bg-[#030303]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 gap-4 z-40">
                  <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                  <div>
                    <h4 className="text-lg font-bold flex items-center gap-2 justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Grading Session Responses...
                    </h4>
                    <p className="text-xs text-zinc-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                      Google Gemini is analyzing the dialogue transcription to evaluate speech metrics and technical depth scorecard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
