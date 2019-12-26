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
    source: null,
    meta: '404',
  };
}

export const builtInScenes: StringObject<Scene> = {
  'built-in/start': {
    type: 'scene',
    passage:
      'Welcome to the Community Text Adventure: Season 2 Beta. This is the second installment of Community Text Adventure where you (yes, you the player) can suggest new paths, endings, and vote on others. Be sure to join our Discord server at [https://discord.gg/ABwjpk4](https://discord.gg/ABwjpk4) to be able to vote on new scenes.\n\nYour help today will ensure the speedy and smooth release of the game on December 30th, 2019. Any scenes created before that time will not be transferred over to the released game.',
    options: [
      {
        label: 'Play the first Community Text Adventure.',
        to: 'https://cta.davecode.me/',
      },
      {
        label: 'Start Community Text Adventure: Season 2.',
        to: '@null',
        onActivate: 'reset("cta2/start")',
      },
      'separator',
      {
        label: 'Join the Discord Server',
        to: 'https://discord.gg/ABwjpk4',
      },
      {
        label: 'Read the Documentation',
        to: 'https://reverse-squared.github.io/cta2/#/',
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
