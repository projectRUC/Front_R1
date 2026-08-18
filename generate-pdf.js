const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('public/aviso-privacidad.pdf'));

// Add some nice styling
doc.fontSize(20).font('Helvetica-Bold').text('Aviso de Privacidad Integral', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(14).font('Helvetica').text('Sistema Escolar PAEC — Plataforma de Gestión Académica', { align: 'center' });
doc.moveDown(2);

// Body
doc.fontSize(12).font('Helvetica-Bold').text('I. Identidad y Domicilio del Responsable del Tratamiento');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').text('En cumplimiento con la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO) y demás normativas aplicables, el Sistema Escolar PAEC pone a su disposición el presente Aviso de Privacidad Integral.', { align: 'justify' });
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').text('II. Datos Personales que se Recaban');
doc.moveDown(0.5);
doc.font('Helvetica').text('- Datos de identificación: Nombre completo, fecha de nacimiento, matrícula escolar.');
doc.text('- Datos de contacto: Correo electrónico institucional o personal.');
doc.text('- Datos de acceso y sesión: Nombre de usuario, contraseña cifrada.');
doc.text('- Datos académicos: Historial de calificaciones, materias inscritas.');
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').text('III. Finalidades del Tratamiento');
doc.moveDown(0.5);
doc.font('Helvetica').text('Registro, autenticación y administración de la cuenta de estudiantes, profesores y administrativos. Gestión académica (calificaciones, pase de lista, materias). Auditoría de las interacciones para garantizar la seguridad del proceso educativo.', { align: 'justify' });
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').text('IV. Medidas de Seguridad Implementadas');
doc.moveDown(0.5);
doc.font('Helvetica').text('PAEC implementa medidas de seguridad técnicas y administrativas para proteger sus datos personales: Cifrado HTTPS/TLS, contraseñas seguras, tokens JWT, y control de acceso por roles (ALUMNO, PROFESOR, ADMINISTRADOR).', { align: 'justify' });
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').text('V. Derechos ARCO');
doc.moveDown(0.5);
doc.font('Helvetica').text('Como titular de los datos, usted tiene derechos de Acceso, Rectificación, Cancelación y Oposición. Para ejercerlos, envíe una solicitud a privacidad@paec.edu.mx con el asunto "Solicitud ARCO". PAEC responderá en un plazo máximo de 20 días hábiles.', { align: 'justify' });

doc.end();
console.log("PDF generado correctamente.");
