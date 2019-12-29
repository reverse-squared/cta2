import { Scene } from '../shared/types';
import { ctaDb, runDb } from './database';

/** Returns boolean if scene exists */
export async function sceneExists(id: string): Promise<boolean> {
  if (id.includes('..')) {
    return false;
  }
  if (!id.includes('/')) {
    return false;
  }

  const response = await runDb(
    ctaDb()
      .table('scenes')
      .getAll(id)
      .count()
      .eq(1)
  );

  return response;
}

/** Returns Scene or null if no exist */
export async function getScene(id: string): Promise<Scene | null> {
  if (id.includes('..')) {
    return null;
  }
  if (!id.includes('/')) {
    return null;
  }

  const response = await runDb(
    ctaDb()
      .table('scenes')
      .get(id)
  );

  if (response) {
    return (response as any).scene as Scene;
  } else {
    return null;
  }
}

/** Returns Scene or null if no exist */
export async function createScene(id: string, scene: Scene) {
  if (id.includes('..')) {
    throw new Error('Scene name cannot contain ..');
  }
  if (!id.includes('/')) {
    throw new Error('Scene name has no namespace folder');
  }
  if (id.endsWith('/')) {
    throw new Error('Scene name cannot be a folder');
  }
  if (id.match(/\.json.*\//)) {
    throw new Error('Scene namespaces cannot contain the string ".json"');
  }
  if (id.match(/@/)) {
    throw new Error('Scene names cannot contain the @ symbol');
  }

  const exists = await runDb(
    ctaDb()
      .table('scenes')
      .getAll(id)
      .count()
      .eq(1)
  );

  if (exists) {
    throw new Error(`Scene ${id} already exists`);
  }

  await runDb(
    ctaDb()
      .table('scenes')
      .insert({ id: id, type: scene.type, scene: scene })
  );

  const sources: { name: string; desc?: string }[] =
    scene.source === null
      ? []
      : typeof scene.source === 'string'
      ? [{ name: scene.source }]
      : Array.isArray(scene.source)
      ? scene.source.map((source) => (typeof source === 'string' ? { name: source } : source))
      : [scene.source];

  await Promise.all(
    sources.map((source) =>
      runDb(
        ctaDb()
          .table('sources')
          .insert(
            { id: source.name.toLowerCase().replace(/\W/g, ''), name: source.name },
            { conflict: 'replace' }
          )
      )
    )
  );
}

export async function getAllEndings() {
  const allEndings = await runDb(
    ctaDb()
      .table('scenes')
      .getAll('ending', { index: 'type' })
      .coerceTo('array')
  );

  return allEndings.map((ending) => {
    return {
      id: ending.id,
      title: ending.scene.title,
    };
  });
}

export async function getAllSources() {
  const allSources = await runDb(
    ctaDb()
      .table('sources')
      .coerceTo('array')
  );

  return allSources;
}
