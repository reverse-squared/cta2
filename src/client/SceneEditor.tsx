import React, { useState, Component, useRef, useCallback, useEffect, useMemo } from 'react';
import { GameState, createGameState } from './gameState';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import './css/editor.css';
import Game from './Game';
import { Scene } from '../shared/types';
import { validateScene } from '../shared/validateScene';

import schema from '../../scene.schema.json';
import { createErrorScene } from './built-in-scenes';
import { modelUri } from './monaco-config';
import {
  StringObject,
  TextareaChangeEvent,
  SelectChangeEvent,
  InputChangeEvent,
} from './type-shorthand';

export interface SceneEditorProps {
  state: GameState;
}

export interface SceneEditorEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
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

const model = monaco.editor.createModel(blankScene, 'json', modelUri);

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
      theme='vs-dark'
      options={{}}
      onChange={(x) => onCodeChange(x)}
      editorDidMount={editorDidMount}
    />
  );
}

function VisualEditor({ code, onCodeChange }: SceneEditorEditorProps) {
  const reset = useCallback(() => {
    onCodeChange(blankScene);
  }, []);

  let scene: Scene;
  let error: any;
  try {
    scene = validateScene(JSON.parse(code));
  } catch (e) {
    error = e;
    scene = null as any;
  }

  const updateScene = useCallback(
    (scene: Scene) => {
      onCodeChange(JSON.stringify(scene, null, 2));
    },
    [onCodeChange]
  );

  // handlers for stuff
  const onTypeUpdate = useCallback(
    (ev: InputChangeEvent) => {
      scene.type = ev.currentTarget.checked ? 'scene' : 'ending';

      if (scene.type === 'scene') {
        delete scene.options;
        delete scene.preloadScenes;
        delete scene.onFirstActivate;
        delete scene.onFirstDeactivate;
        delete scene.onActivate;
        delete scene.onDeactivate;
      } else {
        delete scene.title;
        delete scene.description;
      }

      scene.type = scene.type === 'ending' ? 'scene' : 'ending';

      if (scene.type === 'scene') {
        scene.options = [];
      } else {
        scene.title = '';
        scene.description = '';
      }

      updateScene(scene);
    },
    [scene, updateScene]
  );
  const onPassageUpdate = useCallback(
    (ev: TextareaChangeEvent) => {
      scene.passage = ev.currentTarget.value;

      updateScene(scene);
    },
    [scene, updateScene]
  );

  if (!scene) {
    return (
      <div>
        <h1>Error in Scene Formatting</h1>
        <pre>{error.stack || error}</pre>
        <a href='#' onClick={reset}>
          Reset your scene (Discards information)
        </a>
      </div>
    );
  }

  return (
    <>
      <p>note: the visual editor is a work in progress in beta.</p>

      <div>
        <label htmlFor='is_ending'>
          <input
            id='is_ending'
            type='checkbox'
            checked={scene.type === 'ending'}
            onChange={onTypeUpdate}
          />
          Is Ending Scene.
        </label>
      </div>

      <div>
        <textarea value={scene.passage} onChange={onPassageUpdate} />
      </div>

      {scene.type === 'scene' ? (
        <>
          <h2>[options]</h2>
          <h2>[the on* things]</h2>
        </>
      ) : (
        <>
          <h2>[ending title]</h2>
          <h2>[ending description]</h2>
        </>
      )}
      <h2>[css]</h2>
      <h2>[source]</h2>
    </>
  );
}

type EditorTypes = 'raw' | 'visual';

const editors = {
  raw: RawEditor,
  visual: VisualEditor,
};

export function SceneEditor({ state }: SceneEditorProps) {
  const sceneEditorId = state['sceneEditorId'] || 'built-in/preview';

  const [editor, setEditor] = useState<EditorTypes>('visual');
  const [code, setCode] = useState(blankScene);

  const setEditorTo = {
    visual: useCallback(() => setEditor('visual'), []),
    raw: useCallback(() => setEditor('raw'), []),
  };

  let previewedScene: Scene;
  try {
    previewedScene = validateScene(JSON.parse(code));
  } catch (error) {
    previewedScene = createErrorScene(sceneEditorId, error);
  }

  const passedState = useMemo(() => createGameState(sceneEditorId), [code]);

  const Editor = editors[editor];

  return (
    <div className='editor'>
      <div className='editorEditor'>
        <div>
          <button onClick={setEditorTo.raw}>Raw Code</button>
          <button onClick={setEditorTo.visual}>Visual Editor</button>
        </div>
        <Editor onCodeChange={setCode} code={code} />
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
