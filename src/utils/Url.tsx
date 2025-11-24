
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.') || window.location.hostname.startsWith('10.');

export const Url: string = isLocalhost
    ? 'http://localhost:5000/api'               
    : 'https://eieca-attend-api.vercel.app/api'; 
