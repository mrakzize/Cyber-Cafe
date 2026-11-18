import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Gamepad2, KeyRound, Lock, Mail } from 'lucide-react';
import { Button } from '@/src/components/ui/Primitives';
import { useCafeStore } from '@/src/store/useCafeStore';

export function AuthScreen() {
  const { login, activeLocation } = useCafeStore();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('youssef@arenapulse.ma');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Architectural Grid Backdrop */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.18), transparent 45%), radial-gradient(circle at 80% 80%, rgba(59,130,246,0.14), transparent 45%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#293548] bg-[#151D2E] p-6 sm:p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/35 flex items-center justify-center text-[#8B5CF6]">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-display font-bold text-[#F8FAFC]">
              Gaming Café Manager
            </h1>
            <p className="text-xs text-[#94A3B8]">{activeLocation.name}</p>
          </div>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <h2 className="text-xl font-display font-bold text-[#F8FAFC]">
                Staff Sign In
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Sign in to open the floor dashboard and manage active stations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#293548] bg-[#0B0F19] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#94A3B8]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setResetSent(false);
                  }}
                  className="text-xs font-medium text-[#8B5CF6] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#293548] bg-[#0B0F19] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#293548] accent-[#8B5CF6]"
              />
              <span>Remember this counter terminal</span>
            </label>

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Sign In to Floor Dashboard
            </Button>

            {/* Quick Role Sign-in Helpers */}
            <div className="pt-4 border-t border-[#293548]">
              <p className="text-[11px] text-[#64748B] mb-2">Quick role demo login:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => login('youssef@arenapulse.ma')}
                  className="px-3 py-2 rounded-xl border border-[#293548] bg-[#1B2638] hover:border-[#8B5CF6]/50 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-[#F8FAFC]">Youssef</p>
                  <p className="text-[11px] text-[#94A3B8]">Owner Access</p>
                </button>
                <button
                  type="button"
                  onClick={() => login('ahmed@arenapulse.ma')}
                  className="px-3 py-2 rounded-xl border border-[#293548] bg-[#1B2638] hover:border-[#3B82F6]/50 text-left transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-[#F8FAFC]">Ahmed</p>
                  <p className="text-[11px] text-[#94A3B8]">Staff Counter</p>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </button>

            <div>
              <h2 className="text-xl font-display font-bold text-[#F8FAFC]">
                Reset Password
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Enter your staff email to receive a reset link from your café owner.
              </p>
            </div>

            {resetSent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Reset instructions sent</p>
                  <p className="mt-0.5 text-emerald-200/80">
                    Check {email} for your password recovery link.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Staff Email
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#293548] bg-[#0B0F19] text-sm text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Send Reset Link
                </Button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
