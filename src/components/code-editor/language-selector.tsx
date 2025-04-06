'use client';

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditorLanguage } from './code-editor';

interface LanguageSelectorProps {
  onChange: (language: EditorLanguage) => void;
  currentLanguage: EditorLanguage;
  supportedLanguages?: EditorLanguage[];
}

export function LanguageSelector({ 
  onChange, 
  currentLanguage,
  supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'rust']
}: LanguageSelectorProps) {
  // Language display names with icons
  const languageDisplayNames: Record<EditorLanguage, { name: string; icon: string }> = {
    javascript: { name: 'JavaScript', icon: 'JS' },
    python: { name: 'Python', icon: 'PY' },
    java: { name: 'Java', icon: 'JV' },
    cpp: { name: 'C++', icon: 'C++' },
    rust: { name: 'Rust', icon: 'RS' },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <span className="font-mono text-xs px-1 py-0.5 bg-muted rounded">
            {languageDisplayNames[currentLanguage].icon}
          </span>
          <span>{languageDisplayNames[currentLanguage].name}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedLanguages.map(lang => (
          <DropdownMenuItem
            key={lang}
            onClick={() => onChange(lang)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-1 py-0.5 bg-muted rounded">
                {languageDisplayNames[lang].icon}
              </span>
              <span>{languageDisplayNames[lang].name}</span>
            </div>
            {currentLanguage === lang && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
