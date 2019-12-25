import React, { useState, Component, useRef, useCallback, useEffect, useMemo } from 'react';
import { GameState, createGameState } from './gameState';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import './css/editor.css';
import Game from './Game';
import { Scene } from '../shared/types';
import { validateScene } from '../shared/validateScene';

import schema from '../../scene.schema.json';

export interface SceneEditorProps {
  state: GameState;
}

const blankScene = JSON.stringify(
  {
    type: 'scene',
    passage: 'You stumble upon a penny when walking to work.',
    options: [
      {
        label: 'Pick it up.',
        to: 'pennyPickup',
        isVisible: 'isPennyOnGround',
      },
      {
        label: 'Leave it.',
        to: 'work',
      },
    ],
    onFirstActivate: 'isPennyOnGround = true',
    source: 'yourself',
  },
  null,
  2
);

const modelUri = monaco.Uri.parse('a://b/foo.json'); // a made up unique URI for our model

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: [
    {
      uri: `${location.protocol}//${location.host}/scene.schema.json`, // id of the first schema
      fileMatch: [modelUri.toString()], // associate with our model
      schema: schema,
    },
  ],
});

export function SceneEditor({ state }: SceneEditorProps) {
  const sceneEditorId = state['sceneEditorId'] || 'built-in/preview';

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [code, setCode] = useState(blankScene);

  const editorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;

      const model = monaco.editor.createModel(blankScene, 'json', modelUri);
      editor.setModel(model);
    },
    [editorRef]
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

  let previewedScene: Scene;
  try {
    previewedScene = validateScene(JSON.parse(code));
  } catch (error) {
    previewedScene = createErrorScene(sceneEditorId, error);
  }

  const passedState = useMemo(() => createGameState(sceneEditorId), [code]);

  return (
    <div className='editor'>
      <div className='editorEditor'>
        <MonacoEditor
          language='json'
          theme='vs-dark'
          value={code}
          options={{}}
          onChange={setCode}
          editorDidMount={editorDidMount}
        />
      </div>
      <div className='editorPreview'>
        <Game
          state={passedState}
          editorPreview={{
            scene: previewedScene,
          }}
        />
      </div>
    </div>
  );
}
