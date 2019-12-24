const endingsCompleted: Set<string> = new Set();

export function getCompletedEndingList(): Set<string> {
  return endingsCompleted;
}

export function setEndingAsNotAchieved(id: string) {
  endingsCompleted.delete(id);
}
export function setEndingAsAchieved(id: string) {
  endingsCompleted.add(id);
}
export function isEndingAchieved(id: string) {
  return endingsCompleted.has(id);
}
