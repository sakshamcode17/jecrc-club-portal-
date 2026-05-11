import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, MapPin, Send, Cpu, Brain, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ClubProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const initiatives = [
    {
      title: "Robo-War 2023",
      date: "October 2023",
      description: "A national-level robotics combat tournament hosting over 50 teams from across India. Students showcased custom mechanical builds and high-speed motor control systems in a high-stakes arena.",
      icon: <Cpu className="text-primary" />,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxMAFKIAkVESinzb-yMRd9fvmTJjwgDpkntN7W5aT-qz-KqN2GYe3wCtSYbShLTRo6kPjigHjrwy8SSEAJVpcw-DNUsP-twKm8rxtdXCDzOFoGJFwhAMwHpI2eAjZ8V8vRKZDPbSOqkd0W3ziT2gvwVBaqPQHsyj1cbwIqBIpmUjq-F8oE-luZcysnTyk0xVAtngGq6siOBckmPH6_afuHhw9UVJNliq3Slm1Gf1SopoG6HjAzzet7gQIa216AAgYi9ip_4YB9UZJd"
    },
    {
      title: "AI Workshop 2024",
      date: "January 2024",
      description: "An intensive 3-day workshop focused on integrating Computer Vision with microcontrollers. Participants learned to implement real-time object detection on embedded systems.",
      icon: <Brain className="text-primary" />,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxaOvGBYj9KUJft-PfP7sOaNIobiR8fTSPA8E-gEWODZDszgyaXbrRjB0wKlEsQaTQYC6nuZcI_fJ0Qnb5evHSvU3sBCcPiE39ChfHx_EVERBthUXBhqJG79DZTOKGajfGMHoCkbGKYe--Ukeb10JZc5XLlGCBTZE6X4ApFQncLjKC3fQPrHzpIVmkmmURbBaWPpgsa9O_LxHgPIxr5DR8Kp4yaxtEo8G4cubbUjBRFbK87BM7G1Ryq6ujpNOY7OjMyM8RuhLYjwhD"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
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
            alt="Robotics Society Banner" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCII2Gh4HeHf4AOHjaFkFJWUKQridblMHYpK1olOlXRjZTiVxY-YgNuW3oNso_FAeJC-OR193ufYGlM6f_4Cd8v4aEqDXryygNO9DvHImpwnoJe3wTb8SRgft2ingd2PNoJtXo-F3yVgaUVEGuf6BU8iHh8bq5BCHq4zi58nw70trzfFtPrrmOl2n4PSQWNc1CYjWJpDB6icNz1yMC6zcfdLP7ILgHG_VzhQlIG7T0Da_tX7Vb5G95hNgorub7eaThvRQadxkm6T2zC" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent flex flex-col justify-end p-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex bg-secondary text-primary px-4 py-1 rounded-full font-bold mb-4 w-fit uppercase tracking-wider text-xs shadow-lg"
            >
              Technical
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold text-white mb-4"
            >
              Robotics Society
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/90 max-w-3xl leading-relaxed"
            >
              Pioneering the future of automation through collaborative engineering, competitive excellence, and hands-on technical mastery.
            </motion.p>
          </div>
        </motion.section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Mission Section */}
            <motion.section 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-xl border-l-8 border-primary"
            >
              <h2 className="text-3xl font-bold text-primary mb-6 flex items-center gap-3">
                <Sparkles className="text-secondary" />
                Our Mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                The Robotics Society at JECRC University is a community of tech enthusiasts dedicated to exploring the realms of AI, machine learning, and hardware design. We bridge the gap between theoretical engineering and practical application by providing students with the resources, mentorship, and equipment needed to build industry-ready solutions. Our mission is to foster a culture of innovation that empowers students to lead the next technological revolution.
              </p>
            </motion.section>

            {/* Past Initiatives */}
            <section>
              <h2 className="text-3xl font-bold text-primary mb-12">Past Initiatives</h2>
              <div className="relative pl-8 border-l-2 border-primary/10 ml-4 space-y-12">
                {initiatives.map((item, index) => (
                  <motion.div 
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="absolute -left-[45px] top-0 w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-50 shadow-lg text-primary">
                      {item.icon}
                    </div>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-transparent hover:border-secondary">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-56 md:h-auto overflow-hidden">
                          <img 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            src={item.image} 
                          />
                        </div>
                        <div className="md:w-2/3 p-8">
                          <span className="font-bold text-secondary text-sm mb-2 block">{item.date}</span>
                          <h3 className="text-2xl font-bold text-primary mb-4">{item.title}</h3>
                          <p className="text-gray-500 leading-relaxed">{item.description}</p>
                        </div>
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
              <h2 className="text-3xl font-bold mb-8 relative z-10">How to Apply</h2>
              <div className="space-y-8 relative z-10 mb-10">
                <div className="flex gap-4 items-start">
                  <span className="text-3xl font-bold text-secondary">01</span>
                  <p className="text-white/80 font-medium">Complete the online interest form with your technical profile.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-3xl font-bold text-secondary">02</span>
                  <p className="text-white/80 font-medium">Attend the technical orientation session in the Main Auditorium.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <span className="text-3xl font-bold text-secondary">03</span>
                  <p className="text-white/80 font-medium">Personal interview with the core committee and faculty advisor.</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/apply/${slug}`)}
                className="w-full bg-secondary text-primary font-bold py-4 rounded-2xl hover:bg-white transition-all uppercase tracking-widest text-sm shadow-xl"
              >
                Apply Now
              </motion.button>
            </motion.section>

            {/* Leadership Section */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6">Leadership</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg flex items-center gap-6 border border-gray-100 hover:border-secondary transition-colors group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-secondary transition-colors">
                    <img alt="Rohan Verma" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp-x6AcbuhWOtaXEeOelaxXzp4War1tyPS1rIvlfni_7Euw08cNZvmDcIXwmlVAcWGtQ0Nhm3xBhsnaz8xefIgOBBu24NnNGqF3fzCUurx1OaACU_0a7vikGssfG-zcx4HowmCXAsmNSOsFwiBw5muDocpObTICQ0bSQU8YBk-Lym0qvj39AqvRI5YR4TqRYQf6RkoUyfkqi20D00O7xwBaqVYaYMoSLs7vF_37DwL16nswmp_FBjgeIdINYo6TOvNcgRJvY3pscnG" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Rohan Verma</h4>
                    <p className="text-sm text-gray-500 mb-2">President</p>
                    <a href="mailto:rohan.verma@jecrc.edu" className="text-secondary font-bold text-xs flex items-center gap-1 hover:underline">
                      <Mail size={14} />
                      Contact
                    </a>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg flex items-center gap-6 border border-gray-100 hover:border-secondary transition-colors group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-secondary transition-colors">
                    <img alt="Dr. Sunita Meena" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRgUPgf6t3v173ysvrjfzwda7lYS7K59rtwRnkvLYcobOjDc5VORBoquk-0KBQDQ8YLBC3BF5HhDJOufveLGkVb7CuCt5Z4C641zuO3GH4wzLUk5U_YM40Drq1sAGHwhT2uRmswFiuOBuviqCNOzgyqFvGpqCRVaNt07_u_X-H8JKefAX_nYzJL3A1VXwXfbrh58y-nVy44-xwKUJUf4bAyfJMyCFU0p4GYgdUhYDtHPNcGpcfGx7oPaXIwJMgyzJRNSR5jG1Nd4Az" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dr. Sunita Meena</h4>
                    <p className="text-sm text-gray-500 mb-2">Faculty Advisor</p>
                    <a href="mailto:sunita.meena@jecrc.edu" className="text-secondary font-bold text-xs flex items-center gap-1 hover:underline">
                      <Mail size={14} />
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClubProfile;
