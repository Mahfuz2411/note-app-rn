import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import IconButton from '../components/IconButton';
import { plainPreview } from '../services/noteService';
import type { AppTheme, Folder, Note } from '../types/app';

type Props = {
  theme: AppTheme;
  notes: Note[];
  folders: Folder[];
  query: string;
  onChangeQuery: (value: string) => void;
  onOpenNote: (note: Note) => void;
  onLongPressNote: (note: Note) => void;
  onOpenSettings: () => void;
  onCreate: () => void;
  onDeleteMultiple: (noteIds: string[]) => void;
  onMoveToFolder: (noteIds: string[], folderId: string | undefined) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  topSpacing: number;
  bottomSpacing: number;
};

type TabType = 'home' | 'folders';

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

function HomeScreen({
  theme,
  notes,
  folders,
  onOpenNote,
  onLongPressNote,
  onOpenSettings,
  onCreate,
  onDeleteMultiple,
  onMoveToFolder,
  onCreateFolder,
  onDeleteFolder,
  topSpacing,
  bottomSpacing,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const toggleSelection = (noteId: string) => {
    const newSet = new Set(selectedNotes);
    if (newSet.has(noteId)) {
      newSet.delete(noteId);
    } else {
      newSet.add(noteId);
    }
    setSelectedNotes(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedNotes.size === notes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(notes.map(n => n.id)));
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedNotes(new Set());
  };

  const handleDelete = () => {
    if (selectedNotes.size > 0) {
      onDeleteMultiple(Array.from(selectedNotes));
      exitSelectionMode();
    }
  };

  const handleMoveToFolder = (folderId: string | undefined) => {
    if (selectedNotes.size > 0) {
      onMoveToFolder(Array.from(selectedNotes), folderId);
      setFolderModalVisible(false);
      exitSelectionMode();
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setCreateFolderModalVisible(false);
    }
  };

  const notesInCurrentFolder = currentFolderId
    ? notes.filter(n => n.folderId === currentFolderId)
    : notes.filter(n => !n.folderId);

  const ungroupedCount = notes.filter(n => !n.folderId).length;

  const renderHomeTab = () => (
    <>
      {/* Header */}
      {selectionMode ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Select items</Text>
          <IconButton
            icon="✕"
            color={theme.text}
            backgroundColor="transparent"
            onPress={exitSelectionMode}
            accessibilityLabel="Exit selection"
          />
        </View>
      ) : (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Notes</Text>
          <View style={styles.headerIcons}>
            <IconButton
              icon="☑"
              color={theme.text}
              backgroundColor="transparent"
              onPress={() => setSelectionMode(true)}
              accessibilityLabel="Select notes"
            />
            <IconButton
              icon="🔍"
              color={theme.text}
              backgroundColor="transparent"
              onPress={() => {}}
              accessibilityLabel="Search notes"
            />
            <IconButton
              icon="⚙"
              color={theme.text}
              backgroundColor="transparent"
              onPress={onOpenSettings}
              accessibilityLabel="Settings"
            />
          </View>
        </View>
      )}

      {/* Select All Row */}
      {selectionMode && (
        <Pressable style={styles.selectAllRow} onPress={toggleSelectAll}>
          <View style={[
            styles.checkbox,
            { borderColor: theme.muted },
            selectedNotes.size === notes.length && { backgroundColor: theme.accent, borderColor: theme.accent },
          ]}>
            {selectedNotes.size === notes.length && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.selectAllText, { color: theme.text }]}>Select all</Text>
        </Pressable>
      )}

      {/* Notes List */}
      <FlatList
        style={styles.list}
        data={notesInCurrentFolder}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomSpacing + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              No notes yet. Tap + to create one.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedNotes.has(item.id);
          return (
            <View style={styles.noteRow}>
              {selectionMode && (
                <Pressable onPress={() => toggleSelection(item.id)} style={styles.checkboxWrap}>
                  <View style={[
                    styles.checkbox,
                    { borderColor: theme.muted },
                    isSelected && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </Pressable>
              )}
              <Pressable
                onPress={() => selectionMode ? toggleSelection(item.id) : onOpenNote(item)}
                onLongPress={() => !selectionMode && onLongPressNote(item)}
                style={({ pressed }) => [
                  styles.noteCard,
                  {
                    backgroundColor: theme.card,
                    opacity: pressed ? 0.85 : 1,
                    flex: 1,
                  },
                ]}>
                <View style={styles.noteContent}>
                  <View style={styles.noteTextContent}>
                    <Text style={[styles.noteTitle, { color: theme.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.notePreview, { color: theme.muted }]} numberOfLines={1}>
                      {plainPreview(item.content) || 'No content'}
                    </Text>
                    <Text style={[styles.noteDate, { color: theme.muted }]}>
                      {formatDate(item.updatedAt)}
                    </Text>
                  </View>
                  {item.pinHash && !selectionMode && (
                    <View style={[styles.pinIndicator, { backgroundColor: theme.accent }]}>
                      <Text style={styles.pinIcon}>🔒</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          );
        }}
      />

      {/* Selection Action Bar */}
      {selectionMode && (
        <View style={[styles.selectionBar, { backgroundColor: theme.bg, paddingBottom: bottomSpacing }]}>
          <Pressable style={styles.selectionAction} onPress={handleDelete}>
            <Text style={styles.selectionIcon}>🗑</Text>
            <Text style={[styles.selectionLabel, { color: theme.muted }]}>Delete</Text>
          </Pressable>
          <Pressable style={styles.selectionAction} onPress={() => setFolderModalVisible(true)}>
            <Text style={styles.selectionIcon}>📁</Text>
            <Text style={[styles.selectionLabel, { color: theme.muted }]}>Move to folder</Text>
          </Pressable>
        </View>
      )}

      {/* FAB */}
      {!selectionMode && (
        <Pressable
          onPress={onCreate}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: theme.accent,
              opacity: pressed ? 0.9 : 1,
              bottom: bottomSpacing + 70,
            },
          ]}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
    </>
  );

  const renderFoldersTab = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Notes</Text>
        <View style={styles.headerIcons}>
          <IconButton
            icon="🔍"
            color={theme.text}
            backgroundColor="transparent"
            onPress={() => {}}
            accessibilityLabel="Search"
          />
          <IconButton
            icon="⚙"
            color={theme.text}
            backgroundColor="transparent"
            onPress={onOpenSettings}
            accessibilityLabel="Settings"
          />
        </View>
      </View>

      {/* Folders List */}
      <FlatList
        style={styles.list}
        data={[{ id: '__ungrouped__', name: 'Not grouped', createdAt: 0 }, ...folders]}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomSpacing + 100 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUngrouped = item.id === '__ungrouped__';
          const count = isUngrouped
            ? ungroupedCount
            : notes.filter(n => n.folderId === item.id).length;

          return (
            <Pressable
              onPress={() => {
                setCurrentFolderId(isUngrouped ? null : item.id);
                setActiveTab('home');
              }}
              onLongPress={() => {
                if (!isUngrouped) {
                  onDeleteFolder(item.id);
                }
              }}
              style={({ pressed }) => [
                styles.folderRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={styles.folderIcon}>📁</Text>
              <Text style={[styles.folderName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.folderCount, { color: theme.muted }]}>{count}</Text>
            </Pressable>
          );
        }}
      />

      {/* Create Folder FAB */}
      <Pressable
        onPress={() => setCreateFolderModalVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.accent,
            opacity: pressed ? 0.9 : 1,
            bottom: bottomSpacing + 70,
          },
        ]}>
        <Text style={styles.fabIcon}>📁</Text>
      </Pressable>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: topSpacing }]}>
      {activeTab === 'home' ? renderHomeTab() : renderFoldersTab()}

      {/* Bottom Tab Bar */}
      {!selectionMode && (
        <View style={[styles.bottomBar, { backgroundColor: theme.bg, paddingBottom: bottomSpacing }]}>
          <Pressable
            style={styles.tabItem}
            onPress={() => {
              setActiveTab('home');
              setCurrentFolderId(null);
            }}>
            <Text style={[styles.tabIcon, activeTab === 'home' && { color: theme.accent }]}>🏠</Text>
            <Text style={[styles.tabLabel, { color: activeTab === 'home' ? theme.accent : theme.muted }]}>
              Home
            </Text>
          </Pressable>
          <Pressable
            style={styles.tabItem}
            onPress={() => setActiveTab('folders')}>
            <Text style={[styles.tabIcon, activeTab === 'folders' && { color: theme.accent }]}>📁</Text>
            <Text style={[styles.tabLabel, { color: activeTab === 'folders' ? theme.accent : theme.muted }]}>
              Folders
            </Text>
          </Pressable>
        </View>
      )}

      {/* Move to Folder Modal */}
      <Modal transparent visible={folderModalVisible} animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Move to folder</Text>
            <Pressable
              style={[styles.folderOption, { borderBottomColor: theme.border }]}
              onPress={() => handleMoveToFolder(undefined)}>
              <Text style={[styles.folderOptionText, { color: theme.text }]}>Not grouped</Text>
            </Pressable>
            {folders.map(folder => (
              <Pressable
                key={folder.id}
                style={[styles.folderOption, { borderBottomColor: theme.border }]}
                onPress={() => handleMoveToFolder(folder.id)}>
                <Text style={[styles.folderOptionText, { color: theme.text }]}>{folder.name}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setFolderModalVisible(false)}>
              <Text style={[styles.modalCancelText, { color: theme.muted }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Create Folder Modal */}
      <Modal transparent visible={createFolderModalVisible} animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New folder</Text>
            <TextInput
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder name"
              placeholderTextColor={theme.muted}
              style={[styles.folderInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: theme.bg }]}
                onPress={() => {
                  setNewFolderName('');
                  setCreateFolderModalVisible(false);
                }}>
                <Text style={[styles.modalBtnText, { color: theme.muted }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: theme.accent }]}
                onPress={handleCreateFolder}>
                <Text style={[styles.modalBtnText, { color: '#000' }]}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  selectAllRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAllText: {
    fontSize: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxWrap: {
    paddingRight: 12,
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 85,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTextContent: {
    flex: 1,
    paddingRight: 12,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
  noteDate: {
    fontSize: 13,
  },
  noteThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailIcon: {
    fontSize: 24,
    color: '#C4A052',
  },
  pinIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    fontSize: 12,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  selectionAction: {
    alignItems: 'center',
    padding: 8,
  },
  selectionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  selectionLabel: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabIcon: {
    fontSize: 28,
    color: '#000',
    fontWeight: '300',
  },
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  folderIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  folderName: {
    flex: 1,
    fontSize: 16,
  },
  folderCount: {
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  folderOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  folderOptionText: {
    fontSize: 16,
  },
  modalCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
  },
  folderInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HomeScreen;
