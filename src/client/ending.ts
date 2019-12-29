import { StringObject } from './type-shorthand';
import { getSceneData } from './scene-data';

function readLocalStorageSet(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem('cta2_ending_ids') as string));
  } catch (error) {
    return new Set();
  }
}
function readLocalStorageCache(): StringObject<string> {
  try {
    return JSON.parse(localStorage.getItem('cta2_ending_cache') as string) || {};
  } catch (error) {
    return {};
  }
}

const endingsAchieved: Set<string> = readLocalStorageSet();
const endingDescriptionCache: StringObject<string> = readLocalStorageCache();

function writeLocalStorage() {
  localStorage.setItem('cta2_ending_ids', JSON.stringify(Array.from(endingsAchieved)));
  localStorage.setItem('cta2_ending_cache', JSON.stringify(endingDescriptionCache));
}

export function getAchievedEndingSet(): Set<string> {
  return endingsAchieved;
}
export function setEndingAsNotAchieved(id: string) {
  endingsAchieved.delete(id);
  delete endingDescriptionCache[id];
  writeLocalStorage();
}
export function setEndingAsAchieved(id: string) {
  const scene = getSceneData(id);
  if (!scene) throw new Error('Scene ' + id + ' not loaded.');
  if (scene.type !== 'ending') throw new Error('Scene ' + id + ' not an ending.');
  endingsAchieved.add(id);
  endingDescriptionCache[id] = scene.description;
  writeLocalStorage();
}
export function isEndingAchieved(id: string) {
  return endingsAchieved.has(id);
}
export function getEndingDescriptionIfAchieved(id: string) {
  return endingDescriptionCache[id] || null;
}
