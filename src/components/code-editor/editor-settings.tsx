'use client';

import React from 'react';
import { Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface EditorSettingsProps {
  onFontSizeChange: (size: number) => void;
  onLineWrappingChange: (enabled: boolean) => void;
  onAutoCompletionChange: (enabled: boolean) => void;
  fontSize: number;
  lineWrapping: boolean;
  enableAutoCompletion: boolean;
}

export function EditorSettings({
  onFontSizeChange,
  onLineWrappingChange,
  onAutoCompletionChange,
  fontSize,
  lineWrapping,
  enableAutoCompletion,
}: EditorSettingsProps) {
  // Store settings in localStorage
  const [savedFontSize, setSavedFontSize] = useLocalStorage<number>('kodelab-editor-font-size', 14);
  const [savedLineWrapping, setSavedLineWrapping] = useLocalStorage<boolean>('kodelab-editor-line-wrapping', false);
  const [savedAutoCompletion, setSavedAutoCompletion] = useLocalStorage<boolean>('kodelab-editor-auto-completion', true);

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    onFontSizeChange(newSize);
    setSavedFontSize(newSize);
  };

  // Handle line wrapping change
  const handleLineWrappingChange = (enabled: boolean) => {
    onLineWrappingChange(enabled);
    setSavedLineWrapping(enabled);
  };

  // Handle auto completion change
  const handleAutoCompletionChange = (enabled: boolean) => {
    onAutoCompletionChange(enabled);
    setSavedAutoCompletion(enabled);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Editor settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Editor Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="px-2 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Font Size: {fontSize}px</span>
            </div>
            <Slider
              defaultValue={[fontSize]}
              min={10}
              max={24}
              step={1}
              onValueChange={handleFontSizeChange}
              className="my-2"
            />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={lineWrapping}
            onCheckedChange={handleLineWrappingChange}
          >
            Line Wrapping
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={enableAutoCompletion}
            onCheckedChange={handleAutoCompletionChange}
          >
            Auto Completion
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          // Reset to defaults
          onFontSizeChange(14);
          onLineWrappingChange(false);
          onAutoCompletionChange(true);
          setSavedFontSize(14);
          setSavedLineWrapping(false);
          setSavedAutoCompletion(true);
        }}>
          Reset to Defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
