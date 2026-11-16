import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function WebTabLayout() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={styles.list}>
        <TabTrigger name="home" href="/" asChild>
          <Pressable>
            <ThemedText type="small">Ana Sayfa</ThemedText>
          </Pressable>
        </TabTrigger>
        <TabTrigger name="transactions" href="/transactions" asChild>
          <Pressable>
            <ThemedText type="small">İşlemler</ThemedText>
          </Pressable>
        </TabTrigger>
        <TabTrigger name="add" href="/add" asChild>
          <Pressable>
            <ThemedText type="small">Ekle</ThemedText>
          </Pressable>
        </TabTrigger>
        <TabTrigger name="budget" href="/budget" asChild>
          <Pressable>
            <ThemedText type="small">Bütçe</ThemedText>
          </Pressable>
        </TabTrigger>
        <TabTrigger name="accounts" href="/accounts" asChild>
          <Pressable>
            <ThemedText type="small">Hesaplar</ThemedText>
          </Pressable>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
  },
});
