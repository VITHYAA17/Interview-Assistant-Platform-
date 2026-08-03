'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Calendar, Award, Star, BookOpen, Trash2, 
  ChevronRight, Mic, User, LogOut, ArrowLeft, Loader2, Sparkles, Bot
} from 'lucide-react';
import { 
  getInterviews, saveInterview, deleteInterview, 
  getLoggedInUser, setLoggedInUser, Interview, UserProfile 
} from '../../lib/db';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Form states
  const [role, setRole] = useState('');
  const [level, setLevel] = useState('Mid-Level');
  const [techStack, setTechStack] = useState('');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUser(getLoggedInUser());
    setInterviews(getInterviews());
  }, []);

  const handleLogout = () => {
    setLoggedInUser(null);
    router.push('/');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this interview record?')) {
      deleteInterview(id);
      setInterviews(getInterviews());
      if (selectedInterview?.id === id) {
        setSelectedInterview(null);
      }
    }
  };

  const handleCreateInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !techStack) return;

    setIsSubmitting(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const newId = `int-${Math.random().toString(36).substring(2, 11)}`;
      const newInterview: Interview = {
        id: newId,
        role,
        level,
        techStack,
        questionsCount,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      saveInterview(newInterview);
      setIsSubmitting(false);
      setShowNewModal(false);
      router.push(`/interview/${newId}`);
    }, 1500);
  };

  // Calculate statistics
  const completedInts = interviews.filter(i => i.status === 'completed');
  const averageScore = completedInts.length > 0 
    ? Math.round(completedInts.reduce((acc, i) => acc + (i.feedback?.overallScore || 0), 0) / completedInts.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] font-sans flex flex-col relative">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-40">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            PrepWise<span className="text-purple-500">.AI</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
              <div className="text-left max-sm:hidden">
                <p className="text-xs font-semibold text-zinc-400">Recruiter sandbox</p>
                <p className="text-sm font-medium text-white">{user.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-30">
        
        {/* Left Column: List & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/25">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Average Score</p>
                <p className="text-2xl font-bold text-white">{averageScore ? `${averageScore}%` : 'N/A'}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/25">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Practice</p>
                <p className="text-2xl font-bold text-white">{interviews.length} sessions</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/25">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</p>
                <p className="text-lg font-bold text-emerald-400">Agent Connected</p>
              </div>
            </div>
          </div>

          {/* Sessions List Header */}
          <div className="flex items-center justify-between mt-4">
            <h2 className="text-xl font-bold tracking-tight">Interview History</h2>
            <button
              onClick={() => setShowNewModal(true)}
              className="glow-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Start Interview
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex flex-col gap-4">
            {interviews.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center gap-4">
                <Bot className="w-12 h-12 text-zinc-600 animate-pulse" />
                <div>
                  <h3 className="text-lg font-semibold">No interviews yet</h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm">Create your first mock interview configuration to begin practicing with the voice recruiter.</p>
                </div>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-semibold transition-all"
                >
                  Configure Session
                </button>
              </div>
            ) : (
              interviews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedInterview(item)}
                  className={`glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer relative overflow-hidden group ${
                    selectedInterview?.id === item.id ? 'border-purple-500 bg-purple-950/5' : ''
                  }`}
                >
                  <div className="flex-1 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm ${
                      item.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                    }`}>
                      {item.status === 'completed' ? (item.feedback?.overallScore || 'A') : '...'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{item.role}</h4>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-zinc-400 border border-white/5 font-semibold">
                          {item.level}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Tech stack: {item.techStack}</p>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 mt-2 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{item.questionsCount} questions requested</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {item.status === 'pending' ? (
                      <Link
                        href={`/interview/${item.id}`}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Resume Voice <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-zinc-500 text-xs font-semibold max-sm:hidden">View Feedback</span>
                    )}
                    
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Feedback Details */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 sticky top-8 flex flex-col gap-6 min-h-[400px]">
            {selectedInterview ? (
              <>
                <div className="border-b border-white/5 pb-4">
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">{selectedInterview.level} Interview</span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedInterview.role}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Checked on {new Date(selectedInterview.createdAt).toLocaleDateString()}</p>
                </div>

                {selectedInterview.status === 'pending' ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-4">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    <div>
                      <p className="font-semibold">Interview Incomplete</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">You started this mock interview configuration but haven't finished speaking with the agent.</p>
                    </div>
                    <Link
                      href={`/interview/${selectedInterview.id}`}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-all flex items-center gap-1.5"
                    >
                      Resume Interview <Mic className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Score distribution */}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Rating Scorecard</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-2xl font-extrabold text-white">{selectedInterview.feedback?.overallScore}%</p>
                          <p className="text-[10px] text-zinc-500 font-medium uppercase mt-1">Overall</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-2xl font-extrabold text-purple-400">{selectedInterview.feedback?.technicalScore}%</p>
                          <p className="text-[10px] text-zinc-500 font-medium uppercase mt-1">Technical</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-2xl font-extrabold text-pink-400">{selectedInterview.feedback?.communicationScore}%</p>
                          <p className="text-[10px] text-zinc-500 font-medium uppercase mt-1">Speech</p>
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Key Strengths</h4>
                      <ul className="flex flex-col gap-1.5">
                        {selectedInterview.feedback?.strengths.map((str, idx) => (
                          <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedInterview.feedback?.weaknesses && selectedInterview.feedback.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Areas of Improvement</h4>
                        <ul className="flex flex-col gap-1.5">
                          {selectedInterview.feedback.weaknesses.map((weak, idx) => (
                            <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              {weak}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedInterview.feedback?.recommendations && (
                      <div className="bg-purple-950/20 border border-purple-500/10 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Next Steps Recommendation
                        </h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">{selectedInterview.feedback.recommendations}</p>
                      </div>
                    )}

                    {/* Transcript CTA */}
                    <Link
                      href={`/interview/${selectedInterview.id}`}
                      className="w-full text-center px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all text-xs font-bold"
                    >
                      Inspect Chat Transcript
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-zinc-500 gap-3">
                <Award className="w-10 h-10 text-zinc-700" />
                <div>
                  <p className="font-semibold text-sm">Select an interview</p>
                  <p className="text-xs max-w-[200px] mt-1">Select an interview card from the list to display details, scorecard ratings, and feedback recommendations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Start Interview Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-8 relative overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Glows */}
            <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-purple-900/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-500 animate-pulse" /> Configure Interview Agent
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="text-zinc-400 hover:text-white transition-colors text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Job Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Frontend Engineer, Node Backend Architect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Seniority Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0b0b10] border border-white/10 focus:border-purple-500 focus:outline-none text-sm transition-colors text-white"
                  >
                    <option value="Intern">Intern</option>
                    <option value="Junior">Junior Developer</option>
                    <option value="Mid-Level">Mid-Level Engineer</option>
                    <option value="Senior">Senior Developer</option>
                    <option value="Lead / Staff">Lead / Staff Architect</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Question Count</label>
                  <select
                    value={questionsCount}
                    onChange={(e) => setQuestionsCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-[#0b0b10] border border-white/10 focus:border-purple-500 focus:outline-none text-sm transition-colors text-white"
                  >
                    <option value="3">3 Questions (Speedrun)</option>
                    <option value="5">5 Questions (Standard)</option>
                    <option value="8">8 Questions (Detailed)</option>
                    <option value="12">12 Questions (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tech Stack & Frameworks</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Next.js, Redux, Tailwind (comma separated)"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full glow-btn mt-4 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/10 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Structuring Interview Prompts...
                  </>
                ) : (
                  <>
                    Launch Voice Agent <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
