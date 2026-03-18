import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import LogoMark from '../components/LogoMark';
import IconButton from '../components/IconButton';
import ThemedButton from '../components/ThemedButton';
import { plainPreview } from '../services/noteService';
import type { AppTheme, Note } from '../types/app';

type Props = {
  theme: AppTheme;
  notes: Note[];
  query: string;
  onChangeQuery: (value: string) => void;
  onOpenNote: (note: Note) => void;
  onLongPressNote: (note: Note) => void;
  onOpenSettings: () => void;
  onCreate: () => void;
  topSpacing: number;
  bottomSpacing: number;
};

function HomeScreen({
  theme,
  notes,
  query,
  onChangeQuery,
  onOpenNote,
  onLongPressNote,
  onOpenSettings,
  onCreate,
  topSpacing,
  bottomSpacing,
}: Props) {
  return (
    <View style={[styles.container, { paddingTop: topSpacing + 2, paddingBottom: bottomSpacing }]}> 
      <View style={styles.headerRow}>
        <View style={styles.brandWrap}>
          <View style={styles.logoWrap}>
            <LogoMark accent={theme.accent} size={36} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.appTitle, { color: theme.text }]}>
              notes
            </Text>
            <Text style={[styles.subTitle, { color: theme.muted }]}>
              Your private notebook
            </Text>
          </View>
        </View>
        <IconButton
          icon="⚙"
          color={theme.accent}
          backgroundColor={theme.card}
          onPress={onOpenSettings}
          accessibilityLabel="Open settings"
          style={[styles.settingsButton, { borderColor: theme.border }]}
        />
      </View>

      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder="Search notes"
        placeholderTextColor={theme.muted}
        style={[
          styles.searchInput,
          { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
        ]}
      />

      <FlatList
        style={styles.list}
        data={notes}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomSpacing + 90 }]}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.muted }]}>
            No notes found.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenNote(item)}
            onLongPress={() => onLongPressNote(item)}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.noteTitle, { color: theme.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              {item.pinHash ? <Text style={[styles.pinBadge, { color: theme.accent }]}>PIN</Text> : null}
            </View>
            <Text
              style={[styles.notePreview, { color: theme.muted }]}
              numberOfLines={2}>
              {plainPreview(item.content) || 'No content'}
            </Text>
            <Text style={[styles.noteTime, { color: theme.muted }]}>
              {new Date(item.updatedAt).toLocaleString()}
            </Text>
          </Pressable>
        )}
      />

      <View style={[styles.fabWrap, { bottom: bottomSpacing + 8 }]}> 
        <ThemedButton label="+ New" onPress={onCreate} backgroundColor={theme.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  logoWrap: {
    marginRight: 12,
  },
  titleWrap: {
    flexShrink: 1,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  subTitle: {
    fontSize: 12,
  },
  settingsButton: {
    borderWidth: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 12,
  },
  listContent: {
    rowGap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  cardHeaderRow: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  pinBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  notePreview: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  noteTime: {
    fontSize: 12,
  },
  fabWrap: {
    position: 'absolute',
    right: 16,
    minWidth: 110,
    zIndex: 20,
    elevation: 6,
  },
});

export default HomeScreen;
