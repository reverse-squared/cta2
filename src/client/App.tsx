import React, { useState, useEffect, useRef } from 'react';
import Game from './Game';

import './css/global.css';
import { createGameState } from './gameState';

const state = createGameState('built-in/start');

function App() {
  return (
    <>
      <Game state={state} />
    </>
  );
}

export default App;
