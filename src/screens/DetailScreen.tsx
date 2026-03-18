import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import IconButton from '../components/IconButton';
import ThemedButton from '../components/ThemedButton';
import type { AppTheme } from '../types/app';

type DetailMode = 'view' | 'edit';

type Props = {
  mode: DetailMode;
  theme: AppTheme;
  topSpacing: number;
  bottomSpacing: number;
  titleInput: string;
  contentInput: string;
  protectEnabled: boolean;
  pinInput: string;
  isEditing: boolean;
  pinValidationMessage: string;
  editorError: string;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onChangeTitle: (value: string) => void;
  onChangeContent: (value: string) => void;
  onToggleProtect: (value: boolean) => void;
  onChangePin: (value: string) => void;
  onBack: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onInsertHeader: () => void;
  onInsertBold: () => void;
  onInsertItalic: () => void;
};

function DetailScreen({
  mode,
  theme,
  topSpacing,
  bottomSpacing,
  titleInput,
  contentInput,
  protectEnabled,
  pinInput,
  isEditing,
  pinValidationMessage,
  editorError,
  isSaving,
  canUndo,
  canRedo,
  onChangeTitle,
  onChangeContent,
  onToggleProtect,
  onChangePin,
  onBack,
  onSave,
  onUndo,
  onRedo,
  onStartEdit,
  onDelete,
  onInsertHeader,
  onInsertBold,
  onInsertItalic,
}: Props) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: theme.bg }]}> 
      <View
        style={[
          styles.header,
          { paddingTop: topSpacing + 4, borderBottomColor: theme.border },
        ]}>
        <IconButton
          icon="←"
          onPress={onBack}
          color={theme.accent}
          backgroundColor={theme.card}
          accessibilityLabel="Back"
          style={[styles.iconOutlined, { borderColor: theme.border }]}
        />

        {mode === 'view' ? (
          <View style={styles.rightActions}>
            <IconButton
              icon="✎"
              onPress={onStartEdit}
              color={theme.accent}
              backgroundColor={theme.card}
              accessibilityLabel="Edit note"
              style={[styles.iconOutlined, { borderColor: theme.border }]}
            />
            <IconButton
              icon="🗑"
              onPress={onDelete}
              color={theme.danger}
              backgroundColor={theme.card}
              accessibilityLabel="Delete note"
              style={[styles.iconOutlined, { borderColor: theme.border }]}
            />
          </View>
        ) : (
          <View style={styles.rightActions}>
            <IconButton
              icon="↶"
              onPress={onUndo}
              color={theme.text}
              backgroundColor={theme.card}
              disabled={!canUndo}
              accessibilityLabel="Undo"
              style={[styles.iconOutlined, { borderColor: theme.border }]}
            />
            <IconButton
              icon="↷"
              onPress={onRedo}
              color={theme.text}
              backgroundColor={theme.card}
              disabled={!canRedo}
              accessibilityLabel="Redo"
              style={[styles.iconOutlined, { borderColor: theme.border }]}
            />
            <IconButton
              icon={isSaving ? '…' : '✓'}
              onPress={onSave}
              color="#ffffff"
              backgroundColor={theme.accent}
              disabled={isSaving}
              accessibilityLabel="Save note"
            />
          </View>
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomSpacing + 22 }]}
      >
        <View style={styles.contentWrap}>
          {mode === 'view' ? (
            <>
              <Text style={[styles.viewTitle, { color: theme.text }]}>
                {titleInput || 'Untitled'}
              </Text>
              <View style={[styles.viewCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                <Markdown
                  style={{
                    body: { color: theme.text, fontSize: 15, lineHeight: 24 },
                    heading1: { color: theme.text, fontSize: 26, marginBottom: 10 },
                    heading2: { color: theme.text, fontSize: 22, marginBottom: 8 },
                    strong: { color: theme.text, fontWeight: '700' },
                    em: { color: theme.text, fontStyle: 'italic' },
                  }}
                >
                  {contentInput || '_No content_'}
                </Markdown>
              </View>
            </>
          ) : (
            <>
              <TextInput
                value={titleInput}
                onChangeText={onChangeTitle}
                placeholder="Title"
                placeholderTextColor={theme.muted}
                style={[
                  styles.titleInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
              />

              <View style={styles.markupRow}>
                <ThemedButton
                  label="H1"
                  onPress={onInsertHeader}
                  backgroundColor={theme.card}
                  textColor={theme.text}
                  style={[styles.outlineButton, styles.markupActionButton, { borderColor: theme.border }]}
                />
                <ThemedButton
                  label="Bold"
                  onPress={onInsertBold}
                  backgroundColor={theme.card}
                  textColor={theme.text}
                  style={[styles.outlineButton, styles.markupActionButton, { borderColor: theme.border }]}
                />
                <ThemedButton
                  label="Italic"
                  onPress={onInsertItalic}
                  backgroundColor={theme.card}
                  textColor={theme.text}
                  style={[styles.outlineButton, styles.markupActionButton, { borderColor: theme.border }]}
                />
              </View>

              <TextInput
                value={contentInput}
                onChangeText={onChangeContent}
                placeholder="Write with markdown: # Header, **bold**, *italic*"
                placeholderTextColor={theme.muted}
                multiline
                textAlignVertical="top"
                style={[
                  styles.bodyInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
              />

              <View style={[styles.pinRow, { borderColor: theme.border, backgroundColor: theme.card }]}> 
                <View style={styles.pinLabelWrap}>
                  <Text style={[styles.pinTitle, { color: theme.text }]}>Protect with PIN</Text>
                  <Text style={[styles.mutedText, { color: theme.muted }]}>Optional 4-digit lock</Text>
                </View>
                <Switch
                  value={protectEnabled}
                  onValueChange={onToggleProtect}
                  trackColor={{ false: '#9ca3af', true: theme.accent }}
                />
              </View>

              {protectEnabled ? (
                <>
                  <TextInput
                    value={pinInput}
                    onChangeText={onChangePin}
                    placeholder={isEditing ? 'New PIN (optional)' : '4-digit PIN'}
                    placeholderTextColor={theme.muted}
                    keyboardType="number-pad"
                    secureTextEntry
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: theme.card,
                        borderColor: pinValidationMessage ? theme.danger : theme.border,
                        color: theme.text,
                      },
                    ]}
                  />
                  {pinValidationMessage ? (
                    <Text style={[styles.validationText, { color: theme.danger }]}>{pinValidationMessage}</Text>
                  ) : null}
                </>
              ) : null}

              {editorError ? (
                <Text style={[styles.editorError, { color: theme.danger }]}>
                  {editorError}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconOutlined: {
    borderWidth: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 16,
  },
  viewTitle: {
    marginBottom: 8,
    fontSize: 30,
    fontWeight: '800',
  },
  viewCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  outlineButton: {
    borderWidth: 1,
  },
  markupActionButton: {
    flex: 1,
    minHeight: 40,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  bodyInput: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 190,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  markupRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  pinRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pinLabelWrap: {
    flex: 1,
    paddingRight: 10,
  },
  pinTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  mutedText: {
    fontSize: 13,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: 6,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  editorError: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DetailScreen;
