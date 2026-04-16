import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { launchImageLibrary } from 'react-native-image-picker';
import { RichEditor } from 'react-native-pell-rich-editor';
import IconButton from '../components/IconButton';
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
  photos: string[];
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
  onAddPhoto: (uri: string) => void;
  onRemovePhoto: (index: number) => void;
  onBack: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onInsertSkin: () => void;
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
  photos,
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
  onAddPhoto,
  onRemovePhoto,
  onBack,
  onSave,
  onUndo,
  onRedo,
  onStartEdit,
  onDelete,
  onInsertSkin,
}: Props) {
  const editorRef = useRef<RichEditor>(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [textStyleVisible, setTextStyleVisible] = useState(false);
  const [paragraphStyleVisible, setParagraphStyleVisible] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(16);
  const [editorColor, setEditorColor] = useState('#ffffff');
  const [paragraphStyle, setParagraphStyle] = useState<{
    align: 'left' | 'center' | 'right';
    marker: 'none' | 'dot' | 'digit' | 'letter';
  }>({
    align: 'left',
    marker: 'none',
  });
  const [typingStyle, setTypingStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 36];
  const fontColors = ['#ffffff', '#d1d5db', '#9ca3af', '#ef4444', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];

  const isHtmlContent = useMemo(() => /<\/?[a-z][\s\S]*>/i.test(contentInput), [contentInput]);

  const runEditorCommand = (command: string) => {
    editorRef.current?.focusContentEditor();
    editorRef.current?.command(command);
  };

  const applyTypingState = (
    nextStyle: { bold: boolean; italic: boolean; underline: boolean; strikeThrough: boolean },
    nextColor: string,
  ) => {
    runEditorCommand(`
      (function() {
        var content = document.getElementById('content');
        if (!content) return true;

        // We no longer apply style to selected text; styles apply to upcoming typing only.
        var sel = window.getSelection();
        if (!sel) return true;
        var range = document.createRange();
        range.selectNodeContents(content);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);

        function setCommandState(cmd, enabled) {
          var state = document.queryCommandState(cmd);
          if (state !== enabled) {
            document.execCommand(cmd, false, null);
          }
        }

        document.execCommand('styleWithCSS', false, true);
        setCommandState('bold', ${nextStyle.bold ? 'true' : 'false'});
        setCommandState('italic', ${nextStyle.italic ? 'true' : 'false'});
        setCommandState('underline', ${nextStyle.underline ? 'true' : 'false'});
        setCommandState('strikeThrough', ${nextStyle.strikeThrough ? 'true' : 'false'});
        document.execCommand('foreColor', false, '${nextColor}');
        return true;
      })();
    `);
  };

  const toggleTypingStyle = (type: 'bold' | 'italic' | 'underline' | 'strikeThrough') => {
    setTypingStyle(prev => {
      const next = { ...prev, [type]: !prev[type] };
      applyTypingState(next, editorColor);
      return next;
    });
  };

  const applyColor = (color: string) => {
    setEditorColor(color);
    applyTypingState(typingStyle, color);
  };

  const applySizeToCurrentLine = (size: number) => {
    setEditorFontSize(size);
    runEditorCommand(`
      (function() {
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return true;
        var node = sel.anchorNode;
        if (!node) return true;
        if (node.nodeType === 3) node = node.parentNode;
        var block = node;
        while (block && block !== document.body) {
          var tag = block.nodeName;
          if (tag === 'P' || tag === 'DIV' || tag === 'LI' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'BLOCKQUOTE') {
            break;
          }
          block = block.parentNode;
        }
        if (!block || block === document.body) block = node;
        if (block && block.style) {
          block.style.fontSize = '${size}px';
          block.style.lineHeight = '1.5';
        }
        return true;
      })();
    `);
  };

  const applyParagraphAlign = (align: 'left' | 'center' | 'right') => {
    setParagraphStyle(prev => ({ ...prev, align }));
    runEditorCommand(`
      (function() {
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return true;
        var node = sel.anchorNode;
        if (!node) return true;
        if (node.nodeType === 3) node = node.parentNode;
        var block = node;
        while (block && block !== document.body) {
          var tag = block.nodeName;
          if (tag === 'P' || tag === 'DIV' || tag === 'LI' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'BLOCKQUOTE') {
            break;
          }
          block = block.parentNode;
        }
        if (!block || block === document.body) block = node;
        if (block && block.style) {
          block.style.textAlign = '${align}';
        }
        return true;
      })();
    `);
  };

  const applyParagraphMarker = (marker: 'none' | 'dot' | 'digit' | 'letter') => {
    setParagraphStyle(prev => ({ ...prev, marker }));

    const markerText =
      marker === 'dot' ? '• ' : marker === 'digit' ? '1. ' : marker === 'letter' ? 'a. ' : '';

    runEditorCommand(`
      (function() {
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return true;
        var node = sel.anchorNode;
        if (!node) return true;
        if (node.nodeType === 3) node = node.parentNode;
        var block = node;
        while (block && block !== document.body) {
          var tag = block.nodeName;
          if (tag === 'P' || tag === 'DIV' || tag === 'LI' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'BLOCKQUOTE') {
            break;
          }
          block = block.parentNode;
        }
        if (!block || block === document.body) block = node;

        var existing = block.querySelector && block.querySelector('span[data-paragraph-marker="1"]');
        if (existing) {
          existing.remove();
        }

        if ('${markerText}') {
          var span = document.createElement('span');
          span.setAttribute('data-paragraph-marker', '1');
          span.textContent = '${markerText}';
          span.style.opacity = '0.92';
          span.style.marginRight = '2px';
          block.insertBefore(span, block.firstChild);
        }

        return true;
      })();
    `);
  };

  const insertTable = () => {
    editorRef.current?.focusContentEditor();
    editorRef.current?.insertHTML(`
      <table style="border-collapse: collapse; width: 100%; margin: 8px 0;">
        <tr>
          <td style="border: 1px solid #64748b; padding: 6px;">Col 1</td>
          <td style="border: 1px solid #64748b; padding: 6px;">Col 2</td>
        </tr>
        <tr>
          <td style="border: 1px solid #64748b; padding: 6px;">Cell</td>
          <td style="border: 1px solid #64748b; padding: 6px;">Cell</td>
        </tr>
      </table>
    `);
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.assets && result.assets[0]?.uri) {
      onAddPhoto(result.assets[0].uri);
    }
  };

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
            {!isTitleFocused ? (
              <>
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
              </>
            ) : null}
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
              {photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {photos.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.photoView} />
                  ))}
                </ScrollView>
              )}
              <View style={[styles.viewCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                {isHtmlContent ? (
                  <RichEditor
                    key={`view-${contentInput.length}`}
                    disabled
                    useContainer={false}
                    initialContentHTML={contentInput || '<em>No content</em>'}
                    style={styles.richViewer}
                    editorStyle={{
                      backgroundColor: theme.card,
                      color: theme.text,
                      contentCSSText: `font-size: 15px; line-height: 1.5; color: ${theme.text};`,
                    }}
                  />
                ) : (
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
                )}
              </View>
            </>
          ) : (
            <>
              <TextInput
                value={titleInput}
                onChangeText={onChangeTitle}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
                placeholder="Title"
                placeholderTextColor={theme.muted}
                style={[
                  styles.titleInput,
                  { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
                ]}
              />

              {photos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {photos.map((uri, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri }} style={styles.photoEdit} />
                      <Pressable
                        style={[styles.removePhotoBtn, { backgroundColor: theme.danger }]}
                        onPress={() => onRemovePhoto(index)}>
                        <Text style={styles.removePhotoText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}

              <View style={styles.toolbarRow}>
                <Pressable
                  onPress={() => setTextStyleVisible(true)}
                  disabled={isTitleFocused}
                  style={[
                    styles.toolbarBtn,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isTitleFocused ? styles.toolbarBtnDisabled : null,
                  ]}>
                  <Text style={[styles.toolbarIcon, { color: theme.text }]}>Aa</Text>
                </Pressable>
                <Pressable
                  onPress={() => setParagraphStyleVisible(true)}
                  disabled={isTitleFocused}
                  style={[
                    styles.toolbarBtn,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isTitleFocused ? styles.toolbarBtnDisabled : null,
                  ]}>
                  <Text style={[styles.toolbarIcon, { color: theme.text }]}>¶</Text>
                </Pressable>
                <Pressable
                  onPress={handlePickImage}
                  disabled={isTitleFocused}
                  style={[
                    styles.toolbarBtn,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isTitleFocused ? styles.toolbarBtnDisabled : null,
                  ]}>
                  <Text style={[styles.toolbarIcon, { color: theme.text }]}>📷</Text>
                </Pressable>
                <Pressable
                  onPress={insertTable}
                  disabled={isTitleFocused}
                  style={[
                    styles.toolbarBtn,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isTitleFocused ? styles.toolbarBtnDisabled : null,
                  ]}>
                  <Text style={[styles.toolbarIcon, { color: theme.text }]}>⊞</Text>
                </Pressable>
                <Pressable
                  onPress={onInsertSkin}
                  disabled={isTitleFocused}
                  style={[
                    styles.toolbarBtn,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    isTitleFocused ? styles.toolbarBtnDisabled : null,
                  ]}>
                  <Text style={[styles.toolbarIcon, { color: theme.text }]}>🎨</Text>
                </Pressable>
              </View>

              <View style={[styles.bodyInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <RichEditor
                  ref={editorRef}
                  initialContentHTML={contentInput}
                  placeholder="Write your note..."
                  useContainer={false}
                  editorStyle={{
                    backgroundColor: theme.card,
                    color: theme.text,
                    caretColor: theme.accent,
                    placeholderColor: theme.muted,
                    contentCSSText: `font-size: 16px; line-height: 1.5; color: ${theme.text};`,
                  }}
                  style={styles.richEditor}
                  onChange={onChangeContent}
                  onFocus={() => applyTypingState(typingStyle, editorColor)}
                />
              </View>

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

      <Modal transparent visible={textStyleVisible} animationType="fade">
        <Pressable style={styles.styleModalOverlay} onPress={() => setTextStyleVisible(false)}>
          <Pressable
            onPress={e => e.stopPropagation()}
            style={[styles.styleModalCard, { backgroundColor: '#26282c', borderColor: '#3b3f46' }]}>
            <View style={styles.styleModalHeader}>
              <Text style={styles.styleModalTitle}>Text styles</Text>
              <Pressable onPress={() => setTextStyleVisible(false)}>
                <Text style={styles.styleModalClose}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.styleToggleRow}>
              <Pressable
                onPress={() => toggleTypingStyle('bold')}
                style={[
                  styles.styleToggleBtn,
                  typingStyle.bold ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={[styles.styleToggleText, styles.styleBold]}>B</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleTypingStyle('italic')}
                style={[
                  styles.styleToggleBtn,
                  typingStyle.italic ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={[styles.styleToggleText, styles.styleItalic]}>I</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleTypingStyle('underline')}
                style={[
                  styles.styleToggleBtn,
                  typingStyle.underline ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={[styles.styleToggleText, styles.styleUnderline]}>U</Text>
              </Pressable>
              <Pressable
                onPress={() => toggleTypingStyle('strikeThrough')}
                style={[
                  styles.styleToggleBtn,
                  typingStyle.strikeThrough ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={[styles.styleToggleText, styles.styleStrike]}>S</Text>
              </Pressable>
            </View>

            <View style={styles.styleSection}>
              <Text style={styles.styleSectionTitle}>Font size</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.styleOptionsRow}>
                  {fontSizes.map(size => (
                    <Pressable
                      key={size}
                      onPress={() => applySizeToCurrentLine(size)}
                      style={styles.styleChip}>
                      <Text
                        style={[
                          styles.styleChipText,
                          size === editorFontSize ? styles.styleChipTextActive : null,
                        ]}>
                        {size}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.styleSection}>
              <Text style={styles.styleSectionTitle}>Font color</Text>
              <View style={styles.colorRow}>
                {fontColors.map(color => (
                  <Pressable
                    key={color}
                    onPress={() => applyColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      color === editorColor ? styles.colorSwatchActive : null,
                    ]}>
                    {color === editorColor ? <Text style={styles.colorCheck}>✓</Text> : null}
                  </Pressable>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={paragraphStyleVisible} animationType="fade">
        <Pressable style={styles.styleModalOverlay} onPress={() => setParagraphStyleVisible(false)}>
          <Pressable
            onPress={e => e.stopPropagation()}
            style={[styles.styleModalCard, { backgroundColor: '#26282c', borderColor: '#3b3f46' }]}>
            <View style={styles.styleModalHeader}>
              <Text style={styles.styleModalTitle}>Paragraph style</Text>
              <Pressable onPress={() => setParagraphStyleVisible(false)}>
                <Text style={styles.styleModalClose}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.styleToggleRow}>
              <Pressable
                onPress={() => applyParagraphAlign('left')}
                style={[
                  styles.styleToggleBtn,
                  paragraphStyle.align === 'left' ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={styles.styleToggleText}>☰</Text>
              </Pressable>
              <Pressable
                onPress={() => applyParagraphAlign('center')}
                style={[
                  styles.styleToggleBtn,
                  paragraphStyle.align === 'center' ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={styles.styleToggleText}>≡</Text>
              </Pressable>
              <Pressable
                onPress={() => applyParagraphAlign('right')}
                style={[
                  styles.styleToggleBtn,
                  paragraphStyle.align === 'right' ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={styles.styleToggleText}>☷</Text>
              </Pressable>
            </View>

            <View style={styles.paragraphMarkerRow}>
              <Pressable
                onPress={() => applyParagraphMarker('dot')}
                style={[
                  styles.paragraphMarkerBtn,
                  paragraphStyle.marker === 'dot' ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={styles.paragraphMarkerIcon}>• 1</Text>
                <Text style={styles.paragraphMarkerText}>Dot number</Text>
              </Pressable>
              <Pressable
                onPress={() => applyParagraphMarker('digit')}
                style={[
                  styles.paragraphMarkerBtn,
                  paragraphStyle.marker === 'digit' ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={styles.paragraphMarkerIcon}>1 2</Text>
                <Text style={styles.paragraphMarkerText}>Digit number</Text>
              </Pressable>
              <Pressable
                onPress={() => applyParagraphMarker('letter')}
                style={[
                  styles.paragraphMarkerBtn,
                  paragraphStyle.marker === 'letter' ? styles.styleToggleBtnActive : null,
                ]}>
                <Text style={styles.paragraphMarkerIcon}>a b</Text>
                <Text style={styles.paragraphMarkerText}>Latter number</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    minHeight: 220,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  richEditor: {
    minHeight: 180,
  },
  richViewer: {
    minHeight: 120,
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
  photoScroll: {
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 8,
  },
  photoView: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 8,
  },
  photoEdit: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
    marginBottom: 12,
  },
  toolbarBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarIcon: {
    fontSize: 18,
  },
  toolbarBtnDisabled: {
    opacity: 0.45,
  },
  styleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  styleModalCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  styleModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleModalTitle: {
    color: '#f5f5f5',
    fontSize: 30,
    fontWeight: '500',
  },
  styleModalClose: {
    color: '#f5f5f5',
    fontSize: 22,
    paddingHorizontal: 8,
  },
  styleToggleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3f434b',
  },
  styleToggleBtn: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32363d',
    borderRightWidth: 1,
    borderRightColor: '#3f434b',
  },
  styleToggleBtnActive: {
    backgroundColor: '#4b5563',
  },
  styleToggleText: {
    color: '#ececec',
    fontSize: 20,
  },
  styleBold: {
    fontWeight: '800',
  },
  styleItalic: {
    fontStyle: 'italic',
  },
  styleUnderline: {
    textDecorationLine: 'underline',
  },
  styleStrike: {
    textDecorationLine: 'line-through',
  },
  styleSection: {
    borderWidth: 1,
    borderColor: '#3f434b',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#30343b',
  },
  styleSectionTitle: {
    color: '#8f96a3',
    fontSize: 13,
    marginBottom: 8,
  },
  styleOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  styleChip: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  styleChipText: {
    color: '#e5e7eb',
    fontSize: 24,
    fontWeight: '500',
  },
  styleChipTextActive: {
    color: '#facc15',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorSwatch: {
    width: 32,
    height: 24,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderColor: '#f8fafc',
    borderWidth: 2,
  },
  colorCheck: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  paragraphMarkerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paragraphMarkerBtn: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderColor: '#3f434b',
    borderRadius: 8,
    backgroundColor: '#32363d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  paragraphMarkerIcon: {
    color: '#ececec',
    fontSize: 14,
    marginBottom: 6,
  },
  paragraphMarkerText: {
    color: '#cbd5e1',
    fontSize: 10,
  },
});

export default DetailScreen;
