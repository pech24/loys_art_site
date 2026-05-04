import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Instagram, Facebook, Menu, X as CloseIcon } from 'lucide-react';
import { navLinks } from '../constants';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-deep-red sticky top-0 z-50 border-b border-gold/30 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center py-5">
          {/* Centered Nav + Socials */}
          <nav className="hidden md:flex space-x-10 items-center justify-center">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path}
                to={link.path}
                className={({ isActive }) => `nav-link-celestial ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </NavLink>
            ))}
            
            {/* Grouped Socials */}
            <div className="flex items-center gap-6 border-l border-white/20 pl-10">
              <a href="https://x.com/Loys2499" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors">
                <X size={18} />
              </a>
              <a href="https://www.instagram.com/loys2499/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/Loys2499/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex justify-end w-full items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
              {isOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {isOpen && (
          <div className="md:hidden pb-6">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `text-center py-3 rounded-md text-xl font-normal uppercase tracking-widest ${isActive ? 'bg-white/10 text-gold' : 'text-white'}`}
                >
                  {link.name}
                </NavLink>
              ))}
              
              {/* Mobile Socials */}
              <div className="flex justify-center gap-8 pt-6 border-t border-white/10 mt-4">
                <a href="https://x.com/Loys2499" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors">
                  <X size={24} />
                </a>
                <a href="https://www.instagram.com/loys2499/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="https://www.facebook.com/Loys2499/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-gold transition-colors">
                  <Facebook size={24} />
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
