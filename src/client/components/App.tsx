import React, { useState, useEffect, useRef } from 'react';
import Game from './Game';

import '../css/global.css';
import { createGameState } from '../gameState';
import { setLoginToken, isDeveloperMode } from '../developer-mode';

const state = createGameState('built-in/start');

(window as any).I_AM_DEVELOPER = function() {
  const token = window.prompt(
    'enter your developer password here (or random text if you just want to use the client tools)'
  );
  if (token) {
    setLoginToken(token);
    alert('developer mode features enabled');

    state.__internal_PRODUCTION = false;
    state.__internal_developer = true;
    state.__internal_eventListener.emit();
  }
};

if (isDeveloperMode()) {
  state.__internal_PRODUCTION = false;
  state.__internal_developer = true;
}

function App() {
  return <Game state={state} />;
}

export default App;
