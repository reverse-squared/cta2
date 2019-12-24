import { StringObject } from './type-shorthand';
import { Scene } from '../shared/types';

export const builtInScenes: StringObject<Scene> = {
  'built-in/start': {
    type: 'scene',
    passage: 'Welcome to the Community Text Adventure Beta.\nThings to do:',
    options: [
      {
        label: 'Scene Editor',
        to: 'scene-editor',
        onActivate: 'sceneEditorId="beta/editor-demo"',
      },
    ],
    source: null,
  },
  'built-in/scene-editor': {
    type: 'scene',
    passage:
      "This is the Scene Editor. If this text is showing and the scene editor isn't, that's a problem.",
    options: [],
    meta: 'scene-editor',
    source: null,
  },
};
