import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SHELL_NOTE } from '@/navigation/shell-routes';

type ShellScreenProps = {
  title: string;
  children?: ReactNode;
};

export function ShellScreen({ title, children }: ShellScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text>{SHELL_NOTE}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
  },
});
