/// <reference types="jest" />
import { render, screen } from '@testing-library/react-native';

import { SHELL_NOTE, shellTabs } from '@/navigation/shell-routes';
import { ShellScreen } from '@/ui/shell-screen';

describe('Faz 1 shell', () => {
  test('placeholder screen shows the title and shell note', async () => {
    await render(<ShellScreen title="Ana Sayfa" />);

    expect(screen.getByText('Ana Sayfa')).toBeTruthy();
    expect(screen.getByText(SHELL_NOTE)).toBeTruthy();
  });

  test('tabs are the five product destinations', () => {
    expect(shellTabs.map((tab) => tab.title)).toEqual([
      'Ana Sayfa',
      'İşlemler',
      'Ekle',
      'Bütçe',
      'Hesaplar',
    ]);
  });
});
