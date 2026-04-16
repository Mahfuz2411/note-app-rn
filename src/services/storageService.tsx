import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Folder, Note } from '../types/app';

const NOTES_STORAGE_KEY = 'notes-app-items-v3';
const SETTINGS_STORAGE_KEY = 'notes-app-settings-v2';
const FOLDERS_STORAGE_KEY = 'notes-app-folders-v1';

export async function getStoredNotes(): Promise<Note[]> {
  const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as Note[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function setStoredNotes(notes: Note[]): Promise<void> {
  await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export async function getStoredSettings(): Promise<AppSettings | null> {
  const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as AppSettings;
}

export async function setStoredSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export async function getStoredFolders(): Promise<Folder[]> {
  const raw = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as Folder[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function setStoredFolders(folders: Folder[]): Promise<void> {
  await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
}
