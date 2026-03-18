'use client';

import type { NoteListItem } from '@/types';
import { formatNoteDate } from '@/lib/date';

interface Props {
  note: NoteListItem;
  onClick: () => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function NoteCard({ note, onClick }: Props) {
  const color = note.category?.color ?? '#C8B8A8';

  return (
    <button
      onClick={onClick}
      className="text-left shrink-0"
      style={{
        width: '303px',
        height: '246px',
        minHeight: '246px',
        maxHeight: '246px',
        backgroundColor: hexToRgba(color, 0.5),
        border: `3px solid ${color}`,
        borderRadius: '11px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '1px 1px 2px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header: date (bold) + category (regular) — Inter 12px */}
      <div className="shrink-0" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, lineHeight: '100%', color: '#000000' }}>
          {formatNoteDate(note.updated_at)}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, lineHeight: '100%', color: '#000000' }}>
          {note.category?.name ?? ''}
        </span>
      </div>

      {/* Title — Inria Serif 24px Bold, no grow */}
      <h3
        className="shrink-0"
        style={{
          fontFamily: '"Inria Serif", Georgia, serif',
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: '110%',
          color: '#000000',
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}
      >
        {note.title || <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#555' }}>Untitled</span>}
      </h3>

      {/* Content — Inter 12px Regular, fills remaining space, clipped */}
      {note.excerpt && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '160%',
            color: '#000000',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            flex: 1,
            minHeight: 0,
          }}
        >
          {note.excerpt}
        </p>
      )}
    </button>
  );
}
