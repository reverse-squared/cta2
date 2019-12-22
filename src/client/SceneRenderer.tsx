import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';

import { Scene, Source } from '../shared/types';
import FancyText from './FancyText';

import './css/scene.css';
import { AnchorClickEvent } from './type-shorthand';
import { useSceneData } from './useSceneData';

interface GameProps {
  id: string;
  state: { scene: string; [key: string]: string };
  onUpdate?: Function;
}

// todo: fix typing here, it doesn't work.
const listFormatter = new (Intl as any).ListFormat('en', { style: 'long', type: 'conjunction' });

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

function Game({ state, id, onUpdate }: GameProps) {
  const scene = useSceneData(state.scene);

  const handleOptionClick = useCallback(
    (ev: AnchorClickEvent) => {
      ev.preventDefault();
      alert('index=' + ev.currentTarget.getAttribute('option-id'));
    },
    [id]
  );

  if (scene === null) {
    return null;
  }

  return (
    <div className={'scene'}>
      {scene.css && <style>{scene.css}</style>}
      <FancyText text={scene.passage} />
      <ul>
        {scene.options.map((option, i) => {
          if (option === 'separator') {
            return <li key={i} className={clsx('option', 'optionSeparator')}></li>;
          } else {
            return (
              <li key={i} className={'option'}>
                <a className={'optionLink'} href='#' onClick={handleOptionClick} option-id={i}>
                  <FancyText text={option.label} />
                </a>
              </li>
            );
          }
        })}
      </ul>
      {scene.source !== null && (
        <p className={'source'}>Scene Contributed from {formatSource(scene.source)}</p>
      )}
    </div>
  );
}

export default Game;
