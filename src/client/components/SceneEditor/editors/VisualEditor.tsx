import React, { useCallback } from 'react';
import { moveIndex } from '@reverse/array';

import { validateScene } from '../../../../shared/validateScene';

import { Scene, Source } from '../../../../shared/types';

import { InputChangeEvent, TextareaChangeEvent } from '../../../type-shorthand';
import { blankScene, SceneEditorEditorProps } from '../SceneEditor';

let mirror: Scene = null as any;

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

      if (!mirror) {
        mirror = { ...scene };

        if (mirror.type === 'scene') {
          delete mirror.options;
          delete mirror.preloadScenes;
          delete mirror.onFirstActivate;
          delete mirror.onFirstDeactivate;
          delete mirror.onActivate;
          delete mirror.onDeactivate;
        } else {
          delete mirror.title;
          delete mirror.description;
        }

        mirror.type = mirror.type === 'ending' ? 'scene' : 'ending';

        if (mirror.type === 'scene') {
          mirror.options = [];
        } else {
          mirror.title = '';
          mirror.description = '';
        }
      }

      [scene, mirror] = [mirror, scene];

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

  const sources: Source[] =
    scene.source === null
      ? []
      : typeof scene.source === 'string'
      ? [{ name: scene.source }]
      : Array.isArray(scene.source)
      ? scene.source
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
          <textarea value={scene.passage} onChange={onPassageUpdate} rows={4} cols={50} />
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
            <h2>[the on* things]</h2>
            <p>onActivate</p>
            <textarea
              rows={4}
              cols={50}
              value={scene.onActivate}
              onChange={handleOnActivateChange}
            />
            <p>onFirstActivate</p>
            <textarea
              rows={4}
              cols={50}
              value={scene.onFirstActivate}
              onChange={handleOnFirstActivateChange}
            />
            <p>onDeactivate</p>
            <textarea
              rows={4}
              cols={50}
              value={scene.onDeactivate}
              onChange={handleOnDeactivateChange}
            />
            <p>onFirstDeactivate</p>
            <textarea
              rows={4}
              cols={50}
              value={scene.onFirstDeactivate}
              onChange={handleOnFirstDeactivateChange}
            />
          </>
        ) : (
          <>
            <h2>[ending title]</h2>
            <input value={scene.title} onChange={handleEndingTitleChange} />
            <h2>[ending description]</h2>
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
        <textarea value={scene.css} onChange={handleCssChange} rows={7} cols={50} />
        <h2>[source]</h2>
        {sources.map((source: Source, index: number) => {
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

export default VisualEditor;
