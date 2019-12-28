import React, { useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { validateScene } from '../../../shared/validateScene';
import { createErrorScene } from '../../built-in-scenes';
import Game from '../Game';
import RawEditor from './RawEditor';
import VisualEditor from './VisualEditor';
import { Scene } from '../../../shared/types';
import { GameState, createGameState } from '../../gameState';
import { blankScene } from './blankScene';
import '../css/editor.css';

export interface SceneEditorProps {
  state: GameState;
}

export interface SceneEditorEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
}

type EditorTypes = 'raw' | 'visual';

const editors = {
  raw: RawEditor,
  visual: VisualEditor,
};

function SceneEditor({ state }: SceneEditorProps) {
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
        <div className='editor-switch-container'>
          <button
            className={clsx('editor-switch-button', editor === 'raw' && 'current')}
            onClick={setEditorTo.raw}
          >
            Raw Code
          </button>
          <button
            className={clsx('editor-switch-button', editor === 'visual' && 'current')}
            onClick={setEditorTo.visual}
          >
            Visual Editor
          </button>
        </div>
        <div
          style={{
            position: 'absolute',
            overflow: 'hidden',
            top: '32px',
            left: '0',
            right: '0',
            bottom: '0',
          }}
        >
          <Editor onCodeChange={setCode} code={code} />
        </div>
      </div>
      <div className='editorPreview'>
        <Game
          state={passedState}
          extraScenes={{
            [sceneEditorId]: previewedScene,
          }}
          isSceneEditorPreview
        />
      </div>
    </div>
  );
}

export default SceneEditor;
