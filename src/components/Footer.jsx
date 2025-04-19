import React from 'react';
import { motion } from 'framer-motion';
import { 
  RiGithubFill,
  RiMailFill,
  RiBugFill,
  RiHeartFill,
  RiBrainLine,
  RiCodeSSlashFill,
  RiFeedbackFill 
} from 'react-icons/ri';

const Footer = () => {
  const handleReportBug = () => {
    window.location.href = "mailto:deepakmodidev@gmail.com?subject=Report%20Feedback/Bug%20on%20Braineo";
  };

  const socialLinks = [
    { 
      icon: <RiGithubFill className="w-6 h-6" />, 
      href: 'https://github.com/decodewithdeepak/Braineo',
      label: 'GitHub'
    },
    { 
      icon: <RiMailFill className="w-6 h-6" />, 
      href: 'mailto:deepakmodidev@gmail.com',
      label: 'Email'
    }
  ];

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left Side - Logo and Made with Love */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <RiBrainLine className="text-3xl text-purple-600" /> {/* Changed icon and color to match Navbar */}
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-500 bg-clip-text text-transparent">
                Braineo
              </div>
            </motion.div>
            <motion.p 
              className="flex items-center gap-2 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Made with <RiHeartFill className="text-red-500 animate-pulse" /> by
              <a 
                href="https://braineo.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Team Braineo
                <RiCodeSSlashFill className="w-4 h-4" />
              </a>
            </motion.p>
          </div>

          {/* Right Side - Social Links and Report Bug */}
          <div className="flex items-center gap-6">
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors relative group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {social.icon}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {social.label}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Report Bug Button */}
            <motion.button
              onClick={handleReportBug}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RiFeedbackFill className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Report Bug</span>
            </motion.button>
          </div>
        </div>

        {/* Copyright at Bottom */}
        <motion.p 
          className="text-center text-sm text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          © {new Date().getFullYear()} Braineo. All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
};

export default Footer;
