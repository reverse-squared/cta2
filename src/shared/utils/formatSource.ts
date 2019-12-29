import { Source } from '../types';

function formatList(list: string[]): string {
  let array = list.concat();

  if (array.length === 1) {
    return array[0];
  }

  array[array.length - 1] = ` and ${array[array.length - 1]}`;

  if (array.length < 3) {
    return array.join(' ');
  }
  return array.join(',');
}

export function formatSource(input: Source | Source[] | string | null): string {
  if (input === null) {
    return 'no one';
  }
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return 'no one';
    }
    return formatList(input.map((x) => formatSource(x)));
  } else {
    if (typeof input === 'string') {
      return input;
    } else {
      return input.name + (input.desc ? ` (${input.desc})` : '');
    }
  }
}
