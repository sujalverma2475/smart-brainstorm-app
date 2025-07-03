import { io } from 'socket.io-client';

const roomId = window.location.pathname.split("/").pop(); // fallback for non-router files
const socket = io('http://localhost:4000', {
  query: { roomId }
});

export default socket;
