import React from 'react';
import { Alumno } from '../types';

interface AlumnosTableProps {
  data: Alumno[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AlumnosTable: React.FC<AlumnosTableProps> = ({
  data,
  isLoading,
  page,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="min-h-[400px] w-full overflow-x-auto shadow-lg rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
              <th className="p-4 px-6">ALUMNO</th>
              <th className="p-4 px-6">GRUPO</th>
              <th className="p-4 px-6">EQUIPO/PROYECTO</th>
              <th className="p-4 px-6">ROL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium text-gray-500">Cargando alumnos...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                  No se encontraron alumnos con los filtros actuales.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 px-6">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <img 
                          src={item.avatarUrl} 
                          alt={item.nombre} 
                          className="w-8 h-8 rounded-full flex-shrink-0 object-cover bg-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {item.nombre.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{item.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.grupo}
                    </span>
                  </td>
                  <td className="p-4 px-6">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{item.equipoProyecto}</span>
                  </td>
                  <td className="p-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.rol === 'Líder' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300'}`}>
                      {item.rol === 'Líder' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      )}
                      {item.rol !== 'Líder' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      )}
                      {item.rol}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación nativa */}
      {!isLoading && totalPages > 1 && (
        <div className="flex w-full justify-center mt-2">
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
            <button 
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isSelected = page === pageNum;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      isSelected 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
