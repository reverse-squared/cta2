import path from 'path';
import fs from 'fs-extra';
import { contentRoot } from '../shared/roots';
import { Scene } from '../shared/types';

/** Returns boolean if scene exists */
export async function sceneExists(id: string): Promise<boolean> {
  if (id.includes('..')) {
    return false;
  }
  if (!id.includes('/')) {
    return false;
  }
  const jsonPath = path.join(contentRoot, id + '.json');
  return await fs.pathExists(jsonPath);
}

/** Returns Scene or null if no exist */
export async function getScene(id: string): Promise<Scene | null> {
  if (id.includes('..')) {
    return null;
  }
  if (!id.includes('/')) {
    return null;
  }
  const jsonPath = path.join(contentRoot, id + '.json');
  if (await fs.pathExists(jsonPath)) {
    return (await fs.readJSON(jsonPath)) as Scene;
  } else {
    return null;
  }
}

/** Returns Scene or null if no exist */
export async function createScene(id: string, scene: Scene, overwrite: boolean = false) {
  if (id.includes('..')) {
    throw new Error('Scene name cannot contain ..');
  }
  if (!id.includes('/')) {
    throw new Error('Scene name has no namespace folder');
  }
  if (!id.endsWith('/')) {
    throw new Error('Scene name cannot be a folder');
  }
  if (id.match(/\.json.*\//)) {
    throw new Error('Scene namespaces cannot contain the string ".json"');
  }
  const jsonPath = path.join(contentRoot, id + '.json');
  const exists = await fs.pathExists(jsonPath);
  if (exists && !overwrite) {
    throw new Error(
      'Scene already exists, pass optional third argument `overwrite` to modify the scene file.'
    );
  }
  fs.writeJson(jsonPath, scene);
}
