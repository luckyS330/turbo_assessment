export interface User {
  id: number;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;      // accent color (dot, badge)
  bg_color: string;   // note card / editor background
  note_count: number;
}

export interface NoteListItem {
  id: number;
  title: string;
  excerpt: string;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: Category | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
