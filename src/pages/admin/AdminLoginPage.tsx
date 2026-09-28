import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import {
  ArrowRight,
  Lock,
  Mail,
  AlertTriangle,
  Zap,
  Eye,
  EyeOff,
  Shield,
  Briefcase
} from 'lucide-react';

export const AdminLoginPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('Please provide email and password.');
      error('Please provide email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      success('Logged in successfully!');
      onNavigate('/admin');
    } else {
      setErrorMessage(res.message || 'Authentication failed.');
      error(res.message || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 blur-3xl rounded-full opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 blur-3xl rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-600/10 blur-3xl rounded-full opacity-20" />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full z-10">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 group text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-2xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">ITD Admin Portal</span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            ← Back to Website
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full py-6 z-10 space-y-8">
        {/* Welcome Section - Top */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Welcome to ITD<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Admin Portal</span>
          </h1>
        </div>

        {/* Login Form - Below */}
        <div className="max-w-md mx-auto w-full relative">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-purple-600/20 to-pink-600/40 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-5 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="superadmin@insa.gov.et"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-600 z-10">
        <p>ITD Admin Portal</p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};
