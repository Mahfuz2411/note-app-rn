import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  accent: string;
  size?: number;
};

function LogoMark({ accent, size = 56 }: Props) {
  const radius = Math.round(size * 0.24);
  const sheetWidth = Math.round(size * 0.56);
  const sheetHeight = Math.round(size * 0.68);
  const topLineWidth = Math.round(sheetWidth * 0.62);
  const lineWidth = Math.round(sheetWidth * 0.74);
  const lineHeight = Math.max(2, Math.round(size * 0.08));
  const lineGap = Math.max(3, Math.round(size * 0.08));

  return (
    <View
      style={[
        styles.logoBase,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: accent,
        },
      ]}
    >
      <View
        style={[
          styles.paper,
          {
            width: sheetWidth,
            height: sheetHeight,
          },
        ]}
      >
        <View style={[styles.line, { width: topLineWidth, height: lineHeight, marginBottom: lineGap }]} />
        <View style={[styles.line, { width: lineWidth, height: lineHeight, marginBottom: lineGap }]} />
        <View style={[styles.line, { width: lineWidth, height: lineHeight }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    borderRadius: 999,
    backgroundColor: '#0f172a',
  },
});

export default LogoMark;
