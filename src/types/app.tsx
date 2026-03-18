export type ThemeId = 'ocean' | 'sunset' | 'forest' | 'midnight';
export type Screen = 'home' | 'detail' | 'theme' | 'settings';

export type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  pinHash?: string;
};

export type AppSettings = {
  themeId: ThemeId;
};

export type AppTheme = {
  id: ThemeId;
  name: string;
  accent: string;
  accentSoft: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  modalOverlay: string;
};
