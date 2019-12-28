import React, { useState, Component, useRef, useCallback, useEffect, useMemo } from 'react';
import { GameState, createGameState } from './gameState';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { moveIndex } from '@reverse/array';
import clsx from 'clsx';

import './css/editor.css';
import Game from './Game';
import { Scene, Source } from '../shared/types';
import { validateScene } from '../shared/validateScene';

import { createErrorScene, builtInScenes } from './built-in-scenes';
import { modelUri } from './monaco-config';
import { TextareaChangeEvent, InputChangeEvent } from './type-shorthand';
import { SchemaError } from 'jsonschema';

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
      theme='cta'
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

  const sources: { name: string; desc?: string }[] =
    scene.source === null
      ? []
      : typeof scene.source === 'string'
      ? [{ name: scene.source }]
      : Array.isArray(scene.source)
      ? scene.source.map((source) => (typeof source === 'string' ? { name: source } : source))
      : [scene.source];

  function handleAddAnotherOption() {
    if (scene.type === 'scene') {
      scene.options.push({
        label: '',
        to: '',
      });
    }

    updateScene(scene);
  }
  function handleAddAnotherSeparator() {
    if (scene.type === 'scene') {
      scene.options.push('separator');
    }

    updateScene(scene);
  }
  function handleDeleteOption(index: number) {
    if (scene.type === 'scene') {
      if (scene.options.length === 1) {
        return;
      }

      scene.options.splice(index, 1);

      updateScene(scene);
    }
  }
  function handleOptionLabelChange(index: number, ev: React.ChangeEvent<HTMLInputElement>) {
    if (scene.type === 'scene') {
      let sceneOptions = scene.options[index];
      if (sceneOptions !== 'separator') {
        sceneOptions.label = ev.currentTarget.value;
      }
      scene.options[index] = sceneOptions;

      updateScene(scene);
    }
  }
  function handleOptionToChange(index: number, ev: React.ChangeEvent<HTMLInputElement>) {
    if (scene.type === 'scene') {
      let sceneOptions = scene.options[index];
      if (sceneOptions !== 'separator') {
        sceneOptions.to = ev.currentTarget.value;
      }
      scene.options[index] = sceneOptions;

      updateScene(scene);
    }
  }
  function handleCssChange(ev: TextareaChangeEvent) {
    scene.css = ev.currentTarget.value;
    updateScene(scene);
  }
  function handleOnActivateChange(ev: TextareaChangeEvent) {
    scene.onActivate = ev.currentTarget.value;
    updateScene(scene);
  }
  function handleOnFirstActivateChange(ev: TextareaChangeEvent) {
    scene.onFirstActivate = ev.currentTarget.value;
    updateScene(scene);
  }
  function handleOnDeactivateChange(ev: TextareaChangeEvent) {
    if (scene.type === 'scene') {
      scene.onDeactivate = ev.currentTarget.value;
      updateScene(scene);
    }
  }
  function handleOnFirstDeactivateChange(ev: TextareaChangeEvent) {
    if (scene.type === 'scene') {
      scene.onFirstDeactivate = ev.currentTarget.value;
      updateScene(scene);
    }
  }
  function handleAddSource() {
    sources.push({
      name: '',
      desc: '',
    });
    updateScene(scene);
  }
  function handleSourceNameChange(index: number, ev: React.ChangeEvent<HTMLInputElement>) {
    sources[index].name = ev.currentTarget.value;
    updateScene(scene);
  }
  function handleSourceDescriptionChange(index: number, ev: React.ChangeEvent<HTMLInputElement>) {
    sources[index].desc = ev.currentTarget.value;
    updateScene(scene);
  }
  function handleRemoveSource(index: number) {
    if (sources.length === 1) {
      return;
    }

    sources.splice(index, 1);

    updateScene(scene);
  }
  function handleMoveOptionUp(index: number) {
    if (scene.type === 'ending') {
      return;
    }
    if (index === 0) {
      return;
    }

    scene.options = moveIndex(scene.options, index, index - 1);
    updateScene(scene);
  }
  function handleMoveOptionDown(index: number) {
    if (scene.type === 'ending') {
      return;
    }
    if (index === scene.options.length - 1) {
      return;
    }

    scene.options = moveIndex(scene.options, index, index + 1);
    updateScene(scene);
  }
  function handleMoveSourceUp(index: number) {
    if (index === 0) {
      return;
    }

    scene.source = moveIndex(sources, index, index - 1);
    updateScene(scene);
  }
  function handleMoveSourceDown(index: number) {
    if (index === sources.length - 1) {
      return;
    }

    scene.source = moveIndex(sources, index, index + 1);
    updateScene(scene);
  }
  function handleEndingDescriptionUpdate(ev: TextareaChangeEvent) {
    if (scene.type === 'ending') {
      scene.description = ev.currentTarget.value;
      updateScene(scene);
    }
  }
  function handleEndingTitleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    if (scene.type === 'ending') {
      scene.title = ev.currentTarget.value;
      updateScene(scene);
    }
  }

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
    <div className='veditor-scroll'>
      <div className='veditor'>
        <p className='veditor-warning'>note: the visual editor is a work in progress in beta.</p>

        <div>
          <label className='checkbox' htmlFor='is_ending'>
            <input
              id='is_ending'
              type='checkbox'
              checked={scene.type === 'ending'}
              onChange={onTypeUpdate}
            />
            <span className='display' />
            <span className='label'>Is Ending Scene.</span>
          </label>
        </div>

        <h2>Scene Passage</h2>
        <div>
          <textarea
            value={scene.passage}
            onChange={onPassageUpdate}
            rows={(() => {
              const x = scene.passage.match(/.{61}|.{0,61}(\n|$)/g);
              return Math.max((x || []).length, 4);
            })()}
            cols={50}
          />
        </div>
        <p className='helper-text'>
          A small paragraph or two about what's happening in the story in this scene. Displayed at
          the top of the screen.
        </p>

        {scene.type === 'scene' ? (
          <>
            <h2>Options</h2>
            <p className='helper-text'>The list of links below the Passage</p>
            <table>
              <tbody>
                {scene.options.map((option, index) => {
                  return (
                    <tr>
                      <td>
                        {option === 'separator' ? (
                          <>
                            <div className='veditor-separator spacing-right'></div>
                          </>
                        ) : (
                          <>
                            <input
                              className='spacing-right'
                              placeholder='Label'
                              value={option.label}
                              onChange={(event) => handleOptionLabelChange(index, event)}
                            />
                            →
                            <input
                              className='spacing-right spacing-left'
                              placeholder='Link'
                              value={option.to}
                              onChange={(event) => handleOptionToChange(index, event)}
                            />
                          </>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteOption(index)}
                          disabled={scene.type === 'scene' && scene.options.length === 1}
                        >
                          Delete
                        </button>
                      </td>
                      <td>
                        <button onClick={() => handleMoveOptionUp(index)}>↑</button>
                        <button onClick={() => handleMoveOptionDown(index)}>↓</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: '10px' }}>
              <button onClick={handleAddAnotherOption} className='spacing-right'>
                Add Option
              </button>
              <button onClick={handleAddAnotherSeparator}>Add Separator</button>
            </div>
            <h2>Event Handlers</h2>
            <p>onActivate</p>
            <textarea
              rows={(() => {
                const x = (scene.onActivate || '').match(/.{61}|.{0,61}(\n|$)/g);
                return (x || []).length;
              })()}
              cols={50}
              value={scene.onActivate}
              onChange={handleOnActivateChange}
            />
            <p>onFirstActivate</p>
            <textarea
              rows={(() => {
                const x = (scene.onFirstActivate || '').match(/.{61}|.{0,61}(\n|$)/g);
                return (x || []).length;
              })()}
              cols={50}
              value={scene.onFirstActivate}
              onChange={handleOnFirstActivateChange}
            />
            <p>onDeactivate</p>
            <textarea
              rows={(() => {
                const x = (scene.onDeactivate || '').match(/.{61}|.{0,61}(\n|$)/g);
                return (x || []).length;
              })()}
              cols={50}
              value={scene.onDeactivate}
              onChange={handleOnDeactivateChange}
            />
            <p>onFirstDeactivate</p>
            <textarea
              rows={(() => {
                const x = (scene.onFirstDeactivate || '').match(/.{61}|.{0,61}(\n|$)/g);
                return (x || []).length;
              })()}
              cols={50}
              value={scene.onFirstDeactivate}
              onChange={handleOnFirstDeactivateChange}
            />
          </>
        ) : (
          <>
            <h2>Ending Title</h2>
            <input value={scene.title} onChange={handleEndingTitleChange} />
            <h2>Ending Description</h2>
            <textarea
              value={scene.description}
              onChange={handleEndingDescriptionUpdate}
              rows={4}
              cols={50}
            />
          </>
        )}
        <h2>Custom CSS</h2>
        <p className='helper-text'>
          Add custom styling to this scene with CSS. See the{' '}
          <a href='/todo_docs_css'>documentation</a> on how to select elements from the scene.
        </p>
        <textarea
          value={scene.css}
          onChange={handleCssChange}
          rows={(() => {
            const x = (scene.css || '').match(/.{61}|.{0,61}(\n|$)/g);
            return Math.max((x || []).length, 5);
          })()}
          cols={50}
        />
        <h2>[source]</h2>
        {sources.map((source: { name: string; desc?: string }, index: number) => {
          return (
            <div>
              <input
                value={source.name}
                onChange={(event) => handleSourceNameChange(index, event)}
                placeholder='Name'
              />
              <input
                value={source.desc}
                onChange={(event) => handleSourceDescriptionChange(index, event)}
                placeholder='Description (Optional)'
              />
              <button onClick={() => handleRemoveSource(index)} disabled={sources.length === 1}>
                Delete
              </button>
              <button onClick={() => handleMoveSourceUp(index)}>↑</button>
              <button onClick={() => handleMoveSourceDown(index)}>↓</button>
            </div>
          );
        })}
        <button onClick={handleAddSource}>Add Another Source</button>
      </div>
    </div>
  );
}

type EditorTypes = 'raw' | 'visual';

const editors = {
  raw: RawEditor,
  visual: VisualEditor,
};

export function SceneEditor({ state }: SceneEditorProps) {
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

  useEffect(() => {
    const rerender = () => setRenderNumber(Math.random());
    state.__internal_eventListener.addListener(rerender);
    return () => {
      state.__internal_eventListener.removeListener(rerender);
    };
  }, [state]);

  const Editor = editors[editor];

  const resetPreviewState = useCallback(() => {
    passedState.reset(sceneEditorId);
  }, [passedState, sceneEditorId]);

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
            Current Scene: <code>{state.scene}</code>
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
