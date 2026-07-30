"use client";

import { useState, useCallback, ChangeEvent } from "react";

interface ImageBase64UploaderProps {
  label?: string;
  multiple?: boolean;
  onChange: (files: File[], previews: string[]) => void;
}

export function ImageBase64Uploader({
  label = "Subir evidencia",
  multiple = false,
  onChange,
}: ImageBase64UploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const newFiles = Array.from(fileList);
      const lecturas = newFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader(); // 👈 Solo una declaración
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

      Promise.all(lecturas).then((base64Previews) => {
        const updatedFiles = multiple ? [...selectedFiles, ...newFiles] : newFiles;
        const updatedPreviews = multiple ? [...previews, ...base64Previews] : base64Previews;

        setSelectedFiles(updatedFiles);
        setPreviews(updatedPreviews);
        onChange(updatedFiles, updatedPreviews);
      });

      // Limpia el input para permitir volver a seleccionar la misma imagen si se desea
      e.target.value = "";
    },
    [multiple, selectedFiles, previews, onChange]
  );

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);

    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onChange(updatedFiles, updatedPreviews);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFiles}
        className="text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-sm hover:file:bg-gray-50 cursor-pointer"
      />
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`Previsualización ${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition shadow"
                title="Eliminar foto seleccionada"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}