export type BookRow = {
  index: number;
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
};

export type BookDetails = {
  index: number;
  title: string;
  authors: string[];
  publisher: string;
  coverUrl: string;
  likes: number;
  reviews: { reviewer: string; text: string }[];
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000';

export async function fetchBooks(params: { region: string; seed: number; likes: number; reviews: number; page: number; size: number; }): Promise<BookRow[]> {
  const url = new URL('/api/books', API_BASE);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function fetchDetails(params: { region: string; seed: number; likes: number; reviews: number; index: number; }): Promise<BookDetails> {
  const url = new URL('/api/book/details', API_BASE);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch details');
  return res.json();
}

export function exportCsv(params: { region: string; seed: number; likes: number; reviews: number; total: number; }) {
  const url = new URL('/api/export.csv', API_BASE);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));
  window.location.href = url.toString();
}