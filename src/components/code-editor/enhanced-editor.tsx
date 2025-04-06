'use client';

import React, { useState, useEffect } from 'react';
import { CodeEditor, EditorLanguage, editorThemes } from './code-editor';
import { ThemeSelector } from './theme-selector';
import { LanguageSelector } from './language-selector';
import { EditorSettings } from './editor-settings';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Copy, Check, Play, Save } from 'lucide-react';

interface EnhancedEditorProps {
  initialCode?: string;
  language?: EditorLanguage;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  supportedLanguages?: EditorLanguage[];
  onRun?: () => void;
  onSave?: () => void;
  showRunButton?: boolean;
  showSaveButton?: boolean;
}

export function EnhancedEditor({
  initialCode = '',
  language: initialLanguage = 'javascript',
  onChange,
  readOnly = false,
  supportedLanguages,
  onRun,
  onSave,
  showRunButton = false,
  showSaveButton = false,
}: EnhancedEditorProps) {
  // Get saved settings from localStorage
  const [savedTheme] = useLocalStorage<keyof typeof editorThemes>('kodelab-editor-theme', 'oneDark');
  const [savedFontSize] = useLocalStorage<number>('kodelab-editor-font-size', 14);
  const [savedLineWrapping] = useLocalStorage<boolean>('kodelab-editor-line-wrapping', false);
  const [savedAutoCompletion] = useLocalStorage<boolean>('kodelab-editor-auto-completion', true);
  
  // State for editor settings
  const [theme, setTheme] = useState<keyof typeof editorThemes>(savedTheme);
  const [fontSize, setFontSize] = useState<number>(savedFontSize);
  const [lineWrapping, setLineWrapping] = useState<boolean>(savedLineWrapping);
  const [enableAutoCompletion, setEnableAutoCompletion] = useState<boolean>(savedAutoCompletion);
  const [language, setLanguage] = useState<EditorLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(initialCode);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Update code when initialCode changes
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);
  
  // Update language when initialLanguage changes
  useEffect(() => {
    setLanguage(initialLanguage);
  }, [initialLanguage]);
  
  // Handle code change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-col h-full border rounded-md overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-muted/40 border-b">
        <div className="flex items-center space-x-2">
          {!readOnly && supportedLanguages && (
            <LanguageSelector
              onChange={setLanguage}
              currentLanguage={language}
              supportedLanguages={supportedLanguages}
            />
          )}
          {!readOnly && (
            <ThemeSelector
              onChange={setTheme}
              currentTheme={theme}
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!readOnly && (
            <EditorSettings
              onFontSizeChange={setFontSize}
              onLineWrappingChange={setLineWrapping}
              onAutoCompletionChange={setEnableAutoCompletion}
              fontSize={fontSize}
              lineWrapping={lineWrapping}
              enableAutoCompletion={enableAutoCompletion}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          {showRunButton && onRun && (
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1"
              onClick={onRun}
            >
              <Play className="h-4 w-4" />
              Run
            </Button>
          )}
          {showSaveButton && onSave && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={onSave}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1">
        <CodeEditor
          initialCode={code}
          language={language}
          onChange={handleCodeChange}
          readOnly={readOnly}
          theme={theme}
          fontSize={fontSize}
          lineWrapping={lineWrapping}
          enableAutocompletion={enableAutoCompletion}
        />
      </div>
    </div>
  );
}
