import { Parser } from '../expr-eval';
import { StringObject } from './type-shorthand';
import { deleteSceneFromCache } from './useSceneData';
import path from 'path';
import {
  setEndingAsAchieved,
  isEndingAchieved,
  setEndingAsNotAchieved,
  getCompletedEndingList,
} from './ending';
import { SimpleEmitter } from '@reverse/emitter';
import { getSceneData } from './useSceneData';
import { builtInScenes, createErrorScene } from './built-in-scenes';

const parser = new Parser();

console.log(parser);

export interface GameState {
  /** Custom Variables */
  [key: string]: any;
  /** The Current Scene */
  scene: string;
  /** Goes to a different scene, making sure to handle all the different events. Use this instead of modifying `scene` */
  goToScene: (link: string) => void;
  /** The Previous Scene, used for the "Go Back One Step" button. */
  prevScene: string;
  /** A list of scenes you have visited already, used for running the onFirstActivate/onFirstDeactivate handlers. */
  visitedScenes: string[];
  /** Returns true if the ending scene has been achieved, only set AFTER the ending scene has been viewed. */
  isEndingAchieved: typeof isEndingAchieved;
  /** Marks an ending as achieved. */
  setEndingAsAchieved: typeof setEndingAsAchieved;
  /** Marks an ending as NOT achieved. */
  setEndingAsNotAchieved: typeof setEndingAsAchieved;
  /** Reset's the game's state, with an optional starting scene. Used on the main menu screen. */
  reset: (id?: string) => void;
  /** The title shown at the top of the page. */
  title: string;
  /** Evaluates a math expression */
  eval: typeof evalMath;
  /** Creates an error scene and assigns it into this state. */
  __internal_createErrorScene: (id: string, error: any) => void;
  /** @internal Emitter for state changes. Used in Game to handle re-rendering. */
  __internal_eventListener: SimpleEmitter<[]>;
}

const builtInStateProps = Object.keys(createGameState());

function resetGameState(this: GameState, defaultStartingScene: string, startingScene?: string) {
  Object.keys(this)
    .filter((x) => !builtInStateProps.includes(x))
    .forEach((x) => {
      delete this[x];
    });
  this.prevScene = '@null';
  this.scene = '@null';
  this.goToScene('/' + (startingScene || defaultStartingScene || 'built-in/start'));
}

export function createGameState(
  startingScene: string = 'built-in/start',
  eventListener?: SimpleEmitter<[]>
): GameState {
  const state: GameState = {
    title: 'Community Text Adventure',
    goToScene: goToScene,
    scene: '@null',
    prevScene: '@null',
    visitedScenes: [],
    isEndingAchieved: isEndingAchieved,
    setEndingAsAchieved: setEndingAsAchieved,
    setEndingAsNotAchieved: setEndingAsNotAchieved,
    reset: () => {},
    eval: evalMath,
    __internal_eventListener: eventListener || new SimpleEmitter(),
    __internal_createErrorScene: createErrorSceneOnState,
  };
  // bind
  state.reset = resetGameState.bind(state, startingScene);
  state.goToScene = state.goToScene.bind(state);
  state.__internal_createErrorScene = state.createErrorSceneOnState.bind(state);
  // initial
  state.goToScene('/' + startingScene);
  return state;
}

function evalMath(this: GameState, input: string | string[]) {
  const expr = Array.isArray(input) ? input.map((x) => `(${x})`).join('and') : input;
  let output;
  try {
    output = parser.evaluate(expr, this);
  } catch (error) {
    throw error;
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
  '@reset': (state) => {
    if (state.__internal_isSceneEditorPreview) {
      state.reset();
    } else {
      state.reset();
    }
  },
  '@null': () => {},
  '@end': (state) => {
    state.setEndingAsAchieved(state.scene);
    if (getCompletedEndingList().size === 1) {
      state.reset('built-in/first-time-introduction');
    } else {
      state.reset('built-in/start');
    }
  },
};

function createErrorSceneOnState(this: GameState, id: string, error: any) {}

function goToScene(this: GameState, link: string) {
  if (link.startsWith('@')) {
    if (atLinks[link]) {
      atLinks[link](this);
    } else {
      // todo: catch these on renderer
      // throw new Error(`at-link ${link} not valid.`);
    }
  } else if (link.startsWith('http://') || link.startsWith('https://')) {
    window.open(link);
  } else {
    // handle deactivate events
    const scene = getSceneData(this.scene);
    if (scene && scene.type === 'scene') {
      if (scene.onDeactivate) {
        try {
          this.eval(scene.onDeactivate);
        } catch (error) {
          this.createErrorScene(this.scene, error);
        }
      }
      if (!this.visitedScenes.includes(this.scene)) {
        if (scene.onFirstDeactivate) {
          this.eval(scene.onFirstDeactivate);
        }
        this.visitedScenes.push(this.scene);
      }
    }
    // switch
    this.prevScene = this.scene;
    this.scene = path.resolve('/' + path.dirname(this.scene), link).substr(1);

    while (
      builtInScenes[this.scene] &&
      builtInScenes[this.scene].meta &&
      builtInScenes[this.scene].meta.startsWith('redirect:')
    ) {
      this.scene = builtInScenes[this.scene].meta.substr(9);
    }

    const scene2 = getSceneData(this.scene);
    if (scene2 && scene2.type === 'scene') {
      if (!this.visitedScenes.includes(this.scene) && scene2.onFirstActivate) {
        this.eval(scene2.onFirstActivate);
      }
      if (scene2.onActivate) {
        this.eval(scene2.onActivate);
      }
    }
  }
  this.__internal_eventListener.emit();
}
