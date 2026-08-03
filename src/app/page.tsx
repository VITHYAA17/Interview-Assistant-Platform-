'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Bot, Sparkles, TrendingUp, ShieldCheck, ArrowRight, User, Globe } from 'lucide-react';
import { getLoggedInUser, setLoggedInUser, MOCK_USERS, UserProfile } from '../lib/db';

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    setCurrentUser(getLoggedInUser());
  }, []);

  const handleUserChange = (user: UserProfile) => {
    setLoggedInUser(user);
    setCurrentUser(user);
    setShowUserDropdown(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#f4f4f5] relative overflow-hidden flex flex-col font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Mic className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            PrepWise<span className="text-purple-500">.AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 relative">
          {currentUser && (
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/40 hover:bg-white/10 transition-all text-sm font-medium"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-white/20"
              />
              <span className="max-sm:hidden">{currentUser.name}</span>
            </button>
          )}

          {showUserDropdown && (
            <div className="absolute right-0 top-12 w-56 glass-panel rounded-xl py-2 shadow-2xl z-50 flex flex-col">
              <span className="px-4 py-1 text-xs text-zinc-500 font-semibold uppercase tracking-wider">Switch Profile</span>
              {MOCK_USERS.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleUserChange(user)}
                  className={`w-full text-left px-4 py-2 hover:bg-white/5 flex items-center gap-3 transition-colors ${
                    currentUser?.uid === user.uid ? 'bg-purple-950/20 border-l-2 border-purple-500' : ''
                  }`}
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/15"
                  />
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <Link
            href="/dashboard"
            className="glow-btn px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-medium text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25"
          >
            Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center text-center justify-center relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Conversational Interviews
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Practice Job Interviews with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-amber-400">
            Real-Time AI Voice Agents
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Select your tech stack, initiate a natural conversation with an AI recruiter, and receive instant granular feedback on your communication and technical skills.
        </p>

        <div className="flex flex-wrap gap-4 justify-center items-center mb-16">
          <Link
            href="/dashboard"
            className="glow-btn px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-lg font-semibold tracking-wide transition-all shadow-xl shadow-purple-500/15 flex items-center gap-2 hover:scale-[1.02]"
          >
            Start Free Mock Interview <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8 text-left relative">
          <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/25">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Vapi AI Voice Agents</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Engage in fluent, zero-latency spoken dialogue. The voice assistant reacts to your verbal pauses, pacing, and answers like a real human interviewer.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 border border-pink-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Google Gemini Generative AI</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Receive smart, contextually accurate interview questions customized dynamically for your specific seniority tier, role description, and tech stack.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/25">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Granular Metrics & Analytics</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Get an overall readiness rating alongside scores for speech delivery, technical depth, and specific items of strength and improvement.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/5 text-center text-sm text-zinc-500 relative z-30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} PrepWise.AI. All rights reserved.</span>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-purple-500" /> Secure Sandbox</span>
          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-pink-500" /> Real-time Speech API</span>
        </div>
      </footer>
    </div>
  );
}
