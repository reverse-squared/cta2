import { Parser } from '../expr-eval';
import { StringObject } from './type-shorthand';
import { deleteSceneFromCache, fetchSceneData } from './scene-data';
import path from 'path';
import {
  setEndingAsAchieved,
  isEndingAchieved,
  setEndingAsNotAchieved,
  getAchievedEndingSet,
} from './ending';
import { SimpleEmitter } from '@reverse/emitter';
import { getSceneData } from './scene-data';
import { builtInScenes, createErrorScene } from './built-in-scenes';
import { Scene } from '../shared/types';

const parser = new Parser();

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
  this.title = 'Community Text Adventure';
  this.visitedScenes = [];
  this.goToScene('/' + (startingScene || defaultStartingScene || 'built-in/start'));
}

export function createGameState(
  startingScene: string = 'built-in/start',
  extraScenes?: StringObject<Scene>
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
    __internal_isBuiltInScene: isBuiltInScene,
    reset: () => {},
    eval: evalMath,
    __internal_eventListener: new SimpleEmitter(),
    __internal_createErrorScene: createErrorSceneOnState,
    __internal_extraScenes: extraScenes,
    __internal_hasAtLeastOneEnding: getAchievedEndingSet().size > 0,
    __internal_developer: false,
    __internal_PRODUCTION: process.env.PRODUCTION,
  };
  // bind
  state.reset = resetGameState.bind(state, startingScene);
  state.goToScene = goToScene.bind(state);
  state.__internal_createErrorScene = createErrorSceneOnState.bind(state);
  // initial
  state.goToScene('/' + startingScene);
  return state;
}

function evalMath(this: GameState, input: string | string[], source: string) {
  const expr = Array.isArray(input) ? input.map((x) => `(${x})`).join('and') : input;
  let output;
  try {
    output = parser.evaluate(expr, this);
  } catch (error) {
    this.prevScene = this.scene;
    this.scene = 'built-in/runtime-error';
    this.runtimeErrorSource = source;
    this.runtimeErrorStack = error ? error.message || error : error;
    this.runtimeErrorExpression = expr;
    this.__internal_eventListener.emit();
  }
  return output;
}

const atLinks: StringObject<(state: GameState) => void> = {
  '@null': () => {},
  '@reset': (state) => {
    state.reset();
  },
  '@reload': (state) => {
    deleteSceneFromCache(state.scene);
  },
  '@undo': (state) => {
    delete state.runtimeErrorSource;
    delete state.runtimeErrorStack;
    delete state.runtimeErrorExpression;

    state.scene = state.prevScene;
    state.prevScene = '@null';
  },
  '@end': (state) => {
    if (state.__internal_isSceneEditorPreview) {
      state.reset();
    } else {
      const achieved = getAchievedEndingSet().size;
      state.setEndingAsAchieved(state.scene);
      state.__internal_hasAtLeastOneEnding = true;
      if (achieved === 0) {
        state.reset('built-in/first-time-introduction');
      } else {
        state.reset('built-in/start');
      }
    }
  },
  '@developer_editor': (state) => {
    state.sceneEditorId = prompt('id to try to edit');
    if (state.sceneEditorId) {
      state.sceneEditorIsEditing = true;
      state.goToScene('/built-in/loading');
      fetchSceneData(state.sceneEditorId).then(() => {
        state.goToScene('/built-in/scene-editor');
      });
    }
  },
  '@developer_editor_here': (state) => {
    state.sceneEditorIsEditing = true;
    state.sceneEditorId = state.scene;
    state.scene = 'built-in/scene-editor';
  },
  '@reset-all-progress': () => {
    localStorage.removeItem('cta2_ending_ids');
    localStorage.removeItem('cta2_ending_cache');
    localStorage.removeItem('cta2_login');
    location.reload();
  },
};

function createErrorSceneOnState(this: GameState, id: string, error: any) {}

function goToScene(this: GameState, link: string) {
  if (link.startsWith('@')) {
    if (atLinks[link]) {
      atLinks[link](this);
    } else {
      this.prevScene = this.scene;
      this.scene = 'built-in/runtime-error';
      this.runtimeErrorSource = 'goToScene';
      this.runtimeErrorStack = `at-link ${link} is not valid.`;
      this.runtimeErrorExpression = link;
    }
  } else if (link.startsWith('http://') || link.startsWith('https://')) {
    window.open(link);
  } else {
    // handle deactivate events
    const scene = getSceneData(this.scene);
    if (scene && scene.type === 'scene') {
      if (scene.onDeactivate) {
        try {
          this.eval(scene.onDeactivate, 'onDeactivate');
        } catch (error) {
          this.createErrorScene(this.scene, error);
        }
      }
      if (!this.visitedScenes.includes(this.scene)) {
        if (scene.onFirstDeactivate) {
          this.eval(scene.onFirstDeactivate, 'onFirstDeactivate');
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

    const scene2 =
      (this.__internal_extraScenes && this.__internal_extraScenes[this.scene]) ||
      getSceneData(this.scene);
    if (scene2 && scene2.type === 'scene') {
      if (!this.visitedScenes.includes(this.scene) && scene2.onFirstActivate) {
        this.eval(scene2.onFirstActivate, 'onFirstActivate');
      }
      if (scene2.onActivate) {
        this.eval(scene2.onActivate, 'onActivate');
      }
    }
  }
  this.__internal_eventListener.emit();
}

function isBuiltInScene(id: string) {
  return id in builtInScenes;
}
