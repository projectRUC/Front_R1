'use client';

import React from 'react';
import { Evidence } from '@/types/designSprint';
interface EvidenceCardProps {
  evidence: Evidence;
  onDelete?: (id: string) => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <img
          src={evidence.imageBase64}
          alt={`Evidencia fase ${evidence.phase}`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {onDelete && (
          <button
            onClick={() => onDelete(evidence.id)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Eliminar evidencia"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-4">
        {evidence.description && (
          <p className="text-gray-700 text-sm mb-2">{evidence.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(evidence.createdAt)}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
            {evidence.phase}
          </span>
        </div>
      </div>
    </div>
  );
};