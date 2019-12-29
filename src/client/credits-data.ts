import { useState } from 'react';

let isFetchingData = false;
let cache: SourceList | null = null;

type SourceList = SourcePartial[];
interface SourcePartial {
  id: string;
  name: string;
}

export function useCreditsList(): SourceList | null {
  const [, rerender] = useState(0);

  if (!cache && !isFetchingData) {
    isFetchingData = true;
    fetch(`/api/sources`)
      .then((response) => response.json())
      .then((json) => {
        cache = json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        isFetchingData = false;
        rerender(Math.random());
      });
  }

  return cache || null;
}
