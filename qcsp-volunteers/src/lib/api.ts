// API configuration - uses relative URL in production, localhost in development
const isDev = import.meta.env.DEV;
// In production, API is accessed via /volunteers/api/ path through nginx proxy
export const API_BASE_URL = isDev ? 'http://localhost:3001' : '/volunteers';
export const API_URL = `${API_BASE_URL}/api/data`;
