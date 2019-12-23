import { Scene } from '../shared/types';
import { StringObject } from './type-shorthand';
import { useEffect, useState } from 'react';
import { validateScene } from '../shared/validateScene';

const sceneCache: StringObject<Scene> = {};
const requests: Array<string> = [];

function createErrorScene(id: string, error: any): Scene {
  return {
    type: 'scene',
    passage: `An Error Occurred in scene \`${id}\`\n\n\`\`\`${
      error instanceof Error ? error.message : String(error)
    }\`\`\``,
    options: [
      {
        label: 'Reload Scene',
        to: '@refresh',
      },
    ],
    css: 'body{background:#232020}',
    source: null,
    meta: 'error',
  };
}

export function useSceneData(id: string): Scene | null {
  const [, rerender] = useState(0);

  useEffect(() => {
    if (!(id in sceneCache) && !requests.includes(id)) {
      requests.push(id);
      fetch(`/api/scene/${id}`)
        .then((response) => response.json())
        .then((json) => {
          sceneCache[id] = validateScene(json.scene);
          rerender(Math.random());
        })
        .catch((error) => {
          sceneCache[id] = createErrorScene(id, error);
          rerender(Math.random());
        });
    }
  }, [id]);

  return sceneCache[id] || null;
}
