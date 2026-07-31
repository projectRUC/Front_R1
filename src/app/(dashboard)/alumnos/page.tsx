import { Metadata } from 'next';
import { AlumnosDirectoryView } from '@/modules/alumnos/components/AlumnosDirectoryView';

export const metadata: Metadata = {
  title: 'Padrón de Alumnos | Sistema Escolar PAEC',
  description: 'Directorio general de alumnos de la institución.',
};

export default function AlumnosPage() {
  return <AlumnosDirectoryView />;
}
