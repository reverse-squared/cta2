import React, { useState, useEffect, useRef } from 'react';
import Game from './SceneRenderer';

import './css/global.css';

import scene from '../../content/cta_dev_test/test.json';
import { useSceneData } from './useSceneData';

function App() {
  const state = useRef<{ scene: string; [key: string]: any }>({ scene: 'cta_dev_test/test' });

  return (
    <>
      <h1>cta2 engine</h1>
      <Game id={state.current.scene} state={state.current} />
    </>
  );
}

export default App;
