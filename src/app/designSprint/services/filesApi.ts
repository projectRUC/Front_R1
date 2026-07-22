const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface UploadedFile {
  _id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
}

export async function uploadFile(file: File, category = 'evidencias'): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const response = await fetch(`${API_BASE_URL}/files/upload`, { method: 'POST', body: formData });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al subir archivo');
  }
  return response.json();
}