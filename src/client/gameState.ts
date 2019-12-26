import { Parser } from 'expr-eval/dist/bundle';
import { StringObject } from './type-shorthand';
import { deleteSceneFromCache } from './useSceneData';
import path from 'path';
import { setEndingAsAchieved, isEndingAchieved, setEndingAsNotAchieved } from './ending';

const parser = new Parser();

export interface GameState {
  /** Custom Variables */
  [key: string]: any;
  /* The Current Scene */
  scene: string;
  /* The Previous Scene, used for the "Go Back One Step" button. */
  prevScene: string;
  /* A list of scenes you have visited already, used for running the onFirstActivate/onFirstDeactivate handlers. */
  visitedScenes: string[];
  /* Returns true if the ending scene has been achieved, only set AFTER the ending scene has been viewed. */
  isEndingAchieved: (id: string) => boolean;
  /* Marks an ending as achieved. */
  setEndingAsAchieved: (id: string) => void;
  /* Marks an ending as NOT achieved. */
  setEndingAsNotAchieved: (id: string) => void;
}

let mainState = createGameState('built-in/start');

function resetGameState(startingScene: string = 'built-in/start') {
  mainState = createGameState(startingScene);
}

export function createGameState(startingScene: string): GameState {
  return {
    scene: startingScene,
    prevScene: '@null',
    visitedScenes: [],
    isEndingAchieved: isEndingAchieved,
    setEndingAsAchieved: setEndingAsAchieved,
    setEndingAsNotAchieved: setEndingAsNotAchieved,
    reset: resetGameState,
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
