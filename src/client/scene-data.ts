import { Scene } from '../shared/types';
import { StringObject } from './type-shorthand';
import { useEffect, useState } from 'react';
import { validateScene } from '../shared/validateScene';
import { builtInScenes, create404Scene, createErrorScene } from './built-in-scenes';

const sceneCache: StringObject<Scene> = { ...builtInScenes };
const requests: Set<string> = new Set();

export function deleteSceneFromCache(id: string) {
  delete sceneCache[id];
}
export function getSceneData(id: string) {
  return sceneCache[id] || null;
}

export function useSceneData(id: string, extraScenes?: StringObject<Scene>): Scene | null {
  const [, rerender] = useState(0);

  if (extraScenes && extraScenes[id]) return extraScenes[id];

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
