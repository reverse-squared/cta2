import { StringObject } from './type-shorthand';
import { Scene } from '../shared/types';
import cta2BuiltInScenes from '../story/cta2';

const errorCSS = 'body{background:#302525}';

export function createErrorScene(id: string, error: any): Scene {
  return {
    type: 'scene',
    passage: `An Error Occurred in scene \`${id}\`\n\n\`\`\`${
      error instanceof Error ? error.message : String(error)
    }\`\`\``,
    options: [
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
    css: errorCSS,
    source: null,
    meta: 'loading-error',
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
  'built-in/loading': {
    type: 'scene',
    passage: '',
    options: [],
    source: null,
    meta: 'loading',
  },
  'built-in/start': {
    type: 'scene',
    passage: `Welcome to the **Community Text Adventure: Season 2**. This is the second installment
of CTA, where you (yes, *you*, the player) can suggest new paths, endings, and vote to create
the story. Be sure to join the Discord server to be able to vote on new scenes.`,
    options: [
      {
        label: 'Play CTA: Season 2',
        onActivate: 'reset("cta2/start")',
      },
      'separator',
      {
        label: 'Credits',
        to: 'credits',
        isVisible: '__internal_hasAtLeastOneEnding',
      },
      {
        label: 'View Endings',
        to: 'endings',
        isVisible: '__internal_hasAtLeastOneEnding',
      },
      'separator',
      {
        label: '**DEVELOPER**: Scene Editor',
        onActivate: `reset("/built-in/scene-editor");sceneEditorId="built-in/demo"`,
        isVisible: 'not __internal_PRODUCTION',
      },
      {
        label: '**DEVELOPER**: Edit a Scene',
        to: '@developer_editor',
        isVisible: 'not __internal_PRODUCTION',
      },
      {
        label: '**DEVELOPER**: Inspector',
        onActivate: '__internal_toggleInspector()',
        isVisible: 'not __internal_PRODUCTION',
      },
      'separator',
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
      'separator',
      {
        label: 'Reset',
        to: 'reset-progress',
        isVisible: '__internal_hasAtLeastOneEnding',
      },
    ],
    meta: 'main-menu',
    css:
      '[option-id="13"]{color:rgba(255,255,255,0.3);list-style:none;text-align:right;margin-top:20px}',
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
  'built-in/endings': {
    type: 'scene',
    passage: '',
    options: [
      {
        label: 'Back',
        to: '@undo',
      },
    ],
    onActivate: 'oldTitle=title;title="Endings"',
    onDeactivate: 'title=oldTitle',
    meta: 'endings',
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
  'built-in/first-time-introduction': {
    type: 'scene',
    passage: `Community Text Adventure is a game about endings. Good and Bad, there are infinite
possibilities of what you can do here.

You've got a long way to go, with \${__internal_endingCount} endings in the game.`,
    options: [
      {
        label: '*Time to collect some endings!*',
        to: '@reset',
      },
    ],
    source: null,
  },
  'built-in/runtime-error': {
    type: 'scene',
    passage: `At scene \`\${prevScene}\` during \`\${runtimeErrorSource}\` a runtime error occurred: \`\`\`\${runtimeErrorStack}\`\`\`\n\nExpression that errored was: \`\`\`\${runtimeErrorExpression}\`\`\``,
    options: [
      {
        label: 'Return to scene.',
        to: '@undo',
        isDisabled: 'prevScene=="@null"',
      },
      {
        label: 'Reset all',
        to: '@reset',
      },
    ],
    meta: 'runtime-error',
    css: errorCSS,
    source: null,
  },
  'built-in/reset-progress': {
    type: 'scene',
    passage: 'Are you really sure?',
    options: [
      {
        label: 'YES, reset *ALL* my progress',
        to: '@reset-all-progress',
      },
      {
        label: 'No, keep my data',
        to: '@undo',
      },
    ],
    onActivate: 'oldTitle=title;title="Reset all Progress"',
    onDeactivate: 'title=oldTitle',
    source: null,
  },
  // game starters
  ...cta2BuiltInScenes,
};
