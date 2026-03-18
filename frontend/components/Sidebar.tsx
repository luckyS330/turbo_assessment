'use client';

import { LogOut } from 'lucide-react';
import type { Category } from '@/types';
import { clearTokens } from '@/lib/auth';

interface Props {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function Sidebar({ categories, selectedCategoryId, onSelectCategory }: Props) {
  const handleLogout = () => {
    clearTokens();
    window.location.href = '/login';
  };

  return (
    <aside
      className="flex flex-col h-full shrink-0"
      style={{ width: '311px', backgroundColor: '#FAF1E3' }}
    >
      {/* Categories frame — 256px wide, starts at Left:23 Top:19 (82px topbar + 19 = 101px from page top) */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingLeft: '23px', paddingTop: '19px', paddingRight: '32px', paddingBottom: '16px' }}
      >
        {/* "All Categories" heading */}
        <p
          onClick={() => onSelectCategory(null)}
          className="cursor-pointer"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            color: '#000000',
            marginBottom: '16px',
            lineHeight: '100%',
          }}
        >
          All Categories
        </p>

        {/* Category items — dot + name + count, Inter 12px */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.filter((cat) => cat.note_count > 0).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="w-full flex items-center text-left transition-opacity hover:opacity-60"
              style={{ gap: '8px' }}
            >
              <span
                className="rounded-full shrink-0"
                style={{ width: '11px', height: '11px', backgroundColor: cat.color }}
              />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: selectedCategoryId === cat.id ? 700 : 400,
                  color: '#000000',
                  flex: 1,
                  lineHeight: '100%',
                }}
              >
                {cat.name}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#000000',
                  lineHeight: '100%',
                }}
              >
                {cat.note_count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div style={{ paddingLeft: '23px', paddingBottom: '24px' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#957139' }}
        >
          <LogOut size={12} />
          Log out
        </button>
      </div>
    </aside>
  );
}
