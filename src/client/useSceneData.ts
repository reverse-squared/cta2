import { Scene } from '../shared/types';
import { StringObject } from './type-shorthand';
import { useEffect, useState } from 'react';
import { validateScene } from '../shared/validateScene';
import { builtInScenes } from './built-in-scenes';

const sceneCache: StringObject<Scene> = { ...builtInScenes };
const requests: Set<string> = new Set();

export function deleteSceneFromCache(id: string) {
  delete sceneCache[id];
}

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

export function useSceneData(id: string): Scene | null {
  const [, rerender] = useState(0);

  if (!(id in sceneCache) && !requests.has(id)) {
    requests.add(id);
    fetch(`/api/scene/${id}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.exists) {
          sceneCache[id] = validateScene(json.scene);
        } else {
          sceneCache[id] = create404Scene(id);
        }
        rerender(Math.random());
      })
      .catch((error) => {
        sceneCache[id] = createErrorScene(id, error);
      })
      .finally(() => {
        requests.delete(id);
        rerender(Math.random());
      });
  }

  return sceneCache[id] || null;
}
