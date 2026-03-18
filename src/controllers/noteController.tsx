import { createId, hashPin } from '../services/noteService';
import { getStoredNotes, getStoredSettings, setStoredNotes, setStoredSettings } from '../services/storageService';
import { defaultThemeId } from '../theme/themes';
import type { Note, ThemeId } from '../types/app';
import { validateNote, validatePin } from '../validation/noteValidation';

type SaveNoteInput = {
  notes: Note[];
  currentNoteId: string | null;
  titleInput: string;
  contentInput: string;
  protectEnabled: boolean;
  pinInput: string;
};

type SaveNoteResult = {
  ok: boolean;
  notes?: Note[];
  error?: string;
};

export async function loadInitialState(): Promise<{ notes: Note[]; themeId: ThemeId }> {
  const [notes, settings] = await Promise.all([getStoredNotes(), getStoredSettings()]);
  const themeId = settings?.themeId ?? defaultThemeId;
  return { notes, themeId };
}

export async function saveTheme(themeId: ThemeId): Promise<void> {
  await setStoredSettings({ themeId });
}

export async function saveNote(input: SaveNoteInput): Promise<SaveNoteResult> {
  const {
    notes,
    currentNoteId,
    titleInput,
    contentInput,
    protectEnabled,
    pinInput,
  } = input;

  const noteError = validateNote(titleInput, contentInput);
  if (noteError) {
    return { ok: false, error: noteError };
  }

  const isEditing = Boolean(currentNoteId);
  const existing = notes.find(note => note.id === currentNoteId);
  const pinError = validatePin(protectEnabled, pinInput, isEditing, Boolean(existing?.pinHash));
  if (pinError) {
    return { ok: false, error: pinError };
  }

  const now = Date.now();
  const title = titleInput.trim() || 'Untitled';
  const content = contentInput.trim();

  if (currentNoteId) {
    const nextPinHash = protectEnabled
      ? pinInput
        ? hashPin(pinInput)
        : existing?.pinHash
      : undefined;

    const nextNotes = notes.map(note =>
      note.id === currentNoteId
        ? {
            ...note,
            title,
            content,
            pinHash: nextPinHash,
            updatedAt: now,
          }
        : note,
    );

    await setStoredNotes(nextNotes);
    return { ok: true, notes: nextNotes };
  }

  const newNote: Note = {
    id: createId(),
    title,
    content,
    updatedAt: now,
    pinHash: protectEnabled ? hashPin(pinInput) : undefined,
  };

  const nextNotes = [newNote, ...notes];
  await setStoredNotes(nextNotes);
  return { ok: true, notes: nextNotes };
}

export async function deleteNote(notes: Note[], noteId: string): Promise<Note[]> {
  const nextNotes = notes.filter(note => note.id !== noteId);
  await setStoredNotes(nextNotes);
  return nextNotes;
}

export function unlockProtectedNote(note: Note, enteredPin: string): boolean {
  if (!note.pinHash) {
    return true;
  }
  return hashPin(enteredPin) === note.pinHash;
}
