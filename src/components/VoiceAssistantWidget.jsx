import React from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const VoiceAssistantWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the FAB on the voice assistant page itself
  if (location.pathname === '/voice-assistant') return null;

  return (
    <motion.button
      onClick={() => navigate('/voice-assistant')}
      className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300"
      style={{
        backgroundColor: '#2563eb',
        color: '#ffffff',
        boxShadow: '0 8px 30px rgba(37, 99, 235, 0.4)',
      }}
      whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8' }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
      title="Voice Assistant"
    >
      <Phone className="w-6 h-6" />
      <span className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ backgroundColor: '#60a5fa' }} />
    </motion.button>
  );
};

export default VoiceAssistantWidget;
