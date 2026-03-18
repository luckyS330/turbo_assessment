import axios from 'axios';
import type { Note, NoteListItem, Category, PaginatedResponse, User } from '@/types';

const API_BASE = typeof window !== 'undefined'
  ? 'http://localhost:8000/api'
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request (skip for auth endpoints)
api.interceptors.request.use((config) => {
  const url = config.url ?? '';
  const isAuthEndpoint = url.includes('/auth/register') || url.includes('/auth/login');
  if (!isAuthEndpoint && typeof window !== 'undefined') {
    const cookieMatch = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export async function register(email: string, password: string) {
  const { data } = await api.post('/auth/register/', { email, password });
  return data as { user: User; access: string; refresh: string };
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login/', { username: email, password });
  return data as { access: string; refresh: string };
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me/');
  return data;
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories/');
  return data.results;
}

// Notes
export interface NoteFilters {
  category?: number;
}

export async function fetchNotes(filters: NoteFilters = {}): Promise<NoteListItem[]> {
  const params: Record<string, string> = {};
  if (filters.category) params.category = String(filters.category);
  const { data } = await api.get<PaginatedResponse<NoteListItem>>('/notes/', { params });
  return data.results;
}

export async function fetchNote(id: number): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}/`);
  return data;
}

export async function createNote(payload: { title?: string; content?: string; category_id?: number | null }): Promise<Note> {
  const { data } = await api.post<Note>('/notes/', payload);
  return data;
}

export async function updateNote(id: number, payload: { title?: string; content?: string; category_id?: number | null }): Promise<Note> {
  const { data } = await api.patch<Note>(`/notes/${id}/`, payload);
  return data;
}

export async function deleteNote(id: number): Promise<void> {
  await api.delete(`/notes/${id}/`);
}
