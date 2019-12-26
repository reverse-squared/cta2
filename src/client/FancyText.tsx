import React from 'react';
import { FancyTextMakerString } from '../shared/types';
import { GameState, evalMath } from './gameState';

import './css/ftm.css';

interface FancyTextProps {
  text: FancyTextMakerString;
  state: GameState;
  inline?: boolean;
  disableLinks?: boolean;
}

interface FTMRules {
  italic?: boolean;
  bold?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  blockCode?: boolean;
}
interface FTMPart {
  text: string;
  styles?: (keyof FTMRules)[];
}

function mapFTMPart(part: FTMPart, index: number) {
  return (
    <span
      key={index}
      className={part.styles ? part.styles.map((x) => 'ftm-' + x).join(' ') : undefined}
    >
      {part.text}
    </span>
  );
}

function FancyText({ text, state, inline, disableLinks }: FancyTextProps) {
  if (text.startsWith('=')) {
    text = String(evalMath(state, text.substr(1)));
  }
  if (text.startsWith('\\=')) {
    text.substr(2);
  }
  text = text
    .replace(/\\?\${([^}]+)}/g, (string, code) => {
      if (string.startsWith('\\')) return string.substr(1);
      return String(evalMath(state, code));
    })
    .replace(/^\s+$/gm, '')
    .replace(/\n\n+/, '\n\n');

  const paragraphs: FTMPart[][] = [[]];
  let rules: FTMRules = {};
  let i = 0;
  let chunk = '';

  // ends the current chunk of text as a part
  function endPart() {
    if (chunk.length === 0) {
      return;
    }
    let styles = (Object.keys(rules) as (keyof FTMRules)[]).filter((rule) => rules[rule]);
    if (styles.length > 0) {
      if (styles.includes('code')) {
        styles = ['code'];
        chunk = chunk.replace(/^\s*|\s*$/g, '');
      }
      if (styles.includes('blockCode')) {
        styles = ['blockCode'];
        chunk = chunk.replace(/^\s*|\s*$/g, '');
      }

      paragraphs[paragraphs.length - 1].push({
        styles,
        text: chunk,
      });
    } else {
      paragraphs[paragraphs.length - 1].push({
        text: chunk,
      });
    }
    chunk = '';
  }

  for (; i < text.length; i++) {
    // italics
    if (
      !rules.code &&
      !rules.blockCode &&
      text[i] === '*' &&
      text[i + 1] !== '*' &&
      text[i - 1] !== '\\'
    ) {
      endPart();
      rules.italic = !rules.italic;
    }
    // strike
    else if (
      !rules.code &&
      !rules.blockCode &&
      text[i] === '~' &&
      text[i + 1] === '~' &&
      text[i - 1] !== '\\'
    ) {
      endPart();
      rules.strike = !rules.strike;
      i++;
    }
    // underline
    else if (
      !rules.code &&
      !rules.blockCode &&
      text[i] === '_' &&
      text[i + 1] === '_' &&
      text[i - 1] !== '\\'
    ) {
      endPart();
      rules.underline = !rules.underline;
      i++;
    }
    // bold
    else if (
      !rules.code &&
      !rules.blockCode &&
      text[i] === '*' &&
      text[i + 1] === '*' &&
      text[i - 1] !== '\\'
    ) {
      endPart();
      rules.bold = !rules.bold;
      i++;
    }
    // block code
    else if (
      !rules.code &&
      !inline &&
      text[i] === '`' &&
      text[i + 1] === '`' &&
      text[i + 2] === '`' &&
      text[i - 1] !== '\\'
    ) {
      endPart();
      paragraphs.push([]);
      rules.blockCode = !rules.blockCode;
      i += 2;
    }
    // inline code
    else if (!rules.blockCode && text[i] === '`' && text[i + 1] !== '`' && text[i - 1] !== '\\') {
      endPart();
      rules.code = !rules.code;
    }
    // escape
    else if (!rules.blockCode && text[i] === '\\' && ['*', '`', '~', '\\'].includes(text[i + 1])) {
      chunk += text[i + 1];
      i++;
    }
    // paragraphs
    else if (!inline && text[i] === '\n' && text[i + 1] === '\n') {
      endPart();
      paragraphs.push([]);
      i++;
    } else {
      chunk += text[i];
    }
  }

  endPart();

  return (
    <>
      {inline
        ? paragraphs[0].map(mapFTMPart)
        : paragraphs.map((parts, j) => {
            return <p key={j}>{parts.map(mapFTMPart)}</p>;
          })}
    </>
  );
}

export default FancyText;
