import React, { useState, useCallback, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { SceneEditorEditorProps } from './SceneEditor';
import { modelUri } from './monaco-config';
import { blankScene } from './blankScene';

const model =
  monaco.editor.getModel(modelUri) || monaco.editor.createModel(blankScene, 'json', modelUri);

function RawEditor({ code, onCodeChange }: SceneEditorEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const editorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;

      console.log('mounted');

      model.setValue(code);

      editor.setModel(model);
    },
    [code, editorRef]
  );

  useEffect(() => {
    function resizeHandler() {
      if (editorRef.current !== undefined) {
        editorRef.current.layout();
      }
    }
    if (editorRef.current !== undefined) {
      window.addEventListener('resize', resizeHandler);
      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }
  }, [editorRef.current]);

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    function handler() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  return (
    <MonacoEditor
      language='json'
      theme='cta'
      options={{
        wordWrap: 'wordWrapColumn',
        wordWrapColumn: Math.floor(((width - 20) / 2 - 200) / 8.43),
      }}
      onChange={onCodeChange}
      editorDidMount={editorDidMount}
    />
  );
}

export default RawEditor;
