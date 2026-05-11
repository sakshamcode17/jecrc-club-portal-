import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { clubs } from '../utils/clubData';
import { Link, useNavigate } from 'react-router-dom';
import useUIStore from '../store/uiStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { searchQuery, selectedCategory, setSelectedCategory } = useUIStore();

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         club.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Technical", "Cultural", "Social", "Entrepreneurship", "Sports", "Media", "Music"];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sora">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-primary text-white">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUzGXqclzDKxe1j84-OaOmc0bD0z8BIUagu4QbUh5Rp3rv8smjt0DluvUHVU43bt1lAONpzgeIl3Abpe9AgsoXfjiTrcc8638Ym89_rRGMI79OQDY_OFRQxBVVuJj8k7LsNCo1YpH6sEdVGh7ZfX_C0jzrDVPOX-vyXM672k8gEzAk__JcuGdxRci_pooNFXRV05b7drh5hMx1Hzg2gYoBruUaJ1J8phnNvmU3tJMk6_H17C5BI0yvXJhz6f7MVzEI6sUclRdfOWRp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent"></div>
        
        <div className="relative max-w-[1280px] mx-auto px-6 z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Discover Your <span className="text-secondary">People</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10">
              Fuel your passions, build your network, and leave your mark at JECRC. Explore university clubs that align with your ambitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/profile">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-secondary text-primary font-bold px-8 py-4 rounded-xl hover:bg-secondary/90 transition-all flex items-center justify-center gap-2"
                >
                  MY Clubs
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-6 py-16">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                  selectedCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
            <Filter size={18} />
            <span>Sort by: Popularity</span>
          </div>
        </div>

        {/* Club Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredClubs.map((club, index) => (
            <motion.div 
              key={club.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={club.hasDetailPage ? { y: -10 } : {}}
              className={`group bg-white rounded-2xl p-4 shadow-xl border border-transparent ${club.hasDetailPage ? 'hover:border-secondary cursor-pointer' : 'opacity-90'} transition-all duration-300 flex flex-col h-full`}
              onClick={() => club.hasDetailPage && navigate(`/clubs/${club.slug}`)}
            >
              <div className="mb-6 relative rounded-xl overflow-hidden h-52 bg-slate-50 flex items-center justify-center p-8">
                <img 
                  alt={club.name} 
                  className={`max-w-full max-h-full object-contain ${club.hasDetailPage ? 'group-hover:scale-110' : ''} transition-transform duration-500`} 
                  src={club.image}
                />
                <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  {club.category}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">{club.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-grow mb-6">{club.description}</p>
              
              {club.initiatives && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {club.initiatives.map((init) => (
                    <span key={init} className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-gray-400 rounded-lg border border-gray-100">
                      {init}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + index * 10}`} alt="member" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold border-2 border-white text-gray-500">
                    +{club.members || 10}
                  </div>
                </div>
                {club.hasDetailPage ? (
                  <button className="text-primary font-bold text-sm hover:text-secondary transition-all flex items-center gap-1">
                    View Details
                    <ExternalLink size={16} />
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Info Only</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {filteredClubs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">No clubs found matching your search.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
