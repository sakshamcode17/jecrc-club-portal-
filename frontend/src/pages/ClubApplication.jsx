import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  User, 
  BookOpen, 
  Mail, 
  Phone, 
  FileText, 
  Link as LinkIcon, 
  Award, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAuthStore from '../store/authStore';
import { clubs } from '../utils/clubData';

const ClubApplication = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  const club = clubs.find(c => c.slug === slug);
  
  const [formData, setFormData] = useState({
    name: user?.full_name || user?.name || '',
    enrollment_no: user?.enrollment_no || '',
    branch: user?.branch || '',
    semester: user?.semester || '',
    email: user?.email || '',
    position: '',
    motivation: '',
    skills: '',
    portfolio_link: '',
    contact_number: user?.contact || '',
    availability: '',
  });

  const [realClubId, setRealClubId] = useState(null);
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/clubs/${slug}`);
        setRealClubId(response.data.id);
      } catch (err) {
        console.error("Error fetching club details:", err);
        setError("Could not find club information. Please try again later.");
      }
    };

    if (slug) {
      fetchClub();
    }
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setResume(file);
      setResumeName(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!resume) {
      setError('Please upload your resume');
      setLoading(false);
      return;
    }

    if (!realClubId) {
      setError('Club information is still loading. Please wait a moment.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('club_id', realClubId);
    data.append('position', formData.position);
    data.append('motivation', formData.motivation);
    data.append('skills', formData.skills);
    data.append('portfolio_link', formData.portfolio_link);
    data.append('availability', formData.availability);
    data.append('contact_number', formData.contact_number);
    data.append('resume', resume);

    try {
      await axios.post('http://localhost:8000/api/applications/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === 'You have already applied to this club') {
        setError('You have already submitted an application to this club. Check your profile for the status.');
      } else {
        setError(detail || 'Submission failed. Please check all fields and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-green-100"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Your application for <strong>{club?.name}</strong> has been received successfully. You can track your status in your profile.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/profile')}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg"
              >
                View Status in Profile
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full bg-slate-100 text-primary font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sora">
      <Navbar />

      <main className="max-w-[1000px] mx-auto w-full px-6 py-12">
        {/* Back Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to={`/clubs/${slug}`} className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors group">
            <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
            Back to Club Details
          </Link>
        </motion.div>

        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-primary mb-4"
          >
            Club Application
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600"
          >
            You are applying for <span className="text-secondary font-bold">{club?.name}</span>
          </motion.p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Info Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <h2 className="text-2xl font-bold text-primary">Student Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    name="name"
                    readOnly
                    value={formData.name}
                    className="w-full bg-slate-50 border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Enrollment Number</label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    name="enrollment_no"
                    readOnly
                    value={formData.enrollment_no || 'JU/2021/4582'}
                    className="w-full bg-slate-50 border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Branch</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    name="branch"
                    readOnly
                    value={formData.branch || 'B.Tech CSE'}
                    className="w-full bg-slate-50 border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">University Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email"
                    name="email"
                    readOnly
                    value={formData.email}
                    className="w-full bg-slate-50 border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Application Details */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                <FileText size={20} />
              </div>
              <h2 className="text-2xl font-bold text-primary">Application Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Preferred Role/Position *</label>
                  <select 
                    name="position"
                    required
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 px-4 py-3.5 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select a role</option>
                    <option value="Core Member">Core Member</option>
                    <option value="Technical Lead">Technical Lead</option>
                    <option value="Creative Head">Creative Head</option>
                    <option value="Management Team">Management Team</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Contact Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel"
                      name="contact_number"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Why do you want to join? *</label>
                <textarea 
                  name="motivation"
                  required
                  rows="4"
                  placeholder="Tell us about your interest in this club..."
                  value={formData.motivation}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 px-4 py-3.5 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Skills & Experience *</label>
                <textarea 
                  name="skills"
                  required
                  rows="3"
                  placeholder="Relevant skills, previous club experience, etc."
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 px-4 py-3.5 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Portfolio/LinkedIn Link</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="url"
                      name="portfolio_link"
                      placeholder="https://..."
                      value={formData.portfolio_link}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Availability *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      name="availability"
                      required
                      placeholder="e.g. Weekends, After 4 PM"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 px-11 py-3.5 rounded-2xl text-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Resume Upload (PDF) *</label>
                <div className="relative group">
                  <input 
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label 
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group-hover:scale-[1.01]"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="text-slate-400 group-hover:text-primary mb-2 transition-colors" size={24} />
                      <p className="text-sm text-slate-500 font-medium">
                        {resumeName ? resumeName : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PDF only (Max 5MB)</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto md:px-12 bg-primary text-white font-bold py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Submitting Application...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Application
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              By submitting, you agree to follow the club's code of conduct and university guidelines.
            </p>
          </motion.div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default ClubApplication;
