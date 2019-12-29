import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { validateScene } from '../../../shared/validateScene';
import { createErrorScene, builtInScenes } from '../../built-in-scenes';
import Game from '../Game';
import RawEditor from './RawEditor';
import VisualEditor from './VisualEditor';
import MetadataEditor from './MetadataEditor';
import { Scene } from '../../../shared/types';
import { GameState, createGameState } from '../../gameState';
import { blankScene } from './blankScene';
import { ScaleLoader } from 'react-spinners';
import '../../css/editor.css';

export interface SceneEditorProps {
  state: GameState;
}

interface SceneMetadata {
  sceneEditorId: string;
  comment: string;
  publish: boolean;
}

export interface SceneEditorEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  meta: SceneMetadata;
  onMetaChange: (meta: SceneMetadata) => void;
}

type EditorTypes = 'raw' | 'visual' | 'meta';

const editors = {
  raw: RawEditor,
  visual: VisualEditor,
  meta: MetadataEditor,
};

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return await response.json();
}

function SceneEditor({ state }: SceneEditorProps) {
  const [, setRenderNumber] = useState(0);

  const sceneEditorId = state['sceneEditorId'] || 'built-in/preview';

  const [editor, setEditor] = useState<EditorTypes>('visual');
  const [code, setCode] = useState(blankScene);

  const [comments, setComments] = useState('');

  const setEditorTo = {
    visual: useCallback(() => setEditor('visual'), []),
    raw: useCallback(() => setEditor('raw'), []),
    meta: useCallback(() => setEditor('meta'), []),
  };

  let previewedScene: Scene;
  let parseError = false;
  try {
    previewedScene = validateScene(JSON.parse(code));
  } catch (error) {
    previewedScene = createErrorScene(sceneEditorId, error);
    parseError = true;
  }

  const passedState = useMemo(
    () => createGameState(sceneEditorId, { [sceneEditorId]: previewedScene }),
    [code]
  );

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
  const toggleInspector = useCallback(() => {
    passedState.__internal_toggleInspector();
  }, [passedState]);

  useEffect(() => {
    const rerender = () => setRenderNumber(Math.random());
    passedState.__internal_eventListener.addListener(rerender);
    return () => {
      passedState.__internal_eventListener.removeListener(rerender);
    };
  }, [passedState]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isDonePublishing, setIsDonePublishing] = useState(false);
  const onMetaChange = useCallback(
    (meta: SceneMetadata) => {
      setComments(meta.comment);
      if (meta.publish && !parseError) {
        // start publish
        setIsPublishing(true);
        postData('/api/request', {
          id: sceneEditorId,
          scene: previewedScene,
          comment: comments,
        }).then(() => {
          setIsDonePublishing(true);
        });
      }
    },
    [parseError, comments, code, sceneEditorId]
  );

  const goToMainMenu = useCallback(() => {
    state.reset();
  }, []);

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
          <div style={{ flex: 1 }} />
          <button
            className={clsx('editor-switch-button', editor === 'meta' && 'current')}
            onClick={setEditorTo.meta}
          >
            Finish and Publish
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
          <Editor
            onCodeChange={setCode}
            code={code}
            meta={{ sceneEditorId, comment: comments, publish: false }}
            onMetaChange={onMetaChange}
          />
        </div>
      </div>
      <div className='editorPreview'>
        <div className='preview-toolbar'>
          <button onClick={resetPreviewState}>Reset</button>
          <button onClick={toggleInspector}>Inspect</button>
          <div style={{ fontSize: '16px' }}>
            Current Scene: <code>{passedState.scene}</code>
          </div>
        </div>
        <Game
          state={passedState}
          extraScenes={{
            [sceneEditorId]: previewedScene,
          }}
          sceneEditorId={sceneEditorId}
        />
      </div>
      {isPublishing && (
        <div className='publish-overlay'>
          {!isDonePublishing ? (
            <>
              <span>Publishing...</span> <ScaleLoader width={8} height={60} color='white' />
            </>
          ) : (
            <>
              <span>Requested</span>{' '}
              <span style={{ fontSize: '20px' }}>
                Join the{' '}
                <a className='link' href='https://discord.gg/ABwjpk4'>
                  Discord Server
                </a>{' '}
                to vote and discuss on the scene.
                <br />
              </span>
              <span style={{ fontSize: '20px' }}>
                Go back to the{' '}
                <a className='link' href='#' onClick={goToMainMenu}>
                  Main Menu
                </a>
                .
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SceneEditor;
