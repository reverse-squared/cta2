import { StringObject } from './type-shorthand';
import { Scene } from '../shared/types';
import cta2BuiltInScenes from '../story/cta2';

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
    css: 'body{background:#302525}',
    source: null,
    meta: 'error',
  };
}

export function create404Scene(id: string): Scene {
  return {
    type: 'scene',
    passage: `The scene \`${id}\` doesn't exist.`,
    options: [
      {
        label: 'Request this scene',
        onActivate: `reset("/built-in/scene-editor");sceneEditorId="${id}"`,
        isVisible: 'not __internal_isSceneEditorPreview',
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
        isDisabled: '__internal_isBuiltInScene(scene)',
      },
      {
        label: 'Reset all',
        to: '@reset',
      },
    ],
    source: null,
    meta: '404',
  };
}

export const builtInScenes: StringObject<Scene> = {
  'built-in/start': {
    type: 'scene',
    passage: `Welcome to the **Community Text Adventure: Season 2 Beta**. This is the second installment
      of Community Text Adventure where you (yes, you the player) can suggest new paths, endings,
      and vote on others. Be sure to join the Discord server to be able to vote on new scenes.

      Your help today will ensure the speedy and smooth release of the game on December 30th, 2019.
      Any scenes created before that time will not be transferred over to the released game.`,
    options: [
      {
        label: 'Play CTA: Season 2',
        onActivate: 'reset("cta2/start")',
      },
      {
        label: 'Open the Scene Editor',
        onActivate: `reset("/built-in/scene-editor");sceneEditorId="built-in/demo"`,
      },
      'separator',
      {
        label: 'Credits',
        to: '/built-in/credits',
      },
      {
        label: 'Join the Discord Server',
        to: 'https://discord.gg/ABwjpk4',
      },
      {
        label: 'Play the Original Community Text Adventure.',
        to: 'https://cta.davecode.me/',
      },
      {
        label: 'Read the Documentation',
        to: 'https://reverse-squared.github.io/cta2/#/',
      },
    ],
    source: null,
  },
  'built-in/credits': {
    type: 'scene',
    passage: '',
    options: [
      {
        label: 'Back',
        to: '@undo',
      },
    ],
    onActivate: 'oldTitle=title;title="Credits"',
    onDeactivate: 'title=oldTitle',
    meta: 'credits',
    source: null,
  },
  'built-in/scene-editor': {
    type: 'scene',
    passage:
      "This is the Scene Editor. If this text is showing and the scene editor isn't, that's a problem.",
    options: [],
    onActivate: 'oldTitle=title;title="Yikes!"',
    onDeactivate: 'title=oldTitle',
    meta: 'scene-editor',
    source: null,
  },
  'built-in/scene-editor-too-small': {
    type: 'scene',
    passage:
      'The Scene Editor is too big for your screen! Browser window must be at least 1145 pixels wide.',
    options: [
      {
        label: 'Go back one step',
        to: '@undo',
      },
      {
        label: 'Return to the Main Menu',
        to: '@reset',
      },
    ],
    source: null,
  },
  ...cta2BuiltInScenes,
};
