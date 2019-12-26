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
