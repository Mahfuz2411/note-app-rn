import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LogoMark from '../components/LogoMark';
import type { AppTheme } from '../types/app';

type Props = {
  theme: AppTheme;
};

function SplashScreen({ theme }: Props) {
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LogoMark accent={theme.accent} size={76} />
      <Text style={[styles.brandTitle, { color: theme.text }]}> 
        notes
      </Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Organize your thoughts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    marginTop: 16,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
});

export default SplashScreen;
