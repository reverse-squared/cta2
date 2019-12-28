import React, { useRef, useCallback, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { SceneEditorEditorProps } from './SceneEditor';
import { modelUri } from './monaco-config';
import { blankScene } from './blankScene';

export const model = monaco.editor.createModel(blankScene, 'json', modelUri);

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

  return (
    <MonacoEditor
      language='json'
      theme='cta'
      options={{}}
      onChange={(x) => onCodeChange(x)}
      editorDidMount={editorDidMount}
    />
  );
}

export default RawEditor;
