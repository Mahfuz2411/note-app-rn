import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ThemedButton from './src/components/ThemedButton';
import {
  createFolder,
  deleteFolder,
  deleteMultipleNotes,
  deleteNote,
  loadInitialState,
  moveNotesToFolder,
  saveNote,
  saveTheme,
  unlockProtectedNote,
} from './src/controllers/noteController';
import { guardedAsync } from './src/middleware/errorMiddleware';
import { sortAndFilterNotes } from './src/services/noteService';
import DetailScreen from './src/screens/DetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import ThemeScreen from './src/screens/ThemeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { defaultThemeId, THEMES } from './src/theme/themes';
import type { Folder, Note, Screen, ThemeId } from './src/types/app';
import { validatePin } from './src/validation/noteValidation';

type DetailMode = 'view' | 'edit';

type EditorSnapshot = {
  title: string;
  content: string;
};

function AppRoot() {
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<Screen>('home');
  const [showSplash, setShowSplash] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [themeId, setThemeId] = useState<ThemeId>(defaultThemeId);
  const [query, setQuery] = useState('');
  const [globalError, setGlobalError] = useState('');

  const [detailMode, setDetailMode] = useState<DetailMode>('view');
  const [historyPast, setHistoryPast] = useState<EditorSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorSnapshot[]>([]);

  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [protectEnabled, setProtectEnabled] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [editorError, setEditorError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [targetNote, setTargetNote] = useState<Note | null>(null);
  const [unlockPin, setUnlockPin] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const theme = THEMES[themeId];
  const topSpacing = insets.top;
  const bottomSpacing = insets.bottom;

  useEffect(() => {
    const boot = async () => {
      const loaded = await guardedAsync(loadInitialState, setGlobalError);
      if (loaded) {
        setNotes(loaded.notes);
        setThemeId(loaded.themeId);
        setFolders(loaded.folders);
      }
      setIsBooting(false);
    };

    boot().catch(() => {
      setIsBooting(false);
      setGlobalError('Failed to load notes.');
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const visibleNotes = useMemo(() => sortAndFilterNotes(notes, query), [notes, query]);

  const resetEditor = () => {
    setCurrentNoteId(null);
    setTitleInput('');
    setContentInput('');
    setProtectEnabled(false);
    setPinInput('');
    setPhotos([]);
    setEditorError('');
    setHistoryPast([]);
    setHistoryFuture([]);
  };

  const openCreatePage = () => {
    resetEditor();
    setDetailMode('edit');
    setScreen('detail');
  };

  const openViewPage = (note: Note) => {
    setCurrentNoteId(note.id);
    setTitleInput(note.title);
    setContentInput(note.content);
    setProtectEnabled(Boolean(note.pinHash));
    setPinInput('');
    setPhotos(note.photos || []);
    setEditorError('');
    setDetailMode('view');
    setHistoryPast([]);
    setHistoryFuture([]);
    setOptionsVisible(false);
    setScreen('detail');
  };

  const startEditMode = () => {
    setDetailMode('edit');
    setHistoryPast([]);
    setHistoryFuture([]);
    setEditorError('');
  };

  const requestOpenNote = (note: Note) => {
    if (!note.pinHash) {
      openViewPage(note);
      return;
    }

    setTargetNote(note);
    setUnlockPin('');
    setUnlockError('');
    setPinModalVisible(true);
  };

  const onUnlockNote = () => {
    if (!targetNote) {
      return;
    }

    if (unlockPin.length !== 4 || !unlockProtectedNote(targetNote, unlockPin)) {
      setUnlockError('Wrong PIN. Try again.');
      return;
    }

    setPinModalVisible(false);
    openViewPage(targetNote);
    setTargetNote(null);
  };

  const onLongPressNote = (note: Note) => {
    setTargetNote(note);
    setOptionsVisible(true);
  };

  const onDeleteById = async (deletingId: string) => {
    const nextNotes = await guardedAsync(
      () => deleteNote(notes, deletingId),
      setGlobalError,
    );

    if (nextNotes) {
      setNotes(nextNotes);
      if (currentNoteId === deletingId) {
        setScreen('home');
        resetEditor();
      }
    }
  };

  const requestDeleteConfirmation = (deletingId: string) => {
    Alert.alert(
      'Are you sure?',
      'This note will be deleted permanently and cannot be recovered.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteById(deletingId).catch(() =>
              setGlobalError('Could not delete note.'),
            );
          },
        },
      ],
    );
  };

  const pushEditorSnapshot = () => {
    setHistoryPast(prev => [...prev, { title: titleInput, content: contentInput }]);
    setHistoryFuture([]);
  };

  const onChangeTitleWithHistory = (value: string) => {
    pushEditorSnapshot();
    setTitleInput(value);
  };

  const onChangeContentWithHistory = (value: string) => {
    pushEditorSnapshot();
    setContentInput(value);
  };

  const onUndo = () => {
    if (historyPast.length === 0) {
      return;
    }

    const previous = historyPast[historyPast.length - 1];
    setHistoryPast(prev => prev.slice(0, -1));
    setHistoryFuture(prev => [{ title: titleInput, content: contentInput }, ...prev]);
    setTitleInput(previous.title);
    setContentInput(previous.content);
  };

  const onRedo = () => {
    if (historyFuture.length === 0) {
      return;
    }

    const next = historyFuture[0];
    setHistoryFuture(prev => prev.slice(1));
    setHistoryPast(prev => [...prev, { title: titleInput, content: contentInput }]);
    setTitleInput(next.title);
    setContentInput(next.content);
  };

  const onSaveNote = async () => {
    if (isSaving) {
      return;
    }

    setGlobalError('');
    setEditorError('');

    const pinMessage = validatePin(
      protectEnabled,
      pinInput,
      Boolean(currentNoteId),
      Boolean(notes.find(note => note.id === currentNoteId)?.pinHash),
    );

    if (pinMessage) {
      setEditorError(pinMessage);
      return;
    }

    setIsSaving(true);

    const result = await guardedAsync(
      () =>
        saveNote({
          notes,
          currentNoteId,
          titleInput,
          contentInput,
          protectEnabled,
          pinInput,
          photos,
        }),
      setGlobalError,
    );

    setIsSaving(false);

    if (!result) {
      return;
    }

    if (!result.ok || !result.notes) {
      setEditorError(result.error || 'Could not save note.');
      return;
    }

    setNotes(result.notes);
    setHistoryPast([]);
    setHistoryFuture([]);

    const latest = [...result.notes].sort((a, b) => b.updatedAt - a.updatedAt);
    const opened = currentNoteId
      ? result.notes.find(note => note.id === currentNoteId) || latest[0]
      : latest[0];

    if (opened) {
      openViewPage(opened);
    } else {
      setScreen('home');
    }
  };

  const onSelectTheme = async (nextThemeId: ThemeId) => {
    setThemeId(nextThemeId);
    await guardedAsync(() => saveTheme(nextThemeId), setGlobalError);
  };

  const onDeleteMultiple = async (noteIds: string[]) => {
    const nextNotes = await guardedAsync(
      () => deleteMultipleNotes(notes, noteIds),
      setGlobalError,
    );
    if (nextNotes) {
      setNotes(nextNotes);
    }
  };

  const onMoveToFolder = async (noteIds: string[], folderId: string | undefined) => {
    const nextNotes = await guardedAsync(
      () => moveNotesToFolder(notes, noteIds, folderId),
      setGlobalError,
    );
    if (nextNotes) {
      setNotes(nextNotes);
    }
  };

  const onCreateFolder = async (name: string) => {
    const nextFolders = await guardedAsync(
      () => createFolder(folders, name),
      setGlobalError,
    );
    if (nextFolders) {
      setFolders(nextFolders);
    }
  };

  const onDeleteFolder = async (folderId: string) => {
    Alert.alert(
      'Delete folder?',
      'Notes in this folder will be moved to "Not grouped".',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const nextFolders = await guardedAsync(
              () => deleteFolder(folders, folderId),
              setGlobalError,
            );
            if (nextFolders) {
              setFolders(nextFolders);
              const nextNotes = await guardedAsync(
                () => moveNotesToFolder(notes, notes.filter(n => n.folderId === folderId).map(n => n.id), undefined),
                setGlobalError,
              );
              if (nextNotes) {
                setNotes(nextNotes);
              }
            }
          },
        },
      ],
    );
  };

  const onInsertSkin = () => {
    // TODO: Implement background/skin options for note
    console.log('Skin/background options coming soon');
  };

  const onBackFromDetail = () => {
    if (detailMode === 'edit' && currentNoteId) {
      const current = notes.find(note => note.id === currentNoteId);
      if (current) {
        openViewPage(current);
        return;
      }
    }

    setScreen('home');
    if (detailMode === 'edit' && !currentNoteId) {
      resetEditor();
    }
  };

  const pinValidationMessage = validatePin(
    protectEnabled,
    pinInput,
    Boolean(currentNoteId),
    Boolean(notes.find(note => note.id === currentNoteId)?.pinHash),
  );

  if (showSplash || isBooting) {
    return (
      <SafeAreaView
        style={styles.flex}
        edges={['left', 'right', 'top', 'bottom']}
      >
        <StatusBar barStyle={theme.id === 'midnight' ? 'light-content' : 'dark-content'} />
        <SplashScreen theme={theme} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.bg }]}
      edges={['left', 'right']}
    >
      <StatusBar barStyle={theme.id === 'midnight' ? 'light-content' : 'dark-content'} />

      {globalError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{globalError}</Text>
        </View>
      ) : null}

      {screen === 'home' ? (
        <HomeScreen
          theme={theme}
          notes={visibleNotes}
          folders={folders}
          query={query}
          onChangeQuery={setQuery}
          onOpenNote={requestOpenNote}
          onLongPressNote={onLongPressNote}
          onOpenSettings={() => setScreen('settings')}
          onCreate={openCreatePage}
          onDeleteMultiple={onDeleteMultiple}
          onMoveToFolder={onMoveToFolder}
          onCreateFolder={onCreateFolder}
          onDeleteFolder={onDeleteFolder}
          topSpacing={topSpacing}
          bottomSpacing={bottomSpacing}
        />
      ) : null}

      {screen === 'theme' ? (
        <ThemeScreen
          currentTheme={theme}
          currentThemeId={themeId}
          onBack={() => setScreen('home')}
          onSelectTheme={onSelectTheme}
          topSpacing={topSpacing}
          bottomSpacing={bottomSpacing}
        />
      ) : null}

      {screen === 'settings' ? (
        <SettingsScreen
          currentTheme={theme}
          currentThemeId={themeId}
          onBack={() => setScreen('home')}
          onSelectTheme={onSelectTheme}
          topSpacing={topSpacing}
          bottomSpacing={bottomSpacing}
        />
      ) : null}

      {screen === 'detail' ? (
        <DetailScreen
          mode={detailMode}
          theme={theme}
          topSpacing={topSpacing}
          bottomSpacing={bottomSpacing}
          titleInput={titleInput}
          contentInput={contentInput}
          protectEnabled={protectEnabled}
          pinInput={pinInput}
          photos={photos}
          isEditing={Boolean(currentNoteId)}
          pinValidationMessage={pinValidationMessage || ''}
          editorError={editorError}
          isSaving={isSaving}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
          onChangeTitle={onChangeTitleWithHistory}
          onChangeContent={onChangeContentWithHistory}
          onToggleProtect={value => {
            setProtectEnabled(value);
            if (!value) {
              setPinInput('');
            }
          }}
          onChangePin={value => setPinInput(value.replace(/[^0-9]/g, '').slice(0, 4))}
          onAddPhoto={uri => setPhotos(prev => [...prev, uri])}
          onRemovePhoto={index => setPhotos(prev => prev.filter((_, i) => i !== index))}
          onBack={onBackFromDetail}
          onSave={() => {
            onSaveNote().catch(() => setGlobalError('Could not save note.'));
          }}
          onUndo={onUndo}
          onRedo={onRedo}
          onStartEdit={startEditMode}
          onDelete={() => {
            const current = notes.find(note => note.id === currentNoteId);
            if (!current) {
              return;
            }
            requestDeleteConfirmation(current.id);
          }}
          onInsertSkin={onInsertSkin}
        />
      ) : null}

      <Modal transparent visible={optionsVisible} animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: theme.modalOverlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>Note options</Text>
            <ThemedButton
              label="Edit"
              onPress={() => {
                if (targetNote) {
                  setCurrentNoteId(targetNote.id);
                  setTitleInput(targetNote.title);
                  setContentInput(targetNote.content);
                  setProtectEnabled(Boolean(targetNote.pinHash));
                  setPinInput('');
                  setPhotos(targetNote.photos || []);
                  setOptionsVisible(false);
                  setScreen('detail');
                  setDetailMode('edit');
                  setHistoryPast([]);
                  setHistoryFuture([]);
                }
              }}
              backgroundColor={theme.accentSoft}
              textColor={theme.accent}
            />
            <View style={styles.modalGap} />
            <ThemedButton
              label="Delete"
              onPress={() => {
                if (!targetNote) {
                  return;
                }
                setOptionsVisible(false);
                requestDeleteConfirmation(targetNote.id);
              }}
              backgroundColor="#fee2e2"
              textColor={theme.danger}
            />
            <View style={styles.modalGap} />
            <ThemedButton
              label="Cancel"
              onPress={() => setOptionsVisible(false)}
              backgroundColor={theme.bg}
              textColor={theme.muted}
              style={[styles.outlineButton, { borderColor: theme.border }]}
            />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={pinModalVisible} animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: theme.modalOverlay }]}> 
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>Enter 4-digit PIN</Text>
            <TextInput
              value={unlockPin}
              onChangeText={value => {
                setUnlockPin(value.replace(/[^0-9]/g, '').slice(0, 4));
                setUnlockError('');
              }}
              keyboardType="number-pad"
              secureTextEntry
              placeholder="PIN"
              placeholderTextColor={theme.muted}
              style={[
                styles.pinInput,
                {
                  backgroundColor: theme.bg,
                  borderColor: unlockError ? theme.danger : theme.border,
                  color: theme.text,
                },
              ]}
            />
            {unlockError ? (
              <Text style={[styles.unlockErrorText, { color: theme.danger }]}>{unlockError}</Text>
            ) : null}
            <ThemedButton
              label="Open note"
              onPress={onUnlockNote}
              backgroundColor={theme.accent}
            />
            <View style={styles.modalGap} />
            <ThemedButton
              label="Cancel"
              onPress={() => setPinModalVisible(false)}
              backgroundColor={theme.bg}
              textColor={theme.muted}
              style={[styles.outlineButton, { borderColor: theme.border }]}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppRoot />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  modalGap: {
    height: 8,
  },
  outlineButton: {
    borderWidth: 1,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: 8,
  },
  unlockErrorText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default App;
