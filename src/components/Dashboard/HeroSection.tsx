'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { useUser } from '@/context/UserContext';

interface HeroSectionProps {
  onScrollToScrum: () => void;
  onScrollToKanban: () => void;
  onScrollDown: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToScrum, onScrollToKanban, onScrollDown }) => {
  const { user } = useUser();
  const isDocente = user?.rol === 'Docente';

  const greeting = isDocente ? 'Hora de trabajar' : 'Otra vez de vuelta';
  const userName = user?.nombre || 'Usuario';

  return (
    <div className="relative w-full h-[calc(100vh-73px)] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/Images/backgraund.jpg')" }}
      />
      {/* Blue Overlay */}
      <div className="absolute inset-0 bg-blue-900/70 mix-blend-multiply" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl md:text-2xl text-blue-100 font-medium mb-2 tracking-wide"
        >
          {greeting}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black text-white mb-12 drop-shadow-lg"
        >
          {userName.toUpperCase()}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 w-full max-w-lg"
        >
          <Button
            size="lg"
            variant="primary"
            className="flex-1 font-bold text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-3"
            onPress={onScrollToScrum}
          >
            Scrum
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 font-bold text-lg bg-sky-600 hover:bg-sky-500 text-white rounded-2xl py-3"
            onPress={onScrollToKanban}
          >
            Kanban
          </Button>
        </motion.div>
      </div>

      {/* Scroll Down Button */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20"
      >
        <Button
          size="lg"
          variant="outline"
          className="bg-white/50 border-white/70 text-white hover:bg-white/60 w-14 h-14 rounded-full flex items-center justify-center p-0"
          onPress={onScrollDown}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </Button>
      </motion.div>
    </div>
  );
};
