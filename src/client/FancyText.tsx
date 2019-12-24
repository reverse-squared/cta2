import React from 'react';
import { FancyTextMakerString } from '../shared/types';
import { GameState, evalMath } from './gameState';

interface FancyTextProps {
  text: FancyTextMakerString;
  state: GameState;
}

function FancyText({ text, state }: FancyTextProps) {
  if (text.startsWith('=')) {
    text = String(evalMath(state, text.substr(1)));
  }
  if (text.startsWith('\\=')) {
    text.substr(2);
  }
  text = text.replace(/\${([^}]+)}/g, (_, code) => {
    return String(evalMath(state, code));
  });
  return <>{text}</>;
}

export default FancyText;
