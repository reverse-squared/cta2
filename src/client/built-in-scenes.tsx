import { StringObject } from './type-shorthand';
import { Scene } from '../shared/types';

export function createErrorScene(id: string, error: any): Scene {
  return {
    type: 'scene',
    passage: `An Error Occurred in scene \`${id}\`\n\n\`\`\`${
      error instanceof Error ? error.message : String(error)
    }\`\`\``,
    options: [
      {
        label: 'Go back one step',
        to: '@undo',
      },
      {
        label: 'Reload Scene',
        to: '@reload',
      },
      {
        label: 'Reset all',
        to: '@reset',
      },
    ],
    css: 'body{background:#232020}',
    source: [],
    meta: 'error',
  };
}

export function create404Scene(id: string): Scene {
  return {
    type: 'scene',
    passage: `The scene \`${id}\` doesn't exist.`,
    options: [
      {
        label: 'Request a scene',
        to: '/built-in/scene-editor',
        onActivate: `sceneEditorId="${id}"`,
      },
      'separator',
      {
        label: '="Go back one step"||(prevScene=="@null"?" (No Previous Scene)":"")',
        to: '@undo',
        isDisabled: 'prevScene=="@null"',
      },
      {
        label: 'Reload Scene',
        to: '@reload',
      },
      {
        label: 'Reset all',
        to: '@reset',
      },
    ],
    css: 'body{background:#232020}',
    source: [],
    meta: '404',
  };
}

export const builtInScenes: StringObject<Scene> = {
  'built-in/start': {
    type: 'scene',
    passage: 'Welcome to the Community Text Adventure Beta.',
    options: [
      {
        label: 'Start Community Text Adventure Season 2',
        to: '@null',
        onActivate: 'reset("cta2/start")',
      },
      {
        label: 'Scene Editor',
        to: 'scene-editor',
        onActivate: 'sceneEditorId="beta/editor-demo"',
      },
    ],
    source: [],
  },
  'built-in/scene-editor': {
    type: 'scene',
    passage:
      "This is the Scene Editor. If this text is showing and the scene editor isn't, that's a problem.",
    options: [],
    meta: 'scene-editor',
    source: [],
  },
};
