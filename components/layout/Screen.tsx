import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';

interface Props {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  background?: string;
}

export function Screen({ children, edges = ['top'], background }: Props) {
  return (
    <SafeAreaView edges={edges} style={[styles.root, background ? { backgroundColor: background } : null]}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1 },
});
