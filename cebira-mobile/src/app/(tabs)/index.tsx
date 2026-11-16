import { Link } from 'expo-router';

import { ShellScreen } from '@/ui/shell-screen';

export default function HomeScreen() {
  return (
    <ShellScreen title="Ana Sayfa">
      <Link href="/settings">Ayarlar</Link>
    </ShellScreen>
  );
}
