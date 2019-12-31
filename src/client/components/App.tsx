import React from 'react';
import Game from './Game';
import { createGameState } from '../gameState';
import { setLoginToken, isDeveloperMode } from '../developer-mode';

const state = createGameState('built-in/start');

Object.defineProperty(window, 'I_AM_DEVELOPER', {
  get: () => {
    const token = window.prompt(
      'enter your developer password here (or random text if you just want to use the client tools)'
    );
    if (token) {
      setLoginToken(token);
      alert('developer mode features enabled');

      state.__internal_developer = true;
      state.__internal_eventListener.emit();
      (window as any).state = state;
    }
  },
});

if (isDeveloperMode()) {
  state.__internal_developer = true;
  (window as any).state = state;
}

function App() {
  return <Game state={state} />;
}

export default App;
