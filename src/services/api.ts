import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// BLINDAJE HTTPS
// Verificamos estrictamente que en producción la URL apunte a un protocolo seguro (HTTPS / TLS 1.3)
if (process.env.NODE_ENV === 'production' && !API_URL.startsWith('https://')) {
    throw new Error("SECURITY POLICY VIOLATION: La variable NEXT_PUBLIC_API_URL debe usar estrictamente HTTPS en producción. El despliegue ha sido abortado por seguridad.");
}

// Creamos la instancia centralizada para que todo el FrontEnd la use
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Nota para el equipo: Aquí se pueden agregar los interceptores para inyectar el JWT en el futuro
/*
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
*/

export default api;