import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PenLine, UserCircle, User, Image, RefreshCw, Video, FileCheck, Calendar, Briefcase, Layers, Circle, FileText, CreditCard, Palette, Award } from 'lucide-react';
import { commissionTiers, commissionProcess, commissionTerms } from '../constants';
import { getDirectMediaUrl, isVideoUrl, isYoutubeUrl, getYoutubeThumbnail } from '../mediaUtils';

const ElegantDivider: React.FC = () => (
    <div className="w-24 h-px bg-gold/30 mx-auto my-8" />
);

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Artist Focus */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-ink py-20">
        <div className="absolute inset-0">
          {/* Background Video */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover opacity-50"
            crossOrigin="anonymous"
          >
            <source src="https://cdn.loys.art/common/Webm/Cover.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
          <div className="vignette-overlay" />
          <div className="noise-overlay" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {/* Avatar Image */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <img 
                  src="https://ik.imagekit.io/pcd7jjipb/Home%20Files/Profile%20Pic.png" 
                  alt="Loys Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 border-4 border-gold/20 rounded-full pointer-events-none" />
              </div>
            </div>

            <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Loys
            </h1>
            
            <p className="text-base md:text-xl text-white/90 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
              An illustrator always aiming to capture the energy and emotions of your characters. Each piece is thoughtfully refined to elevate your vision—resulting in artwork that feels expressive, patiently crafted and distinctly personal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/gallery" className="btn-hero-primary w-full sm:w-auto">
                VIEW PORTFOLIO
              </Link>
              <Link to="/orders" className="btn-hero-secondary w-full sm:w-auto">
                Inquire Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Commissions Section - White */}
      <section className="section-white overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-medium mb-1 text-deep-red">Commissions</h2>
              <p className="text-sm md:text-base text-gold font-medium tracking-[0.2em] uppercase">Limited Slots Only</p>
          </div>

          {/* Tiers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {commissionTiers.map((tier, index) => (
                  <motion.div 
                    key={tier.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col border border-gold/20 bg-cream/30 rounded-xl overflow-hidden shadow-sm hover:shadow-gold/20 hover:shadow-xl transition-all duration-500 group"
                  >
                      <div className="overflow-hidden h-64 relative">
                        {isYoutubeUrl(tier.imageUrl) ? (
                          <img 
                            src={getYoutubeThumbnail(tier.imageUrl) || ''} 
                            alt={tier.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                        ) : isVideoUrl(tier.imageUrl) ? (
                          <video 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            preload="metadata"
                            crossOrigin="anonymous"
                          >
                            <source src={getDirectMediaUrl(tier.imageUrl)} type={tier.imageUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
                          </video>
                        ) : (
                          <img 
                            src={getDirectMediaUrl(tier.imageUrl)} 
                            alt={tier.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            crossOrigin="anonymous"
                          />
                        )}
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                          <h3 className="text-2xl font-medium mb-2 text-deep-red">{tier.title}</h3>
                          <p className="text-4xl text-ink mb-6 font-serif">{tier.price}</p>
                          <ul className="space-y-3 text-ink/70 mb-8 flex-grow">
                              {tier.features.map(feature => {
                                  let Icon = PenLine;
                                  if (feature.toLowerCase().includes('head portrait')) Icon = UserCircle;
                                  else if (feature.toLowerCase().includes('whole body')) Icon = User;
                                  else if (feature.toLowerCase().includes('background')) Icon = Image;
                                  else if (feature.toLowerCase().includes('revision')) Icon = RefreshCw;
                                  else if (feature.toLowerCase().includes('timelapse')) Icon = Video;
                                  else if (feature.toLowerCase().includes('certificate')) Icon = FileCheck;
                                  else if (feature.toLowerCase().includes('30 days')) Icon = Calendar;
                                  else if (feature.toLowerCase().includes('commercial license')) Icon = Briefcase;
                                  else if (feature.toLowerCase().includes('bundle')) Icon = Layers;

                                  return (
                                    <li key={feature} className="flex items-start">
                                        <Icon size={14} className="text-gold mr-2 mt-1" />
                                        <span>{feature}</span>
                                    </li>
                                  );
                              })}
                          </ul>
                          <Link to="/orders" className="btn-celestial w-full text-center">
                              Inquire
                          </Link>
                      </div>
                  </motion.div>
              ))}
          </div>
        </div>
      </section>
      
      {/* Process Section - Cream */}
      <section className="section-cream overflow-hidden">
        <div className="container mx-auto">
          <h3 className="text-2xl md:text-4xl font-medium text-center mb-10 md:mb-16 text-deep-red">The Process</h3>
          <div className="relative max-w-5xl mx-auto">
            {/* The vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 h-full w-px bg-gold/30 md:transform md:-translate-x-1/2" aria-hidden="true"></div>

            <div className="space-y-12 md:space-y-20">
              {commissionProcess.map((item, index) => (
                <motion.div 
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative pl-12 md:pl-0"
                >
                  {/* Icon on the timeline */}
                  <div className="absolute left-4 md:left-1/2 top-2 w-6 h-6 md:w-8 md:h-8 bg-cream flex items-center justify-center rounded-full border border-gold transform -translate-x-1/2 z-10" aria-hidden="true">
                    {index === 0 && <FileText size={12} className="text-gold" />}
                    {index === 1 && <CreditCard size={12} className="text-gold" />}
                    {index === 2 && <Palette size={12} className="text-gold" />}
                    {index === 3 && <Award size={12} className="text-gold" />}
                  </div>
                  
                  {/* Content wrapper */}
                  <div className={`md:flex items-center gap-16 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Image */}
                    <div className="md:w-1/2 mb-8 md:mb-0">
                      <div className="aesthetic-gold-frame">
                        <img 
                          src={item.imageUrl} 
                          alt={item.step} 
                          className="w-full" 
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          crossOrigin="anonymous"
                        />
                      </div>
                    </div>
                    
                    {/* Text */}
                    <div className="md:w-1/2">
                      <h4 className="text-2xl md:text-3xl font-medium mb-4">
                        <span className="text-gold italic font-serif">Step {index + 1}:</span>{" "}
                        <span className="text-deep-red">{item.step}</span>
                      </h4>
                      <p className="text-lg text-ink/70 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terms Section - White */}
      <section id="terms" className="section-white overflow-hidden">
        <div className="container mx-auto max-w-4xl">
           <h3 className="text-2xl md:text-3xl font-medium text-center mb-6 md:mb-10 text-deep-red">Terms of Service</h3>
           <div className="bg-cream/20 border border-gold/10 p-5 md:p-8 rounded-2xl shadow-inner">
             <ul className="space-y-3 text-ink/80 text-sm md:text-base">
                {commissionTerms.map((term, i) => (
                    <li key={i} className="flex items-start">
                      <Circle size={8} fill="currentColor" className="text-gold mr-3 mt-2 flex-shrink-0" />
                      <span>{term}</span>
                    </li>
                ))}
             </ul>
           </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
