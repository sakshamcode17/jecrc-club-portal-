import React from 'react';
import { Mail, Share2, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="w-full py-16 px-6 flex flex-col md:flex-row justify-between items-start max-w-[1280px] mx-auto gap-12">
        <div className="max-w-sm">
          <span className="text-2xl font-bold block mb-4">JECRC Club Hub</span>
          <p className="text-white/70 mb-6 leading-relaxed">
            Empowering student excellence through collaborative extracurricular engagement and leadership opportunities.
          </p>
          <p className="text-xs text-white/50">
            © 2026 JECRC University Club Hub. Empowering Student Excellence.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-16">
          <div className="flex flex-col gap-4">
            <span className="font-bold uppercase tracking-widest text-[10px] text-white/40">Portal</span>
            <a className="text-sm text-white/70 hover:text-secondary transition-all" href="#">Privacy Policy</a>
            <a className="text-sm text-white/70 hover:text-secondary transition-all" href="#">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold uppercase tracking-widest text-[10px] text-white/40">Support</span>
            <a className="text-sm text-white/70 hover:text-secondary transition-all" href="#">Faculty Portal</a>
            <a className="text-sm text-white/70 hover:text-secondary transition-all" href="#">Contact Support</a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-bold uppercase tracking-widest text-[10px] text-white/40">Connect</span>
          <div className="flex gap-6">
            <Share2 className="cursor-pointer hover:text-secondary transition-colors" size={20} />
            <Mail className="cursor-pointer hover:text-secondary transition-colors" size={20} />
            <Award className="cursor-pointer hover:text-secondary transition-colors" size={20} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
