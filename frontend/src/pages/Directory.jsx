import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, Search, Shield, UserSquare2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Directory = () => {
  const [entries, setEntries] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [directoryRes, clubsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/directory/'),
          axios.get('http://localhost:8000/api/clubs/'),
        ]);
        setEntries(directoryRes.data);
        setClubs(clubsRes.data);
      } catch (error) {
        console.error('Failed to fetch directory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesClub =
        selectedClub === 'All' ||
        (entry.club && entry.club.name.toLowerCase() === selectedClub.toLowerCase());

      if (!query) return matchesClub;

      const searchBlob = [
        entry.name,
        entry.designation,
        entry.role,
        entry.phone,
        entry.email,
        entry.club?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesClub && searchBlob.includes(query);
    });
  }, [entries, searchQuery, selectedClub]);

  const authorityMembers = filteredEntries.filter(
    (entry) => !entry.club || entry.role?.toLowerCase().includes('authority')
  );
  const clubContacts = filteredEntries.filter(
    (entry) => entry.club && !entry.role?.toLowerCase().includes('authority')
  );

  const renderCards = (list) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {list.map((entry, idx) => (
        <motion.article
          key={entry.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.04 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-black text-primary">{entry.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{entry.designation || 'Designation not provided'}</p>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Building2 size={15} className="text-primary" />
              <span>{entry.club?.name || 'University Authority'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={15} className="text-primary" />
              <span>{entry.phone || 'Not available'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={15} className="text-primary" />
              <span className="truncate">{entry.email || 'Not available'}</span>
            </p>
            <p className="flex items-center gap-2">
              <UserSquare2 size={15} className="text-primary" />
              <span>{entry.role || 'Contact'}</span>
            </p>
          </div>
        </motion.article>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sora">
      <Navbar />

      <section className="bg-primary pt-28 pb-14 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_50%)]" />
        <div className="relative max-w-[1280px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">Directory</h1>
          <p className="text-white/75 mt-4 max-w-2xl">
            Find JECRC authority members and club contacts quickly.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm flex flex-col md:flex-row gap-3 md:items-center mb-10">
          <div className="relative flex-grow">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, role, club, phone, email..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.name}>
                {club.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-24">Loading directory...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 py-20 text-center text-slate-500">
            No contacts found for your filters.
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black text-primary flex items-center gap-2 mb-5">
                <Shield size={20} className="text-secondary" />
                Authority Member Directory
              </h2>
              {authorityMembers.length > 0 ? (
                renderCards(authorityMembers)
              ) : (
                <p className="text-slate-500 text-sm">No authority contacts match current filters.</p>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-black text-primary flex items-center gap-2 mb-5">
                <Building2 size={20} className="text-secondary" />
                Club Contacts
              </h2>
              {clubContacts.length > 0 ? (
                renderCards(clubContacts)
              ) : (
                <p className="text-slate-500 text-sm">No club contacts match current filters.</p>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Directory;
