import React, { useState, useCallback, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { validateScene } from '../../../shared/validateScene';
import { createErrorScene, builtInScenes } from '../../built-in-scenes';
import Game from '../Game';
import RawEditor from './RawEditor';
import VisualEditor from './VisualEditor';
import { Scene } from '../../../shared/types';
import { GameState, createGameState } from '../../gameState';
import { blankScene } from './blankScene';
import '../../css/editor.css';

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
  const [, setRenderNumber] = useState(0);

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

  const resetPreviewState = useCallback(() => {
    passedState.reset(sceneEditorId);
  }, [passedState]);

  useEffect(() => {
    const rerender = () => setRenderNumber(Math.random());
    passedState.__internal_eventListener.addListener(rerender);
    return () => {
      passedState.__internal_eventListener.removeListener(rerender);
    };
  }, [passedState]);

  if (width < 1145) {
    return (
      <>
        <Game
          state={state}
          extraScenes={{
            'built-in/scene-editor': builtInScenes['built-in/scene-editor-too-small'],
          }}
        />
      </>
    );
  }

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
        <div className='preview-toolbar'>
          <button onClick={resetPreviewState}>Reset</button>
          <div style={{ fontSize: '16px' }}>
            Current Scene: <code>{passedState.scene}</code>
          </div>
        </div>
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
