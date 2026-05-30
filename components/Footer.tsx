import React from 'react';
import { X, Instagram, Coffee, PenLine, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

type SocialLinkProps = {
    href: string;
    children: React.ReactNode;
};

const SocialLink = ({ href, children }: SocialLinkProps) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="p-3 rounded-full bg-white/5 text-white/40 hover:text-gold hover:bg-gold/10 transition-all duration-300 border border-white/5 hover:border-gold/30"
    >
        {children}
    </a>
)

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="mt-16 bg-ink relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center space-y-12">
          <div className="flex items-center gap-3 text-gold">
            <span className="text-2xl font-serif tracking-[0.3em] uppercase">Loys</span>
          </div>

          <div className="flex justify-center gap-6">
            <SocialLink href="https://x.com/Loys2499">
              <X size={20} />
            </SocialLink>
            <SocialLink href="https://www.instagram.com/loys2499/">
              <Instagram size={20} />
            </SocialLink>
            <SocialLink href="https://ko-fi.com/loys24">
              <Coffee size={20} />
            </SocialLink>
          </div>

          <div className="text-center space-y-4">
            <p className="text-white/40 text-sm tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Loys. All Rights Reserved.
            </p>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.4em]">
              v2
            </p>
            <p className="text-white/20 text-xs italic">
              "Through the stars, we find our vision."
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
