import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

type Props = {
  icon: string;
  onPress: () => void;
  color: string;
  backgroundColor: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
};

function IconButton({
  icon,
  onPress,
  color,
  backgroundColor,
  disabled = false,
  style,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: false }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}>
      <Text style={[styles.icon, { color }]}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default IconButton;
