import path from 'path';
import fs from 'fs-extra';
import { contentRoot } from '../../shared/roots';

export default async function(sceneId: string) {
  if (sceneId.includes('..')) {
    return null;
  }
  if (!sceneId.includes('/')) {
    return null;
  }
  const jsonPath = path.join(contentRoot, sceneId + '.json');
  if (await fs.pathExists(jsonPath)) {
    return {
      exists: true,
      scene: await fs.readJSON(jsonPath),
    };
  } else {
    return null;
  }
}
