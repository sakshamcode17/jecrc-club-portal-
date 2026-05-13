import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, Clock, Filter, X, ChevronRight, Users } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, ongoing, past, all
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:8000/api/events/';
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status_filter', activeTab);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await axios.get(`${url}?${params.toString()}`);
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchEvents]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ongoing': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'past': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sora">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-primary text-white">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary"></div>
        
        <div className="relative max-w-[1280px] mx-auto px-6 z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              Campus <span className="text-secondary">Events</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
              Stay updated with everything happening at JECRC University. From technical hackathons to cultural fests.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto relative"
          >
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-secondary transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search events, workshops, fests..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-5 pl-14 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all text-white placeholder-white/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 py-12">
        {/* Tabs and Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            {['upcoming', 'ongoing', 'past', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                  activeTab === tab 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 text-slate-400 text-sm font-semibold">
            <Filter size={18} />
            <span>Sort by: Date</span>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-96 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-300">
            <Calendar size={64} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No events found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col h-full"
              >
                {/* Banner */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={event.banner ? (event.banner.startsWith('http') ? event.banner : `http://localhost:8000${event.banner}`) : 'https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/50">
                    <span className={`w-2 h-2 rounded-full ${event.status === 'Ongoing' ? 'bg-emerald-500 animate-pulse' : event.status === 'Upcoming' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">{event.status}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                    {event.category || 'General'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-secondary font-bold text-xs mb-3 uppercase tracking-widest">
                    <Users size={14} />
                    {event.club_name}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <Calendar size={16} className="text-primary" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                      <MapPin size={16} className="text-primary" />
                      {event.location}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedEvent(event)}
                      className="text-primary font-bold text-sm hover:text-secondary transition-all flex items-center gap-1"
                    >
                      Learn More <ChevronRight size={16} />
                    </button>
                    {event.status === 'Upcoming' && event.registration_link && (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-secondary text-primary font-black px-4 py-2 rounded-xl text-[10px] uppercase hover:shadow-lg hover:shadow-secondary/20 transition-all"
                      >
                        Register Now
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-2xl text-white transition-all border border-white/20"
              >
                <X size={24} />
              </button>

              <div className="relative h-64 md:h-96">
                <img 
                  src={selectedEvent.banner ? (selectedEvent.banner.startsWith('http') ? selectedEvent.banner : `http://localhost:8000${selectedEvent.banner}`) : 'https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-secondary text-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                      {selectedEvent.category || 'General'}
                    </span>
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(selectedEvent.status)}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white">{selectedEvent.title}</h2>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">About the event</h4>
                      <p className="text-slate-600 leading-relaxed text-lg">
                        {selectedEvent.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-2 text-primary">
                          <Calendar size={24} />
                          <h5 className="font-bold">Date & Time</h5>
                        </div>
                        <p className="text-slate-600 font-medium">
                          {formatDate(selectedEvent.date)}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-2 text-primary">
                          <MapPin size={24} />
                          <h5 className="font-bold">Venue</h5>
                        </div>
                        <p className="text-slate-600 font-medium">
                          {selectedEvent.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-primary text-white p-8 rounded-[32px] shadow-xl shadow-primary/20">
                      <h4 className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-6">Organizer</h4>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-black text-secondary">
                          {selectedEvent.club_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{selectedEvent.club_name}</p>
                          <p className="text-xs text-white/50">Official Club</p>
                        </div>
                      </div>

                      {selectedEvent.registration_deadline && (
                        <div className="mb-8 pt-6 border-t border-white/10">
                          <p className="text-xs font-black text-white/50 uppercase tracking-wider mb-2">Registration Deadline</p>
                          <div className="flex items-center gap-2 text-secondary font-bold">
                            <Clock size={16} />
                            <span>{new Date(selectedEvent.registration_deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      {selectedEvent.status === 'Upcoming' && selectedEvent.registration_link ? (
                        <a
                          href={selectedEvent.registration_link}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full block text-center bg-secondary text-primary font-black py-4 rounded-2xl hover:bg-secondary/90 transition-all shadow-lg"
                        >
                          Register Now
                        </a>
                      ) : selectedEvent.status === 'Upcoming' ? (
                        <button className="w-full bg-white/10 text-white/60 font-black py-4 rounded-2xl cursor-not-allowed">
                          Registration Link Coming Soon
                        </button>
                      ) : (
                        <button className="w-full bg-white/10 text-white/50 font-black py-4 rounded-2xl cursor-not-allowed">
                          Registration Closed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Events;
