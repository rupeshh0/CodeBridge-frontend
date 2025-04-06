'use client';

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { editorThemes } from './code-editor';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ThemeSelectorProps {
  onChange: (theme: keyof typeof editorThemes) => void;
  currentTheme: keyof typeof editorThemes;
}

export function ThemeSelector({ onChange, currentTheme }: ThemeSelectorProps) {
  // Store the selected theme in localStorage
  const [savedTheme, setSavedTheme] = useLocalStorage<keyof typeof editorThemes>(
    'kodelab-editor-theme',
    'oneDark'
  );

  // Handle theme change
  const handleThemeChange = (theme: keyof typeof editorThemes) => {
    onChange(theme);
    setSavedTheme(theme);
  };

  // Theme display names with light/dark indicators
  const themeDisplayNames: Record<keyof typeof editorThemes, { name: string; type: 'light' | 'dark' }> = {
    oneDark: { name: 'One Dark', type: 'dark' },
    vscodeDark: { name: 'VS Code Dark', type: 'dark' },
    githubDark: { name: 'GitHub Dark', type: 'dark' },
    githubLight: { name: 'GitHub Light', type: 'light' },
    materialDark: { name: 'Material Dark', type: 'dark' },
    materialLight: { name: 'Material Light', type: 'light' },
    dracula: { name: 'Dracula', type: 'dark' },
    sublime: { name: 'Sublime', type: 'dark' },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <span>Theme</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Dark Themes</DropdownMenuLabel>
          {Object.keys(editorThemes)
            .filter(key => themeDisplayNames[key as keyof typeof editorThemes].type === 'dark')
            .map(key => (
              <DropdownMenuItem
                key={key}
                onClick={() => handleThemeChange(key as keyof typeof editorThemes)}
                className="flex items-center justify-between"
              >
                {themeDisplayNames[key as keyof typeof editorThemes].name}
                {currentTheme === key && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Light Themes</DropdownMenuLabel>
          {Object.keys(editorThemes)
            .filter(key => themeDisplayNames[key as keyof typeof editorThemes].type === 'light')
            .map(key => (
              <DropdownMenuItem
                key={key}
                onClick={() => handleThemeChange(key as keyof typeof editorThemes)}
                className="flex items-center justify-between"
              >
                {themeDisplayNames[key as keyof typeof editorThemes].name}
                {currentTheme === key && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
