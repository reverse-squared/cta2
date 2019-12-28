const endingsAchieved: Set<string> = new Set();

export function getAchievedEndingSet(): Set<string> {
  return endingsAchieved;
}
export function setEndingAsNotAchieved(id: string) {
  endingsAchieved.delete(id);
}
export function setEndingAsAchieved(id: string) {
  endingsAchieved.add(id);
}
export function isEndingAchieved(id: string) {
  return endingsAchieved.has(id);
}
