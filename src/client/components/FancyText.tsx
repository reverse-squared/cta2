import React from 'react';
import { FancyTextMakerString } from '../../shared/types';
import { GameState } from '../gameState';

import '../css/ftm.css';

interface FancyTextProps {
  text: FancyTextMakerString;
  state: GameState;
  inline?: boolean;
  disableLinks?: boolean;
  disableExpressions?: boolean;
}

interface FTMRules {
  [custom: string]: boolean;
  // italic?: boolean;
  // bold?: boolean;
  // strike?: boolean;
  // underline?: boolean;
  // code?: boolean;
  // blockCode?: boolean;
}
interface FTMPart {
  text: string;
  styles?: string[];
}

function mapFTMPart(part: FTMPart, index: number) {
  return (
    <span
      key={index}
      className={
        part.styles
          ? part.styles.map((x) => (x.startsWith('custom-') ? x.substr(7) : 'ftm-' + x)).join(' ')
          : undefined
      }
    >
      {part.text}
    </span>
  );
}

function FancyText({ text, state, inline, disableLinks, disableExpressions }: FancyTextProps) {
  if (!disableExpressions && text.startsWith('=')) {
    text = String(state.eval(text.substr(1), `FancyTextExpression`));
  }
  if (text.startsWith('\\=')) {
    text.substr(2);
  }
  if (!disableExpressions) {
    text = text.replace(/\\?\${([^}]+)}/g, (string, code) => {
      if (string.startsWith('\\')) return string.substr(1);
      return String(state.eval(code, `FancyTextInlineExpression`));
    });
  }
  text = text.replace(/^\s+$/gm, '').replace(/\n\n+/, '\n\n');

  const paragraphs: FTMPart[][] = [[]];
  let rules: FTMRules = {};
  let i = 0;
  let chunk = '';

  // ends the current chunk of text as a part
  function endPart() {
    if (chunk.length === 0) {
      return;
    }
    let styles = (Object.keys(rules) as string[]).filter((rule) => rules[rule]);
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
    // custom classes
    else if (!rules.blockCode && !rules.code && text[i] === '<') {
      const match = text.substr(i).match(/<(\/)?([\w-]+)>/);
      if (match) {
        endPart();
        rules['custom-' + match[2]] = match[1] !== '/';
        i += match[0].length - 1;
      } else {
        chunk += '<';
      }
    }
    // escape
    else if (
      !rules.blockCode &&
      text[i] === '\\' &&
      ['*', '`', '~', '\\', '<'].includes(text[i + 1])
    ) {
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
