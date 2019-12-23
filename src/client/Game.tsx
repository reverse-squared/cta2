import React, { useCallback, useMemo, useState, useEffect, useDebugValue } from 'react';
import clsx from 'clsx';
import path from 'path';
import { Parser } from 'expr-eval/dist/bundle';

import { Source } from '../shared/types';
import FancyText from './FancyText';

import './css/scene.css';
import { AnchorClickEvent } from './type-shorthand';
import { useSceneData } from './useSceneData';

interface GameState {
  [key: string]: any;
  scene: string;
  visitedScenes: string[];
}

interface GameProps {
  state: GameState;
  disabled?: boolean;
}

export function createGameState(startingScene: string): GameState {
  return {
    scene: startingScene,
    visitedScenes: [],
  };
}

const listFormatter = new (Intl as any).ListFormat('en', { style: 'long', type: 'conjunction' });
const parser = new Parser();

function formatSource(input: Source | Source[]): string {
  if (Array.isArray(input)) {
    return listFormatter.format(input.map((x) => formatSource(x)));
  } else {
    if (typeof input === 'string') {
      return input;
    } else {
      return input.name + (input.desc ? ` (${input.desc})` : '');
    }
  }
}

function Game({ state }: GameProps) {
  const [, setRenderNumber] = useState(0);
  const rerender = () => setRenderNumber(Math.random());

  if (!state.visitedScenes) state.visitedScenes = [];

  const scene = useSceneData(state.scene);

  const evalMath = useCallback(
    (input: string | string[]) => {
      const expr = Array.isArray(input) ? input.map((x) => `(${x})`).join('and') : input;
      let output;
      try {
        output = parser.evaluate(expr, state);
      } catch (error) {
        if (String(error).includes('undefined variable')) {
          output = undefined;
        } else {
          throw error;
        }
      }
      console.log(`Evaluating ${expr} to`, output);
      return output;
    },
    [state]
  );

  const handleOptionClick = useCallback(
    (ev: AnchorClickEvent) => {
      ev.preventDefault();
      if (scene !== null && scene.type === 'scene') {
        const index = parseInt(ev.currentTarget.getAttribute('option-id') || '');
        const option = scene.options[index];
        if (option !== 'separator') {
          if (option.onActivate) {
            evalMath(option.onActivate);
          }
          state.scene = path.resolve('/' + path.dirname(state.scene), option.to).substr(1);
          rerender();
        }
      }
    },
    [scene, evalMath]
  );

  useEffect(() => {
    if (!scene) {
      return;
    }
    if (scene.type === 'scene') {
      if (scene.onActivate) {
        evalMath(scene.onActivate);
      }
      if (!state.visitedScenes.includes(state.scene) && scene.onFirstActivate) {
        evalMath(scene.onFirstActivate);
      }
      return () => {
        if (scene.onDeactivate) {
          evalMath(scene.onDeactivate);
        }
        if (!state.visitedScenes.includes(state.scene)) {
          if (scene.onFirstDeactivate) {
            evalMath(scene.onFirstDeactivate);
          }
          state.visitedScenes.push(state.scene);
        }
      };
    }
  }, [scene]);

  if (scene === null) {
    return null;
  }

  let justOutputtedSeparator = true;

  return (
    <div className={'scene'}>
      {scene.css && <style>{scene.css}</style>}
      <FancyText text={scene.passage} />
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
                  visible = !!evalMath(option.isVisible);
                }
                if (visible) {
                  justOutputtedSeparator = false;
                  let disabled = false;
                  if (option.isDisabled) {
                    disabled = !!evalMath(option.isDisabled);
                  }
                  return (
                    <li key={i} className={clsx('option', disabled && 'optionDisabled')}>
                      <a
                        className={'optionLink'}
                        href='#'
                        onClick={handleOptionClick}
                        option-id={i}
                      >
                        <FancyText text={option.label} />
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
              <FancyText text={scene.title} />
            </div>
            <div className={'endingDescription'}>
              <FancyText text={scene.description} />
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
          {formatSource(scene.source)}
        </p>
      )}
    </div>
  );
}

export default Game;
