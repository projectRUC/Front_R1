'use client';

import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { UploadedFile } from '../services/filesApi';
import { DesignSprintEvidence, FASE_INFO, FaseDesignSprint } from '@/types/designSprint';

interface PhaseEvidenceFormProps {
  fase: FaseDesignSprint;
  evidence: DesignSprintEvidence | null;
  isLoading: boolean;
  onSubmit: (data: { fase: FaseDesignSprint; archivosUrls: string[]; comentarios?: string }) => Promise<any>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Utilidades
const getMimeTypeFromUrl = (url: string): string => {
  const ext = url.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };
  return mimeMap[ext] || '';
};

const getMimeType = (url: string): string => getMimeTypeFromUrl(url);

const getFileIcon = (url: string): string => {
  const mime = getMimeType(url);
  if (mime.includes('pdf')) return '📄';
  if (mime.includes('word') || mime.includes('document')) return '📝';
  if (mime.includes('excel') || mime.includes('spreadsheet')) return '📊';
  if (mime.includes('powerpoint') || mime.includes('presentation')) return '📽️';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('compressed')) return '🗜️';
  if (mime.includes('video')) return '🎬';
  if (mime.includes('audio')) return '🎵';
  return '📎';
};

const isImage = (url: string): boolean => getMimeType(url).startsWith('image/');
const isVideo = (url: string): boolean => getMimeType(url).startsWith('video/');
const isPDF = (url: string): boolean => getMimeType(url) === 'application/pdf';

const getFileName = (url: string): string => {
  const parts = url.split('/');
  return parts[parts.length - 1] || 'archivo';
};

// Componente para mostrar evidencia guardada
const EvidenceItem: React.FC<{ url: string; index: number; date: string }> = ({ url, index, date }) => {
  const [showPDF, setShowPDF] = useState(false);
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  if (isImage(url)) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group">
        <img src={fullUrl} alt={`Evidencia ${index + 1}`} className="w-full h-48 object-contain cursor-pointer" onClick={() => window.open(fullUrl, '_blank')} />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
          <button onClick={() => window.open(fullUrl, '_blank')} className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm shadow-lg transition-opacity">🔍 Ver completa</button>
        </div>
        <div className="bg-white border-t border-gray-200 px-3 py-2">
          <p className="text-xs text-gray-600 font-medium truncate">Evidencia {index + 1}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
    );
  }

  if (isVideo(url)) {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-black">
        <video src={fullUrl} controls className="w-full h-48 object-contain" preload="metadata">
          Tu navegador no soporta video.
        </video>
        <div className="bg-white border-t border-gray-200 px-3 py-2">
          <p className="text-xs text-gray-600 font-medium truncate">Video {index + 1}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 flex items-center space-x-4">
        <span className="text-4xl">{getFileIcon(url)}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">Evidencia {index + 1}</p>
          <p className="text-xs text-gray-500 mt-0.5">{getFileName(url)}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex items-center space-x-2">
        {isPDF(url) ? (
          <button onClick={() => setShowPDF(!showPDF)} className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
            {showPDF ? '🙈 Ocultar PDF' : '👁️ Ver PDF'}
          </button>
        ) : (
          <button onClick={() => window.open(fullUrl, '_blank')} className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
            👁️ Ver archivo
          </button>
        )}
        <a href={fullUrl} download={getFileName(url)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Descargar</span>
        </a>
      </div>
      {showPDF && (
        <div className="border-t border-gray-200">
          <iframe src={fullUrl} className="w-full h-[500px]" title={`PDF Evidencia ${index + 1}`} />
        </div>
      )}
    </div>
  );
};

// Vista previa en formulario
const PreviewItem: React.FC<{ file: UploadedFile; index: number; onRemove: (index: number) => void }> = ({ file, index, onRemove }) => {
  const fullUrl = file.url.startsWith('http') ? file.url : `${API_BASE_URL}${file.url}`;

  if (file.mimeType.startsWith('image/')) {
    return (
      <div className="relative group">
        <img src={fullUrl} alt={file.originalName} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
        <button onClick={() => onRemove(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <p className="text-xs text-gray-600 mt-1 truncate">{file.originalName}</p>
      </div>
    );
  }

  if (file.mimeType.startsWith('video/')) {
    return (
      <div className="relative group">
        <video src={fullUrl} className="w-full h-32 object-cover rounded-lg border border-gray-200 bg-black" />
        <span className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">🎬</span>
        <button onClick={() => onRemove(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <p className="text-xs text-gray-600 mt-1 truncate">{file.originalName}</p>
      </div>
    );
  }

  return (
    <div className="relative group rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">📎</span>
        <span className="text-xs text-gray-600 truncate">{file.originalName}</span>
      </div>
      <button onClick={() => onRemove(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export const PhaseEvidenceForm: React.FC<PhaseEvidenceFormProps> = ({
  fase,
  evidence,
  isLoading,
  onSubmit,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [comentarios, setComentarios] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faseInfo = FASE_INFO[fase];
  const MAX_FILES = 5;

  const handleFileUploaded = (file: UploadedFile) => {
    if (files.length >= MAX_FILES) {
      setError(`Máximo ${MAX_FILES} evidencias por fase`);
      return;
    }
    setFiles((prev) => [...prev, file]);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Debes agregar al menos una evidencia');
      return;
    }
    setError(null);
    setSuccess(false);
    try {
      await onSubmit({
        fase,
        archivosUrls: files.map((f) => f.url),
        comentarios: comentarios || undefined,
      });
      setSuccess(true);
      setFiles([]);
      setComentarios('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  // Vista solo lectura
  if (evidence) {
    const formattedDate = new Date(evidence.fechaRegistro).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-green-700 font-medium">Fase completada el {formattedDate}</p>
        </div>
        {evidence.comentarios && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Comentarios:</h4>
            <p className="text-gray-600 whitespace-pre-wrap">{evidence.comentarios}</p>
          </div>
        )}
        {evidence.archivosUrls && evidence.archivosUrls.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Evidencias ({evidence.archivosUrls.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidence.archivosUrls.map((url, index) => (
                <EvidenceItem key={index} url={url} index={index} date={formattedDate} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Formulario
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{faseInfo.title} - Día {faseInfo.day} ({faseInfo.dayName})</h3>
          <span className="text-sm text-gray-500">{files.length}/{MAX_FILES} evidencias</span>
        </div>
        <p className="text-gray-600">{faseInfo.description}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Evidencias</label>
        {files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {files.map((file, index) => (
              <PreviewItem key={file._id || index} file={file} index={index} onRemove={handleRemoveFile} />
            ))}
          </div>
        )}
        {files.length < MAX_FILES && <FileUploader onFileUploaded={handleFileUploaded} disabled={isLoading} />}
        {files.length >= MAX_FILES && <p className="text-sm text-amber-600 mt-2">Máximo {MAX_FILES} evidencias</p>}
      </div>

      <div>
        <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-2">Comentarios (opcional)</label>
        <textarea id="comentarios" value={comentarios} onChange={(e) => setComentarios(e.target.value)} maxLength={1000} rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Describe lo realizado en esta fase..." disabled={isLoading} />
        <p className="text-xs text-gray-500 mt-1">{comentarios.length}/1000 caracteres</p>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center space-x-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span>¡Evidencia guardada exitosamente!</span>
        </div>
      )}

      <button onClick={handleSubmit} disabled={isLoading || files.length === 0}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center">
        {isLoading ? (
          <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Guardando...</>
        ) : (
          `Registrar Fase: ${faseInfo.title}`
        )}
      </button>
    </div>
  );
};