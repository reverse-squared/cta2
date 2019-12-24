import { Parser } from 'expr-eval/dist/bundle';
import { StringObject } from './type-shorthand';
import { deleteSceneFromCache } from './useSceneData';
import path from 'path';

const parser = new Parser();

export interface GameState {
  [key: string]: any;
  scene: string;
  prevScene: string;
  visitedScenes: string[];
}

export function createGameState(startingScene: string): GameState {
  return {
    scene: startingScene,
    prevScene: '@null',
    visitedScenes: [],
  };
}

export function evalMath(state: GameState, input: string | string[]) {
  const expr = Array.isArray(input) ? input.map((x) => `(${x})`).join('and') : input;
  let output;
  try {
    output = parser.evaluate(expr, state);
  } catch (error) {
    if (String(error).includes('undefined variable')) {
      output = undefined;
    } else {
      // todo: catch these on renderer
      // throw error;
    }
  }
  return output;
}

const atLinks: StringObject<(state: GameState) => void> = {
  '@reload': (state) => {
    deleteSceneFromCache(state.scene);
  },
  '@undo': (state) => {
    state.scene = state.prevScene;
    state.prevScene = '@null';
  },
  '@reset': (state) => {},
  '@scene_request': (state) => {},
  '@null': (state) => {},
};

export function goToScene(state: GameState, link: string) {
  if (link.startsWith('@')) {
    if (atLinks[link]) {
      atLinks[link](state);
    } else {
      // todo: catch these on renderer
      // throw new Error(`at-link ${link} not valid.`);
    }
  } else {
    state.prevScene = state.scene;
    state.scene = path.resolve('/' + path.dirname(state.scene), link).substr(1);
  }
}
