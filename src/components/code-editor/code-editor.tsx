'use client';

import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { oneDark } from '@codemirror/theme-one-dark';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { materialDark, materialLight } from '@uiw/codemirror-theme-material';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { sublime } from '@uiw/codemirror-theme-sublime';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { searchKeymap } from '@codemirror/search';
import { foldKeymap, commentKeymap } from '@codemirror/language';
import { indentUnit } from '@codemirror/language';
import { bracketMatching } from '@codemirror/language';

// Available themes
export const editorThemes = {
  'oneDark': oneDark,
  'vscodeDark': vscodeDark,
  'githubDark': githubDark,
  'githubLight': githubLight,
  'materialDark': materialDark,
  'materialLight': materialLight,
  'dracula': dracula,
  'sublime': sublime,
};

// Available languages
export type EditorLanguage = 'javascript' | 'python' | 'java' | 'cpp' | 'rust';

interface CodeEditorProps {
  initialCode?: string;
  language?: EditorLanguage;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  theme?: keyof typeof editorThemes;
  fontSize?: number;
  lineWrapping?: boolean;
  enableAutocompletion?: boolean;
}

export function CodeEditor({
  initialCode = '',
  language = 'javascript',
  onChange,
  readOnly = false,
  theme = 'oneDark',
  fontSize = 14,
  lineWrapping = false,
  enableAutocompletion = true,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Memoize the language extension to prevent unnecessary re-renders
  const languageExtension = useMemo(() => {
    switch (language) {
      case 'javascript':
        return javascript();
      case 'python':
        return python();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      case 'rust':
        return rust();
      default:
        return javascript();
    }
  }, [language]);

  // Memoize the theme extension
  const themeExtension = useMemo(() => {
    return editorThemes[theme];
  }, [theme]);

  // Memoize the onChange handler
  const handleChange = useCallback(
    (update: any) => {
      if (update.changes && onChange) {
        onChange(update.state.doc.toString());
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (!editorRef.current) return;

    // Clean up any existing editor
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Use the memoized language extension

    // Create a new editor state
    const startState = EditorState.create({
      doc: initialCode,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentUnit.of('    '),
        bracketMatching(),
        closeBrackets(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...foldKeymap,
          ...commentKeymap,
          ...completionKeymap,
          ...closeBracketsKeymap,
          ...lintKeymap,
          indentWithTab
        ]),
        languageExtension,
        themeExtension,
        EditorView.updateListener.of(handleChange),
        EditorView.editable.of(!readOnly),
        lineWrapping ? EditorView.lineWrapping : [],
        enableAutocompletion ? autocompletion() : [],
        EditorView.theme({
          '&': {
            fontSize: `${fontSize}px`,
          },
          '.cm-content': {
            fontFamily: '"Geist Mono", monospace',
          },
          '.cm-cursor': {
            borderLeftWidth: '2px',
          },
          '&.cm-focused .cm-cursor': {
            borderLeftColor: '#fff',
          },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
            backgroundColor: 'rgba(97, 174, 238, 0.2)',
          },
        }),
        EditorView.domEventHandlers({
          focus: () => {
            setIsFocused(true);
            return false;
          },
          blur: () => {
            setIsFocused(false);
            return false;
          },
        }),
      ],
    });

    // Create and attach the editor view
    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [initialCode, language, onChange, readOnly]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-3 py-1 bg-muted text-xs border-b">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{language.toUpperCase()}</span>
          <span className="text-muted-foreground">{isFocused ? 'Editing' : 'Viewing'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Tab</kbd>
          <span className="text-muted-foreground">for indent</span>
          <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Ctrl+Space</kbd>
          <span className="text-muted-foreground">for suggestions</span>
        </div>
      </div>
      <div
        ref={editorRef}
        className="flex-1 overflow-hidden min-h-[300px] bg-background"
      />
    </div>
  );
}
