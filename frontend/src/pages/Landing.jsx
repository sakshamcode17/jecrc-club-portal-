import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Theater, Trophy, BookOpen, Heart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Landing = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Technical", icon: <Terminal size={32} />, count: 24 },
    { name: "Cultural", icon: <Theater size={32} />, count: 18 },
    { name: "Sports", icon: <Trophy size={32} />, count: 12 },
    { name: "Literary", icon: <BookOpen size={32} />, count: 8 },
    { name: "Social", icon: <Heart size={32} />, count: 10 },
    { name: "Startup", icon: <Users size={32} />, count: 15 },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 max-w-[1280px] left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2">
          <img 
            alt="JECRC University Logo" 
            className="h-10 w-auto" 
            src="/logo.png" 
          />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#discover" className="text-sm font-bold text-primary border-b-2 border-primary pb-1">Discover</a>
          <a href="#about" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">About</a>
          <a href="#events" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">Events</a>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg"
          >
            Login
          </motion.button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-primary px-6 text-center pt-20">
          <div className="absolute inset-0 z-0 opacity-30">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs8UKd7SR8L8rFuS6999bBlQCcuCF_CFOCWBcvvU9PHvw4Q0wWzA8mHvXT-tTu_z6nBWeIgWSW2v2BcmzwpIF4qoLv1_3mWb6MCIroBoZZgy_CYbRgH_KkzsvumoJ11wulRDb62k_KzNFWdjJ-uVZmU4fHkUO7RPpEiAZEkWP7_t2ReiDOvrWhVy32ynIeLeQ5atB8ttDt3DUs-He1ZNhP4Xt35xGlwnk-5IXvw16qthv6VojnhkcmCn7JfczXw7t9qLeke7Uonb_N" 
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary"></div>
          
          <div className="relative z-10 max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight"
            >
              Your Journey <br /> <span className="text-secondary">Starts Here</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Discover passions, build skills, and find your tribe at JECRC. Whether you're a tech geek or a creative soul, there's a space waiting for you.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-10 py-4 bg-secondary text-primary font-bold rounded-2xl hover:bg-white transition-all shadow-xl"
              >
                Get Started
              </button>
              <button className="w-full sm:w-auto px-10 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                Browse Clubs
              </button>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section id="discover" className="py-24 max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-500">Explore our diverse range of student-led organizations</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, backgroundColor: '#003087', color: '#ffffff' }}
                className="aspect-square bg-slate-50 border border-gray-100 rounded-3xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer group"
              >
                <div className="mb-4 text-primary group-hover:text-secondary transition-colors">
                  {cat.icon}
                </div>
                <span className="font-bold text-lg mb-1">{cat.name}</span>
                <span className="text-xs opacity-60 font-semibold">{cat.count} Clubs</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="bg-slate-50 py-24">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-5xl font-extrabold text-primary mb-4">20+</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Active Clubs</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-5xl font-extrabold text-secondary mb-4">1500+</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Active Members</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="p-10 bg-white rounded-3xl shadow-xl border border-gray-100"
            >
              <h3 className="text-5xl font-extrabold text-primary mb-4">50+</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Events Yearly</p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
