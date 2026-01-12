import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Sparkles } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0a0e27] via-[#1e1b4b] to-[#0a0e27] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[#8b5cf6]/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-[#6366f1]/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        <div className="absolute w-[300px] h-[300px] bg-[#8b5cf6]/5 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-linear-to-r from-[#8b5cf6] to-[#6366f1] text-white px-4 py-2 rounded-full mb-4 shadow-lg shadow-purple-500/25">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Start Your Learning Journey</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Join <span className="text-transparent bg-clip-text bg-linear-to-r from-[#a78bfa] to-[#818cf8]">DevStep</span>
          </h1>
          <p className="text-slate-300">Level up your coding skills with gamified learning</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e293b]/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-700/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f172a] text-white border border-slate-700/50 outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-slate-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f172a] text-white border border-slate-700/50 outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-slate-500"
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
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f172a] text-white border border-slate-700/50 outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-slate-200 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-[#0f172a] text-white border border-slate-700/50 outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-slate-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-linear-to-r from-[#8b5cf6] to-[#6366f1] hover:from-[#7c3aed] hover:to-[#4f46e5] text-white font-semibold py-3.5 rounded-lg transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#a78bfa] hover:text-[#c4b5fd] font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
            <div className="text-purple-400 font-bold text-lg">500+</div>
            <div className="text-slate-400 text-xs">Students</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
            <div className="text-indigo-400 font-bold text-lg">50+</div>
            <div className="text-slate-400 text-xs">Courses</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
            <div className="text-purple-400 font-bold text-lg">95%</div>
            <div className="text-slate-400 text-xs">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
