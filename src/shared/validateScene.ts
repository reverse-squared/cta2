import { Scene, EndingScene, NormalScene, Option } from './types';

class ValidationError extends Error {}

function objectHasProperty<T extends object, K extends symbol | string | number>(
  obj: T,
  prop: K
): obj is T & { [A in K]: unknown } {
  return prop in obj && (obj as any)[prop] !== undefined;
}

function verifyObjectHasNoExtraProperties(label: string, obj: object, props: string[]) {
  let prop = Object.keys(obj).find((x) => !props.includes(x));
  if (prop) {
    throw new ValidationError(`${label} has extra property "${prop}"`);
  }
  return true;
}

export function validateOption(x: unknown, name = 'option'): Option {
  if (x === 'separator') return x;
  if (typeof x !== 'object')
    throw new ValidationError(name + ' is not an object or the string "separator".');
  if (x === null) throw new ValidationError(name + ' is not an object.');

  verifyObjectHasNoExtraProperties(name, x, [
    'label',
    'to',
    'isVisible',
    'isDisabled',
    'onActivate',
  ]);

  if (!objectHasProperty(x, 'label')) {
    throw new ValidationError(name + '.label is missing".');
  }
  if (!objectHasProperty(x, 'to')) {
    throw new ValidationError(name + '.to is missing".');
  }
  if (typeof x.label !== 'string') {
    throw new ValidationError(name + '.label is not type `string`".');
  }
  if (typeof x.to !== 'string') {
    throw new ValidationError(name + '.to is not type `string`".');
  }

  if (objectHasProperty(x, 'isVisible') && typeof x.isVisible !== 'string') {
    throw new ValidationError(name + '.isVisible is not type `string|undefined`');
  }
  if (objectHasProperty(x, 'isDisabled') && typeof x.isDisabled !== 'string') {
    throw new ValidationError(name + '.isDisabled is not type `string|undefined`');
  }
  if (objectHasProperty(x, 'onActivate') && typeof x.onActivate !== 'string') {
    throw new ValidationError(name + '.onActivate is not type `string|undefined`');
  }

  return x as Option;
}

export function validateScene(x: unknown, name = 'scene'): Scene {
  if (typeof x !== 'object') throw new ValidationError(name + ' is not an object.');
  if (x === null) throw new ValidationError(name + ' is not an object.');
  if (!objectHasProperty(x, 'type')) throw new ValidationError(name + '.type missing.');
  if (typeof x.type !== 'string') throw new ValidationError(name + '.type is not type `string`');

  if (!objectHasProperty(x, 'source')) {
    throw new ValidationError(name + '.source is missing');
  }

  if (!objectHasProperty(x, 'passage')) {
    throw new ValidationError(name + '.passage is missing');
  }
  if (typeof x.passage !== 'string') {
    throw new ValidationError(name + '.passage is not type `string`');
  }

  if (
    !(
      typeof x.source === 'string' ||
      x.source === null ||
      (typeof x.source === 'object' &&
        x.source !== null &&
        objectHasProperty(x.source, 'name') &&
        typeof x.source.name === 'string' &&
        !(objectHasProperty(x.source, 'desc') && typeof x.source.desc !== 'string') &&
        verifyObjectHasNoExtraProperties(name + `.source`, x.source, ['name', 'desc'])) ||
      (Array.isArray(x.source) &&
        x.source.every(
          (source: unknown, i) =>
            typeof source === 'string' ||
            (typeof source === 'object' &&
              source !== null &&
              objectHasProperty(source, 'name') &&
              typeof source.name === 'string' &&
              !(objectHasProperty(source, 'desc') && typeof source.desc !== 'string') &&
              verifyObjectHasNoExtraProperties(name + `.source[${i}]`, source, ['name', 'desc']))
        ))
    )
  ) {
    throw new ValidationError(name + '.source is not type `Source` (see type docs)');
  }

  if (objectHasProperty(x, 'css') && typeof x.css !== 'string') {
    throw new ValidationError(name + '.css is not type `string|undefined`');
  }

  if (x.type === 'scene') {
    verifyObjectHasNoExtraProperties(name, x, [
      'type',
      'passage',
      'options',
      'css',
      'source',
      'onActivate',
      'onFirstActivate',
      'onDeactivate',
      'onFirstDeactivate',
      'preloadScenes',
    ]);

    if (!objectHasProperty(x, 'options')) {
      throw new ValidationError(name + '.options is missing');
    }

    if (
      objectHasProperty(x, 'preloadScenes') &&
      (!Array.isArray(x.preloadScenes) || !x.preloadScenes.every((x) => typeof x === 'string'))
    ) {
      throw new ValidationError(name + '.preloadScenes is not type `string[]|undefined`');
    }
    if (objectHasProperty(x, 'onActivate') && typeof x.onActivate !== 'string') {
      throw new ValidationError(name + '.onActivate is not type `string|undefined`');
    }
    if (objectHasProperty(x, 'onFirstActivate') && typeof x.onFirstActivate !== 'string') {
      throw new ValidationError(name + '.onFirstActivate is not type `string|undefined`');
    }
    if (objectHasProperty(x, 'onDeactivate') && typeof x.onDeactivate !== 'string') {
      throw new ValidationError(name + '.onActivate is not type `string|undefined`');
    }
    if (objectHasProperty(x, 'onFirstDeactivate') && typeof x.onFirstDeactivate !== 'string') {
      throw new ValidationError(name + '.onFirstDeactivate is not type `string|undefined`');
    }

    return x as NormalScene;
  } else if (x.type === 'ending') {
    verifyObjectHasNoExtraProperties(name, x, [
      'type',
      'passage',
      'title',
      'description',
      'css',
      'source',
    ]);

    if (!objectHasProperty(x, 'title')) {
      throw new ValidationError(name + '.title is missing');
    }
    if (!objectHasProperty(x, 'description')) {
      throw new ValidationError(name + '.description is missing');
    }
    if (typeof x.title !== 'string') {
      throw new ValidationError(name + '.title is not type `string`');
    }
    if (typeof x.description !== 'string') {
      throw new ValidationError(name + '.description is not type `string`');
    }
    return x as EndingScene;
  } else {
    throw new ValidationError(name + `.type must be "scene" or "ending", got "${x.type}"`);
  }
}
