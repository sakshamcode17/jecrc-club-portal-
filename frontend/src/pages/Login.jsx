import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting login for:', email);
      // Backend expects OAuth2 form data (username/password)
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const tokenRes = await axios.post('http://localhost:8000/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log('Token received successfully');
      const { access_token } = tokenRes.data;

      // Fetch the user profile with the real token
      const userRes = await axios.get('http://localhost:8000/api/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      console.log('User profile fetched:', userRes.data.email);
      login(userRes.data, access_token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || 'Login failed. Please check your credentials and ensure the backend is running.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main 
        className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden"
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/jecrc_bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Animated background elements */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-20 left-20 w-64 h-64 bg-secondary rounded-full blur-[100px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1.2 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-primary rounded-full blur-[120px]"
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative bg-white/10 backdrop-blur-2xl border border-white/20 z-10"
        >
          {/* Accent Top Border */}
          <div className="h-2 w-full bg-secondary"></div>
          
          <div className="p-8 md:p-12 flex flex-col items-center">
            {/* Branding Area */}
            <div className="mb-8 text-center">
              <motion.img 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                alt="JECRC University Logo" 
                className="h-16 w-auto mb-6 mx-auto object-contain" 
                src="/logo.png"
              />
              <h1 className="text-3xl font-bold text-white mb-2">JECRC Club Hub</h1>
              <p className="text-white/80 max-w-[300px] mx-auto">
                Your gateway to campus life at JECRC University
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="w-full mb-6 p-4 bg-red-500/20 text-red-100 border-l-4 border-red-500 flex items-center gap-3 rounded-lg backdrop-blur-md"
              >
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white/90" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 pl-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-white placeholder-white/40" 
                    id="email" 
                    name="email" 
                    placeholder="student@jecrc.ac.in" 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-secondary transition-colors" size={20} />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-white/90" htmlFor="password">Password</label>
                  <a className="text-xs font-semibold text-secondary hover:underline" href="#">Forgot?</a>
                </div>
                <div className="relative group">
                  <input 
                    className="w-full bg-white/10 border border-white/20 px-4 py-3 pl-11 pr-11 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-white placeholder-white/40" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-secondary transition-colors" size={20} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input 
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-secondary focus:ring-secondary" 
                  id="remember" 
                  type="checkbox" 
                />
                <label className="text-sm text-white/70 select-none" htmlFor="remember">Remember this device</label>
              </div>

              <motion.button 
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="w-full bg-secondary text-primary-container font-bold py-4 rounded-xl hover:bg-secondary/90 active:scale-95 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70" 
                type="submit"
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : null}
                {loading ? 'Signing in...' : 'Login'}
              </motion.button>
            </form>

            {/* Footer Action */}
            <div className="mt-8 pt-8 border-t border-white/10 w-full text-center">
              <p className="text-sm text-white/60">
                Don't have an account? 
                <a className="ml-1 text-secondary font-bold hover:underline" href="#">Register Now</a>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-white bg-primary/90 backdrop-blur-md">
        <div className="w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold">JECRC Club Hub</span>
            <p className="text-sm text-white/60 mt-2">© 2024 JECRC University Club Hub. Empowering Student Excellence.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a className="text-sm text-white/60 hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-white/60 hover:text-secondary transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-white/60 hover:text-secondary transition-colors" href="#">Faculty Portal</a>
            <a className="text-sm text-white/60 hover:text-secondary transition-colors" href="#">Contact Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Login;
