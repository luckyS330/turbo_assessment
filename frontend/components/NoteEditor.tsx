'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Note, Category } from '@/types';
import { updateNote } from '@/lib/api';

interface Props {
  note: Note;
  categories: Category[];
  onNoteUpdated: (note: Note) => void;
  onDelete?: (id: number) => void;
  onBack?: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return d;
}

/** "Last Edited: July 21, 2024 at 8:39pm" */
function formatLastEdited(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  return `Last Edited: ${date} at ${time}`;
}

export function NoteEditor({ note, categories, onNoteUpdated, onDelete, onBack }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [categoryId, setCategoryId] = useState<number | null>(note.category?.id ?? null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const isFirstRender = useRef(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setCategoryId(note.category?.id ?? null);
    isFirstRender.current = true;
  }, [note.id]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    save({ title: debouncedTitle, content: debouncedContent });
  }, [debouncedTitle, debouncedContent]);

  const save = useCallback(async (payload: Parameters<typeof updateNote>[1]) => {
    const updated = await updateNote(note.id, payload);
    onNoteUpdated(updated);
  }, [note.id, onNoteUpdated]);

  const handleCategoryChange = async (id: number | null) => {
    setCategoryId(id);
    setShowCategoryMenu(false);
    const updated = await updateNote(note.id, { category_id: id });
    onNoteUpdated(updated);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowCategoryMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentCategory = categories.find((c) => c.id === categoryId) ?? null;
  const color = currentCategory?.color ?? '#D6C5B0';
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const cardBg = `rgba(${r},${g},${b},0.5)`;

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: '#FAF1E3' }}
    >
      {/* Toolbar — 84px tall to match Figma card Top: 84px */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ height: '84px', paddingLeft: '37px', paddingRight: '44px' }}
      >

        {/* Category dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 transition-colors"
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              border: '1px solid #957139',
              borderRadius: showCategoryMenu ? '8px 8px 0 0' : '8px',
              borderBottom: showCategoryMenu ? '1px solid transparent' : '1px solid #957139',
              minWidth: '160px',
            }}
          >
            <span
              className="rounded-full shrink-0"
              style={{ width: '11px', height: '11px', backgroundColor: currentCategory?.color ?? '#C8B8A8' }}
            />
            <span
              className="flex-1 text-left"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#000' }}
            >
              {currentCategory?.name ?? 'No Category'}
            </span>
            <ChevronDown size={13} style={{ color: '#957139', flexShrink: 0 }} />
          </button>

          {showCategoryMenu && (
            <div
              className="absolute left-0 z-50 overflow-hidden"
              style={{
                width: '100%',
                backgroundColor: '#FAF1E3',
                border: '1px solid #957139',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
              }}
            >
              {/* Other categories (exclude current) */}
              {categories
                .filter((c) => c.id !== categoryId)
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className="w-full flex items-center gap-2 text-left transition-colors hover:bg-black/5"
                    style={{ padding: '8px 14px' }}
                  >
                    <span className="rounded-full shrink-0" style={{ width: '11px', height: '11px', backgroundColor: cat.color }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#000' }}>
                      {cat.name}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* X — close / back to list */}
        <button
          onClick={onBack}
          className="transition-opacity hover:opacity-60"
          style={{ color: '#957139', lineHeight: 0 }}
          title="Close"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
      </div>

      {/* Note card — Figma: Left 37px, Right 44px, Bottom 48px */}
      <div className="flex-1 overflow-hidden" style={{ paddingLeft: '37px', paddingRight: '44px', paddingBottom: '48px' }}>
        <div
          className="flex flex-col h-full overflow-y-auto"
          style={{
            backgroundColor: cardBg,
            border: `3px solid ${color}`,
            borderRadius: '11px',
            padding: '39px 64px 64px 64px',
            gap: '24px',
            boxShadow: '1px 1px 2px rgba(0,0,0,0.25)',
          }}
        >
          {/* Last edited — top right */}
          <div className="flex justify-end shrink-0">
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: 'rgba(0,0,0,0.5)' }}>
              {formatLastEdited(note.updated_at)}
            </span>
          </div>

          {/* Title */}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            rows={1}
            className="w-full bg-transparent border-none outline-none resize-none placeholder-black/30"
            style={{
              fontFamily: '"Inria Serif", Georgia, serif',
              fontSize: '24px',
              fontWeight: 700,
              lineHeight: '130%',
              color: '#000',
              fieldSizing: 'content',
            } as React.CSSProperties}
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pour your heart out..."
            className="flex-1 w-full bg-transparent border-none outline-none resize-none placeholder-black/30"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '170%',
              color: '#000',
              minHeight: '200px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
