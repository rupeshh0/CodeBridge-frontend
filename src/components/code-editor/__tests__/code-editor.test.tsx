import React from 'react';
import { render, screen } from '@testing-library/react';
import { CodeEditor } from '../code-editor';

// Mock the CodeMirror modules
jest.mock('@codemirror/state', () => ({
  EditorState: {
    create: jest.fn(() => ({})),
  },
}));

jest.mock('@codemirror/view', () => ({
  EditorView: {
    updateListener: {
      of: jest.fn(),
    },
    editable: {
      of: jest.fn(),
    },
  },
  keymap: {
    of: jest.fn(),
  },
  lineNumbers: jest.fn(),
  highlightActiveLine: jest.fn(),
}));

jest.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  history: jest.fn(),
  historyKeymap: [],
}));

jest.mock('@codemirror/lang-javascript', () => ({
  javascript: jest.fn(() => ({})),
}));

jest.mock('@codemirror/lang-python', () => ({
  python: jest.fn(() => ({})),
}));

jest.mock('@codemirror/theme-one-dark', () => ({
  oneDark: {},
}));

describe('CodeEditor', () => {
  it('renders without crashing', () => {
    render(<CodeEditor />);
    // The component should render without throwing an error
    expect(document.querySelector('div')).toBeInTheDocument();
  });

  it('applies the correct language based on props', () => {
    const javascriptMock = require('@codemirror/lang-javascript').javascript;
    const pythonMock = require('@codemirror/lang-python').python;

    // Test with JavaScript
    render(<CodeEditor language="javascript" />);
    expect(javascriptMock).toHaveBeenCalled();
    expect(pythonMock).not.toHaveBeenCalled();

    // Reset mocks
    javascriptMock.mockClear();
    pythonMock.mockClear();

    // Test with Python
    render(<CodeEditor language="python" />);
    expect(pythonMock).toHaveBeenCalled();
    expect(javascriptMock).not.toHaveBeenCalled();
  });

  it('passes the initial code to the editor', () => {
    const createMock = require('@codemirror/state').EditorState.create;
    const initialCode = 'console.log("Hello, world!");';

    render(<CodeEditor initialCode={initialCode} />);
    
    // Check if EditorState.create was called with the initial code
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        doc: initialCode,
      })
    );
  });

  it('sets readOnly mode correctly', () => {
    const editableMock = require('@codemirror/view').EditorView.editable.of;

    // Test with readOnly = false (default)
    render(<CodeEditor />);
    expect(editableMock).toHaveBeenCalledWith(true);

    // Reset mock
    editableMock.mockClear();

    // Test with readOnly = true
    render(<CodeEditor readOnly={true} />);
    expect(editableMock).toHaveBeenCalledWith(false);
  });
});
