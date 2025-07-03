import React, { useState, useRef, useEffect } from 'react';
import StickyNote from './components/StickyNote';
import { DndContext } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import socket from './socket'; // ✅ Added for real-time sync
import { useParams } from 'react-router-dom'; // ✅ Room support



interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  user: string;
}

const App: React.FC = () => {
  const { roomId } = useParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [copied, setCopied] = useState(false);


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [toolColor, setToolColor] = useState<string>('#000');
  const [toolSize, setToolSize] = useState<number>(2);

  const [username] = useState<string>(() => {
    const stored = localStorage.getItem('username');
    if (stored) return stored;
    const name = prompt('Enter your username') || `User-${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('username', name);
    return name;
  });

  const [userColors, setUserColors] = useState<{ [user: string]: string }>({});

  const getPastelColor = (seed: string) => {
    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 80%, 85%)`;
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const ensureColorForUser = (name: string) => {
    setUserColors((prev) => {
      if (prev[name]) return prev;
      return { ...prev, [name]: getPastelColor(name) };
    });
  };

  useEffect(() => {
    if (roomId) {
      socket.emit('join-room', roomId);
    }
  }, [roomId]);

  const handleAddNote = () => {
    ensureColorForUser(username);
    const newNote: Note = {
      id: uuidv4(),
      content: '',
      x: Math.random() * 600,
      y: Math.random() * 300,
      user: username,
    };
    setNotes((prevNotes) => [...prevNotes, newNote]);
    socket.emit('note-added', newNote);
  };

  const handleNoteChange = (id: string, newContent: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, content: newContent } : note))
    );
    socket.emit('note-updated', { id, content: newContent });
  };

  const handleNoteDelete = (id: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    socket.emit('note-deleted', id);
  };

  const handleDragEnd = (event: any) => {
    const { active, delta } = event;
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === active.id
          ? { ...note, x: note.x + delta.x, y: note.y + delta.y }
          : note
      )
    );
    socket.emit('note-moved', { id: active.id, delta });
  };

  useEffect(() => {
    socket.on('note-added', (note: Note) => {
      if (note.user !== username) {
        ensureColorForUser(note.user);
        setNotes((prev) => [...prev, note]);
      }
    });

    socket.on('note-updated', ({ id, content }) => {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, content } : note))
      );
    });

    socket.on('note-deleted', (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    });

    socket.on('note-moved', ({ id, delta }) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, x: note.x + delta.x, y: note.y + delta.y } : note
        )
      );
    });

    socket.on('draw-line', ({ from, to, color, size }) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    });

    return () => {
      socket.off('note-added');
      socket.off('note-updated');
      socket.off('note-deleted');
      socket.off('note-moved');
      socket.off('draw-line');
    };
  }, [username]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    lastPosition.current = { x, y };
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = toolColor;
      ctx.lineWidth = toolSize;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      socket.emit('draw-line', {
        from: lastPosition.current,
        to: { x, y },
        color: toolColor,
        size: toolSize,
      });
      lastPosition.current = { x, y };
    }
  };

  const stopDraw = () => {
    isDrawing.current = false;
  };

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, [showWhiteboard]);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', background: '#f0f0f0' }}>
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 10,
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: '#f0f0f0aa',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
        }}
      >
        <button
          onClick={handleCopyLink}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#6366f1', // Indigo
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Copy Room Link
        </button>

        {copied && (
          <span style={{ color: '#16a34a', fontWeight: 500 }}>
            ✅ Link Copied!
          </span>
        )}

        <button
          onClick={handleAddNote}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add Note
        </button>

        {!showWhiteboard ? (
          <button
            onClick={() => setShowWhiteboard(true)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Show Whiteboard
          </button>
          
        ) : (
          <>
            <button
              onClick={() => setShowWhiteboard(false)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Remove Whiteboard
            </button>
            
            <label>🖍️ Color:</label>
            <input
              type="color"
              value={toolColor}
              onChange={(e) => setToolColor(e.target.value)}
            />
            <label>✏️ Size:</label>
            <input
              type="range"
              min={1}
              max={10}
              value={toolSize}
              onChange={(e) => setToolSize(Number(e.target.value))}
            />
          </>
        )}
      </div>

      {showWhiteboard && (
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            background: 'white',
          }}
        />
      )}

      <DndContext onDragEnd={handleDragEnd}>
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            id={note.id}
            content={note.content}
            x={note.x}
            y={note.y}
            user={note.user}
            color={userColors[note.user] || '#FEF08A'}
            onChange={handleNoteChange}
            onDelete={handleNoteDelete}
          />
        ))}
      </DndContext>
    </div>
  );
};

export default App;
