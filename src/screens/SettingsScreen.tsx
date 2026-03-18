import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AppTheme, ThemeId } from '../types/app';
import { THEMES } from '../theme/themes';

type Props = {
  currentTheme: AppTheme;
  currentThemeId: ThemeId;
  onBack: () => void;
  onSelectTheme: (themeId: ThemeId) => void;
  topSpacing: number;
  bottomSpacing: number;
};

function SettingsScreen({
  currentTheme,
  currentThemeId,
  onBack,
  onSelectTheme,
  topSpacing,
  bottomSpacing,
}: Props) {
  return (
    <View style={[styles.root, { backgroundColor: currentTheme.bg }]}>
      <View style={[styles.headerWrap, { paddingTop: topSpacing + 2 }]}> 
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} hitSlop={8}>
            <Text style={[styles.backText, { color: currentTheme.accent }]}> 
              ← Back
            </Text>
          </Pressable>
          <Text style={[styles.titleText, { color: currentTheme.text }]}>
            Settings
          </Text>
          <View style={styles.placeholderView} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomSpacing + 20 },
        ]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
          Themes
        </Text>

        {Object.values(THEMES).map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: item.card,
                borderColor: currentThemeId === item.id ? item.accent : item.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            onPress={() => onSelectTheme(item.id)}>
            <View style={[styles.themeSwatch, { backgroundColor: item.accent }]} />
            <View style={styles.themeInfo}>
              <Text style={[styles.themeName, { color: item.text }]}> 
                {item.name}
              </Text>
              <Text style={[styles.themeId, { color: item.muted }]}> 
                {item.id}
              </Text>
            </View>
            <Text style={[styles.themeStatus, { color: item.accent }]}> 
              {currentThemeId === item.id ? 'Selected' : 'Select'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 16,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
  },
  placeholderView: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  themeSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  themeId: {
    fontSize: 12,
  },
  themeStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SettingsScreen;
