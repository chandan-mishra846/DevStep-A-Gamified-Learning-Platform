import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Sparkles, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0e27] via-[#141b3d] to-[#0a0e27] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-[#8b5cf6]/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-[#6366f1]/5 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#6366f1] to-[#8b5cf6] text-white px-4 py-2 rounded-full mb-4 shadow-lg shadow-indigo-500/25">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Welcome Back</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Sign in to <span className="text-transparent bg-clip-text bg-linear-to-r from-[#818cf8] to-[#a78bfa]">DevStep</span>
          </h1>
          <p className="text-slate-300">Continue your learning journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e293b]/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f172a] text-white border border-slate-700/50 outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] transition-all placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f172a] text-white border border-slate-700/50 outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] transition-all placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-500 focus:ring-2 focus:ring-indigo-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-linear-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-semibold py-3.5 rounded-lg transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#818cf8] hover:text-[#a78bfa] font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
            <div className="text-slate-400 text-xs">Gamified</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
            <Zap className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <div className="text-slate-400 text-xs">Interactive</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-slate-400 text-xs">Rewards</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;