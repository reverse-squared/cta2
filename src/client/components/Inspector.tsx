import React from 'react';
import { Inspector, InspectorNodeParams, ObjectLabel, ObjectName } from 'react-inspector';
import { GameState } from '../gameState';
import FloatingWindow from './FloatingWindow';

const nodeRenderer = ({ depth, name, data, isNonenumerable }: InspectorNodeParams) =>
  depth === 0 ? (
    <>
      GameState on <span style={{ color: 'cornflowerblue' }}>{data.scene}</span>
    </>
  ) : typeof data === 'function' ? (
    <>
      <ObjectName name={name} />: <em style={{ color: 'rgb(13, 34, 170)' }}>ƒ</em>
      <em>()</em> <em style={{ opacity: 0.5 }}>[native code]</em>{' '}
    </>
  ) : (
    <ObjectLabel name={name} data={data} isNonenumerable={isNonenumerable} />
  );

export interface CTAInspectorProps {
  state: GameState;
  onClose: () => void;
}

function CTAInspector({ state, onClose }: CTAInspectorProps) {
  return (
    <FloatingWindow title='State Inspector' onClose={onClose}>
      <div style={{ padding: '8px' }}>
        <Inspector
          data={{
            [Symbol.toStringTag]: 'GameState',
            ...Object.keys(state)
              .filter((x) => !x.startsWith('__internal'))
              .reduce((obj: any, key) => {
                obj[key] = state[key];
                return obj;
              }, {}),
          }}
          sortObjectKeys
          nodeRenderer={nodeRenderer}
          expandLevel={1}
        />
      </div>
    </FloatingWindow>
  );
}

export default CTAInspector;
