import { useState } from 'react';

let isFetchingData = false;
let cache: EndingList | null = null;

type EndingList = EndingPartial[];
interface EndingPartial {
  id: string;
  title: string;
}

export function useEndingList(): EndingList | null {
  const [, rerender] = useState(0);

  if (!cache && !isFetchingData) {
    isFetchingData = true;
    fetch(`/api/endings`)
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

export function useEndingCount(): number | null {
  const endingList = useEndingList();
  if (endingList) {
    return endingList.length;
  } else {
    return null;
  }
}
