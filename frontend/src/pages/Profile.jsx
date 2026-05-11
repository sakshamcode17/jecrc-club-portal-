import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Verified, School, Calendar, TrendingUp, Loader2, Info, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, token } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const response = await axios.get('http://localhost:8000/api/applications/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchApplications();
      // Poll every 10 seconds for real-time status updates
      const interval = setInterval(() => fetchApplications(true), 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const stats = [
    { label: "Clubs Active", value: "02", icon: <TrendingUp className="text-secondary" /> },
    { label: "Events Attended", value: "08", icon: <Calendar className="text-secondary" /> },
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-slate-100 text-slate-700 border-slate-200',
      'Under Review': 'bg-purple-100 text-purple-700 border-purple-200',
      'Interview Scheduled': 'bg-amber-100 text-amber-700 border-amber-200',
      'Accepted': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const joinedClubs = [
    { name: "JU Makerspace", role: "Core Tech Member", icon: "ðŸ› ï¸" },
    { name: "JU Aashayein", role: "Active Participant", icon: "â¤ï¸" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sora">
      <Navbar />

      <main className="pt-10 pb-20 px-6 max-w-[1280px] mx-auto w-full">
        {/* Hero Profile Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-10 relative overflow-hidden border-b-8 border-secondary"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-bl-full -mr-20 -mt-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-primary mb-2">{user?.full_name || user?.name || 'Saksham'}</h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Enrollment No: {user?.enrollment_no || '24BCON2068'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-2 bg-primary text-white rounded-full font-bold text-xs flex items-center gap-2">
                  <Verified size={14} className="text-secondary" />
                  Verified Student
                </span>
                <span className="px-4 py-2 bg-secondary/10 text-secondary font-bold text-xs rounded-full border border-secondary/20">
                  {user?.year || '2nd Year'} â€¢ {user?.semester || '4th Semester'}
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Academic & Stats */}
          <div className="lg:col-span-4 space-y-10">
            {/* Academic Details */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-lg border-t-4 border-primary"
            >
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <School size={20} className="text-secondary" />
                Academic Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Branch</label>
                  <p className="text-lg font-bold text-primary">{user?.branch || 'B.Tech Computer Science'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">University Email</label>
                  <p className="text-lg font-bold text-primary break-all">{user?.email || 'saksham@jecrc.edu.in'}</p>
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={80} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-8">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <span className="block text-3xl font-extrabold text-secondary mb-1">{stat.value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clubs & Applications */}
          <div className="lg:col-span-8 space-y-10">
            {/* My Clubs Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">My Clubs</h2>
                <Link to="/dashboard" className="text-secondary font-bold text-sm hover:underline">Explore More</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {joinedClubs.map((club, index) => (
                  <motion.div 
                    key={club.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group bg-white p-6 rounded-2xl shadow-lg border border-transparent hover:border-secondary transition-all"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-secondary/10 transition-colors">
                        {club.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">{club.name}</h4>
                        <p className="text-sm font-semibold text-gray-400">{club.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Application Status Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="px-8 py-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Application Status</h2>
                <button
                  onClick={() => fetchApplications(true)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl"
                >
                  <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin mb-4" size={40} />
                    <p className="font-medium">Fetching your applications...</p>
                  </div>
                ) : applications.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-gray-100">
                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Club Name</th>
                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Position</th>
                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 text-sm font-bold text-primary">{app.club?.name || 'Unknown Club'}</td>
                          <td className="px-8 py-6 text-sm font-semibold text-gray-500">{app.position}</td>
                          <td className="px-8 py-6 text-sm font-semibold text-gray-500">
                            {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-20 flex flex-col items-center justify-center text-slate-400 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Info size={24} />
                    </div>
                    <p className="font-bold text-lg text-primary mb-1">No Applications Found</p>
                    <p className="text-sm max-w-xs">You haven't applied to any clubs yet. Head over to the dashboard to find exciting opportunities!</p>
                    <Link to="/dashboard" className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-bold text-xs hover:bg-primary/90 transition-all">
                      Browse Clubs
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
