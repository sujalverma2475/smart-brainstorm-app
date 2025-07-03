import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface StickyNoteProps {
  id: string;
  content: string;
  x: number;
  y: number;
  user: string;
  color: string;
  onChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

const darkenColor = (color: string, percent: number): string => {
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return color;
  const [_, h, s, l] = match.map(Number);
  const newL = Math.max(l - percent, 0);
  return `hsl(${h}, ${s}%, ${newL}%)`;
};

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  content,
  x,
  y,
  user,
  color,
  onChange,
  onDelete,
  isOverlay = false,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const translateX = (transform?.x ?? 0) + x;
  const translateY = (transform?.y ?? 0) + y;

  const style: React.CSSProperties = {
    transform: `translate(${translateX}px, ${translateY}px)`,
    position: 'absolute',
    width: '12rem',
    height: '12rem',
    backgroundColor: color,
    borderRadius: '0.5rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.2)',
    fontFamily: 'sans-serif',
    fontSize: '1rem',
    pointerEvents: isOverlay ? 'none' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    zIndex: isOverlay ? 999 : 'auto',
    opacity: isOverlay ? 0.9 : 1,
  };

  const topBarColor = darkenColor(color, 15);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        style={{
          height: '1.5rem',
          backgroundColor: topBarColor,
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: isOverlay ? 'none' : 'auto',
        }}
      >
        <div
          {...listeners}
          {...attributes}
          style={{
            height: '100%',
            flex: 1,
            cursor: isOverlay ? 'grabbing' : 'grab',
            paddingLeft: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          {user}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            color: '#b91c1c',
            padding: '0 0.5rem',
          }}
        >
          ×
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(id, e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          outline: 'none',
          padding: '0.5rem',
          pointerEvents: isOverlay ? 'none' : 'auto',
        }}
      />
    </div>
  );
};

export default StickyNote;
