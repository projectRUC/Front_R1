'use client';

import React, { useState, useRef } from 'react';
import { uploadFile, UploadedFile } from '../services/filesApi';

interface FileUploaderProps {
  onFileUploaded: (file: UploadedFile) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Validar tamaño (10MB para files/upload)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('El archivo no debe superar los 10MB');
      }

      // Generar preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }

      // Subir al backend
      const result = await uploadFile(file);
      setUploadedFile(result);
      onFileUploaded(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir archivo';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !disabled) handleFile(file);
  };

  const isImage = uploadedFile?.mimeType?.startsWith('image/');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (uploadedFile) {
    return (
      <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        {isImage ? (
          <img
            src={`${API_BASE_URL}${uploadedFile.url}`}
            alt={uploadedFile.originalName}
            className="w-full h-64 object-contain bg-gray-100"
          />
        ) : (
          <div className="p-6 flex items-center space-x-4">
            <span className="text-5xl">📎</span>
            <div>
              <p className="font-medium truncate">{uploadedFile.originalName}</p>
              <p className="text-sm text-gray-500">{formatSize(uploadedFile.size)}</p>
            </div>
          </div>
        )}
        <div className="bg-white border-t px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-green-600">✅ Subido</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm bg-white border px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            Cambiar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" disabled={disabled} />
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer min-h-[200px] flex flex-col items-center justify-center
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Subiendo archivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-gray-700 font-medium">Arrastra y suelta tu archivo</p>
              <p className="text-gray-500 text-sm mt-1">o haz clic para seleccionar</p>
              <p className="text-gray-400 text-xs mt-2">Imágenes, PDF, Word, Excel, videos • Máx. 10MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};