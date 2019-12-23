import React, { useState, useEffect, useRef } from 'react';
import Game, { createGameState } from './Game';

import './css/global.css';

const state = createGameState('cta_dev_test/test');
function App() {
  return (
    <>
      <h1>cta2 engine</h1>
      <Game state={state} />
    </>
  );
}

export default App;
