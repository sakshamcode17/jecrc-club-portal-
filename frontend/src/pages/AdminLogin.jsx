import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAdminStore from '../store/adminStore';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const adminLogin = useAdminStore((state) => state.adminLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const tokenRes = await axios.post('http://localhost:8000/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = tokenRes.data;

      const userRes = await axios.get('http://localhost:8000/api/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userRes.data.is_admin) {
        setError('Access denied. You do not have admin privileges.');
        return;
      }

      adminLogin(userRes.data, access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative overflow-hidden">
      {/* Animated blobs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1.2 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute top-10 left-10 w-80 h-80 bg-secondary rounded-full blur-[120px]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 0.1, scale: 0.8 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-[140px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[440px] mx-6"
      >
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-secondary via-yellow-300 to-secondary" />

          <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-secondary/30">
                <ShieldCheck className="text-secondary" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
              <p className="text-white/60 text-sm">JECRC Club Hub — Management Console</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-500/20 text-red-200 border border-red-400/30 rounded-2xl flex items-center gap-3"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Admin Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-secondary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="admin@jecrc.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white/80">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-secondary transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 pl-11 pr-12 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-secondary text-primary font-bold py-4 rounded-2xl hover:bg-yellow-300 transition-all shadow-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="animate-spin border-2 border-primary border-t-transparent rounded-full w-5 h-5" />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {loading ? 'Signing In...' : 'Admin Sign In'}
              </motion.button>
            </form>

            <div className="mt-8 text-center">
              <a href="/login" className="text-white/40 hover:text-secondary text-sm transition-colors">
                ← Back to Student Login
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 JECRC Club Hub. Restricted Access.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
