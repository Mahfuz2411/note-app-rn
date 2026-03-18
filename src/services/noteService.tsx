import type { Note } from '../types/app';

export function hashPin(pin: string): string {
  let hash = 17;
  for (let i = 0; i < pin.length; i += 1) {
    hash = hash * 31 + pin.charCodeAt(i);
  }
  return `h${Math.abs(hash)}`;
}

export function createId(): string {
  const now = Date.now();
  return `${now}-${Math.random().toString(36).slice(2, 8)}`;
}

export function plainPreview(markdownText: string): string {
  return markdownText
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export function sortAndFilterNotes(notes: Note[], query: string): Note[] {
  const lowered = query.trim().toLowerCase();
  const filtered = lowered
    ? notes.filter(
        note =>
          note.title.toLowerCase().includes(lowered) ||
          note.content.toLowerCase().includes(lowered),
      )
    : notes;

  return [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
}
