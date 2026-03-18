import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

function ThemeScreen({
  currentTheme,
  currentThemeId,
  onBack,
  onSelectTheme,
  topSpacing,
  bottomSpacing,
}: Props) {
  return (
    <View
      className="flex-1 px-4"
      style={[
        {
          paddingTop: topSpacing + 2,
          paddingBottom: bottomSpacing + 6,
          backgroundColor: currentTheme.bg,
        },
      ]}>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable onPress={onBack} hitSlop={8}>
          <Text className="text-sm font-bold" style={{ color: currentTheme.accent }}>Back</Text>
        </Pressable>
        <Text className="text-xl font-extrabold" style={{ color: currentTheme.text }}>
          Choose Theme
        </Text>
        <View style={styles.placeholderView} />
      </View>

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
          <View className="flex-1">
            <Text className="text-sm font-bold" style={{ color: item.text }}>
              {item.name}
            </Text>
            <Text className="text-xs" style={{ color: item.muted }}>
              {item.id}
            </Text>
          </View>
          <Text className="text-xs font-bold" style={{ color: item.accent }}> 
            {currentThemeId === item.id ? 'Selected' : 'Select'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderView: {
    width: 36,
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
});

export default ThemeScreen;
