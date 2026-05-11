import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, Cpu, Brain, Sparkles, Trophy, Target, Award, User as UserIcon } from 'lucide-react';
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { clubs } from '../utils/clubData';

const ClubDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const club = clubs.find(c => c.slug === slug);

  if (!club) return <Navigate to="/dashboard" />;

  const iconMap = {
    Technical: <Cpu className="text-primary" />,
    Social: <Target className="text-primary" />,
    Startup: <Trophy className="text-primary" />,
    Cultural: <Sparkles className="text-primary" />,
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sora">
      <Navbar />

      <main className="max-w-[1280px] mx-auto w-full px-6 py-8">
        {/* Back Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors group">
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Club Hero Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl mb-12"
        >
          <img 
            alt={club.name} 
            className="w-full h-full object-cover" 
            src={club.image} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent flex flex-col justify-end p-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex bg-secondary text-primary px-4 py-1 rounded-full font-bold mb-4 w-fit uppercase tracking-wider text-[10px] shadow-lg"
            >
              {club.category}
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold text-white mb-4"
            >
              {club.name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/90 max-w-3xl leading-relaxed font-medium"
            >
              {club.tagline}
            </motion.p>
          </div>
        </motion.section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* About Section */}
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-xl border-l-8 border-primary"
            >
              <h2 className="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
                <Sparkles className="text-secondary" />
                About {club.name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {club.description}
              </p>
            </motion.section>

            {/* Past Initiatives/Projects */}
            <section>
              <h2 className="text-3xl font-bold text-primary mb-12">Key Initiatives & Projects</h2>
              <div className="relative pl-8 border-l-2 border-primary/10 ml-4 space-y-12">
                {(club.projects || []).map((item, index) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="absolute -left-[45px] top-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-50 shadow-lg text-primary">
                      {iconMap[club.category] || <Award size={20} />}
                    </div>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-transparent hover:border-secondary">
                      <div className="p-8">
                        <span className="font-bold text-secondary text-sm mb-2 block">{item.date}</span>
                        <h3 className="text-2xl font-bold text-primary mb-4">{item.title}</h3>
                        <p className="text-gray-500 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-12">
            {/* Application Section */}
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-primary p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
                <Send size={200} />
              </div>
              <h2 className="text-3xl font-bold mb-8 relative z-10">Application Process</h2>
              <div className="space-y-8 relative z-10 mb-10">
                <div className="flex gap-4 items-start">
                  <span className="text-3xl font-bold text-secondary">01</span>
                  <p className="text-white/80 font-medium text-sm">Register interest via the portal.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-3xl font-bold text-secondary">02</span>
                  <p className="text-white/80 font-medium text-sm">Submit your portfolio or technical assessment.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-3xl font-bold text-secondary">03</span>
                  <p className="text-white/80 font-medium text-sm">Attend the interview with the core committee.</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/apply/${club.slug}`)}
                className="w-full bg-secondary text-primary font-bold py-4 rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-xs shadow-xl"
              >
                Apply Now
              </motion.button>
            </motion.section>

            {/* Leadership Section */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6">Leadership</h2>
              <div className="space-y-6">
                {(club.leadership || []).map((leader) => (
                  <div key={leader.name} className="bg-white p-6 rounded-3xl shadow-lg flex items-center gap-6 border border-gray-100 hover:border-secondary transition-colors group">
                    <div className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center bg-slate-50 group-hover:border-secondary transition-colors text-primary">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{leader.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{leader.role}</p>
                      <a href={`mailto:${leader.name.toLowerCase().replace(' ', '.')}@jecrc.edu.in`} className="text-secondary font-bold text-xs flex items-center gap-1 hover:underline">
                        <Mail size={14} />
                        Contact
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClubDetail;
