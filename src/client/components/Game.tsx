import React, { useCallback, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Source, Scene } from '../../shared/types';
import FancyText from './FancyText';
import { AnchorClickEvent, StringObject } from '../type-shorthand';
import { useSceneData, deleteSceneFromCache } from '../useSceneData';
import { GameState } from '../gameState';
import './css/scene.css';
import { SceneEditor } from './SceneEditor/SceneEditor';
import Credits from './Credits';

export interface GameProps {
  state: GameState;
  extraScenes?: StringObject<Scene>;
  isSceneEditorPreview?: boolean;
}

const listFormatter = new (Intl as any).ListFormat('en', { style: 'long', type: 'conjunction' });

function formatSource(input: Source | Source[] | string | null): string {
  if (input === null) {
    return 'no one';
  }
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return 'no one';
    }
    return listFormatter.format(input.map((x) => formatSource(x)));
  } else {
    if (typeof input === 'string') {
      return input;
    } else {
      return input.name + (input.desc ? ` (${input.desc})` : '');
    }
  }
}

function Game({ state, extraScenes, isSceneEditorPreview }: GameProps) {
  const [, setRenderNumber] = useState(0);

  if (!state.visitedScenes) state.visitedScenes = [];

  const scene = useSceneData(state.scene, extraScenes);

  state.__internal_isSceneEditorPreview = isSceneEditorPreview;

  const handleOptionClick = useCallback(
    (ev: AnchorClickEvent) => {
      ev.preventDefault();
      if (scene !== null && scene.type === 'scene') {
        const index = parseInt(ev.currentTarget.getAttribute('option-id') || '');
        const option = scene.options[index];
        if (option !== 'separator') {
          if (option.onActivate) {
            state.eval(option.onActivate);
          }
          if (option.to) {
            state.goToScene(option.to);
          }
        }
      } else if (ev.currentTarget.getAttribute('option-id') === 'end') {
        state.goToScene('@end');
      }
    },
    [scene]
  );

  useEffect(() => {
    const rerender = () => setRenderNumber(Math.random());
    state.__internal_eventListener.addListener(rerender);
    return () => {
      state.__internal_eventListener.removeListener(rerender);
    };
  }, [state]);

  if (scene === null) {
    return null;
  }
  if (!isSceneEditorPreview && scene.meta === 'scene-editor') {
    return <SceneEditor state={state} />;
  }

  let justOutputtedSeparator = true;

  const title = state.title || 'Community Text Adventure';
  return (
    <div className='sceneWrap'>
      <div className={'scene'}>
        {title && <h1>{title}</h1>}
        {scene.css && <style>{scene.css}</style>}
        <FancyText state={state} text={scene.passage} />
        {scene.meta === 'credits' && <Credits />}
        {scene.type === 'scene' ? (
          <>
            <ul>
              {scene.options.concat('separator').map((option, i) => {
                if (option === 'separator') {
                  if (justOutputtedSeparator) {
                    return null;
                  } else {
                    justOutputtedSeparator = true;
                    return <li key={i} className={clsx('option', 'optionSeparator')}></li>;
                  }
                } else {
                  let visible = true;
                  if (option.isVisible) {
                    visible = !!state.eval(option.isVisible);
                  }
                  if (visible) {
                    justOutputtedSeparator = false;
                    let disabled = false;
                    if (option.isDisabled) {
                      disabled = !!state.eval(option.isDisabled);
                    }
                    return (
                      <li key={i} className={clsx('option', disabled && 'optionDisabled')}>
                        <a
                          className={'optionLink'}
                          href='#'
                          onClick={handleOptionClick}
                          option-id={i}
                        >
                          <FancyText inline disableLinks state={state} text={option.label} />
                        </a>
                      </li>
                    );
                  }
                }
              })}
            </ul>
          </>
        ) : (
          <>
            {/* <p>You've found a new ending!</p> */}
            <div className={'ending'}>
              <div className={'endingTitle'}>
                <FancyText inline disableLinks state={state} text={scene.title} />
              </div>
              <div className={'endingDescription'}>
                <FancyText state={state} text={scene.description} />
              </div>
            </div>
            <ul>
              <li className={clsx('option')}>
                <a className={'optionLink'} href='#' onClick={handleOptionClick} option-id={'end'}>
                  End Game
                </a>
              </li>
            </ul>
          </>
        )}
        {scene.source !== null && (
          <p className={'source'}>
            {scene.type === 'scene' ? 'Scene' : 'Ending'} Contributed from{' '}
            {formatSource(scene.source)}.
          </p>
        )}
      </div>
    </div>
  );
}

export default Game;
