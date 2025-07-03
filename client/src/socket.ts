import { io } from 'socket.io-client';

const roomId = window.location.pathname.split("/").pop(); // fallback for non-router files
const socket = io('https://smart-brainstorm-app-1.onrender.com/', {
  query: { roomId }
});

export default socket;
