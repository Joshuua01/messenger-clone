import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <Button variant="outline" onClick={() => toggleTheme()}>
      {theme === 'light' ? (
        <>
          Light <Sun />
        </>
      ) : (
        <>
          Dark <Moon />
        </>
      )}
    </Button>
  );
}
