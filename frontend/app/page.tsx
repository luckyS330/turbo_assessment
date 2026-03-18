'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import type { Note, NoteListItem, Category } from '@/types';
import { fetchNotes, fetchNote, createNote, fetchCategories } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { NoteCard } from '@/components/NoteCard';
import { NoteEditor } from '@/components/NoteEditor';

export default function HomePage() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) window.location.href = '/login';
  }, []);

  const loadData = useCallback(async () => {
    const [notesResult, catsResult] = await Promise.allSettled([
      fetchNotes({ category: selectedCategoryId ?? undefined }),
      fetchCategories(),
    ]);

    if (notesResult.status === 'fulfilled') {
      setNotes(notesResult.value);
    } else {
      const status = (notesResult.reason as { response?: { status?: number } })?.response?.status;
      if (status === 401) { window.location.href = '/login'; return; }
    }

    if (catsResult.status === 'fulfilled') {
      setCategories(catsResult.value);
    } else {
      const status = (catsResult.reason as { response?: { status?: number } })?.response?.status;
      if (status === 401) { window.location.href = '/login'; return; }
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleSelectNote = async (id: number) => {
    const note = await fetchNote(id);
    setActiveNote(note);
  };

  const handleNewNote = async () => {
    const randomThoughts = categories.find((c) => c.name.toLowerCase() === 'random thoughts');
    const defaultCategoryId = selectedCategoryId ?? randomThoughts?.id ?? null;
    const note = await createNote({ title: '', content: '', category_id: defaultCategoryId });
    setActiveNote(note);
    await loadData();
  };

  const handleNoteUpdated = async (updated: Note) => {
    setActiveNote(updated);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === updated.id
          ? { ...n, title: updated.title, excerpt: updated.content.slice(0, 200), category: updated.category, updated_at: updated.updated_at }
          : n
      )
    );
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch { /* keep existing categories */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: '#FAF1E3' }}>
        <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: '#EF9C66', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden mx-auto" style={{ backgroundColor: '#FAF1E3', maxWidth: '1280px' }}>

      {/* Top bar — full width, height 82px so content starts at y≈101px */}
      {!activeNote && (
        <div
          className="flex items-center justify-end shrink-0"
          style={{ height: '82px', paddingRight: '24px' }}
        >
          <button
            onClick={handleNewNote}
            className="flex items-center justify-center transition-all active:scale-95"
            style={{
              gap: '6px',
              width: '133px',
              height: '43px',
              borderRadius: '46px',
              border: '1px solid #957139',
              color: '#957139',
              backgroundColor: 'transparent',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 700,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(149,113,57,0.20)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Plus size={14} strokeWidth={2.5} />
            New Note
          </button>
        </div>
      )}

      {/* Body row: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — only when not editing */}
        {!activeNote && (
          <Sidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => { setSelectedCategoryId(id); setActiveNote(null); }}
          />
        )}

        {/* Content area */}
        {activeNote ? (
          <div className="flex-1 overflow-hidden">
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              categories={categories}
              onNoteUpdated={handleNoteUpdated}
              onBack={() => setActiveNote(null)}
            />
          </div>

        ) : notes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <img src="/boba.png" alt="Empty" style={{ width: '297px', height: '296px', objectFit: 'contain' }} />
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#88642A',
              marginTop: '8px',
            }}>
              I&apos;m just here waiting for your charming notes...
            </p>
          </div>

        ) : (
          <div className="flex-1 overflow-y-auto" style={{ padding: '16px 8px 16px 8px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '13px' }}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleSelectNote(note.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
