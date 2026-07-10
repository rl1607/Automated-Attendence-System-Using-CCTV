// Frontend configuration endpoints
const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || `http://${host}:5000`;
export const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || `http://${host}:5000`;
