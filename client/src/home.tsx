import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [roomInput, setRoomInput] = useState('');

  const handleCreateRoom = () => {
    const newRoomId = uuidv4().slice(0, 6); // shorter ID like 'a1b2c3'
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (roomInput.trim() !== '') {
      navigate(`/room/${roomInput}`);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>🧠 Smart Brainstorming App</h1>
      <button onClick={handleCreateRoom} style={{ margin: '1rem' }}>
        🚀 Create New Room
      </button>
      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          style={{ marginRight: '0.5rem' }}
        />
        <button onClick={handleJoinRoom}>🔗 Join Room</button>
      </div>
    </div>
  );
};

export default Home;
