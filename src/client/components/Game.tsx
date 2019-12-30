import React, { useCallback, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Scene } from '../../shared/types';
import FancyText from './FancyText';
import { AnchorClickEvent, ButtonClickEvent, StringObject } from '../type-shorthand';
import { useSceneData } from '../scene-data';
import { GameState } from '../gameState';
import '../css/scene.css';
import Credits from './Credits';
import SceneEditor from './SceneEditor';
import CTAInspector from './Inspector';
import EndingProgress from './EndingProgress';
import EndingList from './EndingList';
import { formatSource } from '../../shared/utils/formatSource';

export interface GameProps {
  state: GameState;
  extraScenes?: StringObject<Scene>;
  sceneEditorId?: string;
}

function Game({ state, extraScenes, sceneEditorId }: GameProps) {
  const [, setRenderNumber] = useState(0);
  const [inspector, setInspector] = useState(false);

  if (!state.visitedScenes) state.visitedScenes = [];

  const scene = useSceneData(state.scene, extraScenes);

  state.__internal_isSceneEditorPreview = sceneEditorId !== undefined;

  const handleOptionClick = useCallback(
    (ev: AnchorClickEvent | ButtonClickEvent) => {
      ev.preventDefault();
      const index =
        ev.currentTarget.getAttribute('option-id') ||
        (ev.currentTarget.parentElement &&
          ev.currentTarget.parentElement.getAttribute('option-id')) ||
        '';

      if (index === 'dev-editor-here') {
        state.goToScene('@developer_editor_here');
      } else if (index === 'end') {
        state.goToScene('@end');
      } else if (scene !== null && scene.type === 'scene') {
        const option = scene.options[parseInt(index)];
        if (option !== 'separator') {
          if (option.onActivate) {
            state.eval(option.onActivate, `option[${index}].onActivate`);
          }
          if (option.to) {
            state.goToScene(option.to);
          }
        }
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

  state.__internal_toggleInspector = useCallback(() => {
    setInspector((x) => !x);
  }, []);
  state.__internal_inspectorVisible = inspector;

  const [visible, setVisible] = useState();
  useEffect(() => {
    setVisible(true);
    return () => {
      setVisible(false);
    };
  }, [state]);

  if (scene === null) {
    return (
      <>{inspector && <CTAInspector state={state} onClose={state.__internal_toggleInspector} />}</>
    );
  }
  if (!sceneEditorId && scene.meta === 'scene-editor') {
    return (
      <>
        {inspector && <CTAInspector state={state} onClose={state.__internal_toggleInspector} />}
        <SceneEditor state={state} />
      </>
    );
  }
  if (!visible) {
    return null;
  }

  let justOutputtedSeparator = true;

  const title =
    scene.meta === 'runtime-error'
      ? 'Runtime Error!'
      : scene.meta === 'loading-error'
      ? 'Parsing Error'
      : state.title || 'Community Text Adventure';

  return (
    <>
      {inspector && <CTAInspector state={state} onClose={state.__internal_toggleInspector} />}
      <div className='sceneWrap'>
        <div className='scene'>
          <div>
            {title && <h1>{title}</h1>}
            {scene.css && <style>{scene.css}</style>}
            <FancyText state={state} text={scene.passage} />
            {scene.meta === 'credits' && <Credits />}
            {scene.meta === 'main-menu' && <EndingProgress />}
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
                        visible = !!state.eval(option.isVisible, `option[${i}].isVisible`);
                      }
                      if (visible) {
                        justOutputtedSeparator = false;
                        let disabled = false;
                        if (option.isDisabled) {
                          disabled = !!state.eval(option.isDisabled, `option[${i}].isVisible`);
                        }
                        return (
                          <li
                            key={i}
                            className={clsx('option', disabled && 'optionDisabled')}
                            option-id={i}
                          >
                            <a className={'optionLink'} href='#' onClick={handleOptionClick}>
                              <FancyText inline disableLinks state={state} text={option.label} />
                            </a>
                          </li>
                        );
                      }
                    }
                  })}
                </ul>
                {scene.meta === 'endings' && <EndingList state={state} />}
              </>
            ) : (
              <>
                {!sceneEditorId ? (
                  state.isEndingAchieved(state.scene) ? (
                    <p className='ending-text ending-text-old'>
                      You've already gotten this ending.
                    </p>
                  ) : (
                    <p className='ending-text ending-text-new'>You've discovered a new ending!</p>
                  )
                ) : (
                  <p className='ending-text' />
                )}
                <div className={'ending'}>
                  <div className={'endingTitle'}>
                    <FancyText inline disableLinks state={state} text={scene.title} />
                  </div>
                  <div className={'endingDescription'}>
                    <FancyText state={state} text={scene.description} />
                  </div>
                </div>
                {sceneEditorId !== state.scene && (
                  <ul>
                    <li className={clsx('option')} option-id='end'>
                      <a className={'optionLink'} href='#' onClick={handleOptionClick}>
                        End Game
                      </a>
                    </li>
                  </ul>
                )}
              </>
            )}
            {scene.source !== null && (
              <p className={'source'}>
                {scene.type === 'scene' ? 'Scene' : 'Ending'} Contributed from{' '}
                {formatSource(scene.source)}
              </p>
            )}
          </div>
          {state.__internal_developer && (
            <>
              <div className='grow' />
              <h3>developer:</h3>
              <div>
                <button onClick={handleOptionClick} option-id='dev-editor-here'>
                  edit
                </button>
                <button onClick={state.__internal_toggleInspector}>inspect</button>
              </div>
              <div style={{ height: '20px' }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Game;
