'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Cargando información escolar...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8">
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Aro externo con rotación */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-purple-500 border-l-transparent shadow-lg shadow-indigo-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* Aro interno inverso */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-transparent border-l-cyan-500"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Centro luminoso */}
        <motion.div
          className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-xs shadow-md shadow-purple-500/50"
          animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <motion.p
        className="mt-6 text-sm font-semibold tracking-wide text-gray-600 dark:text-gray-300 animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
};
