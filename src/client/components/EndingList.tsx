import React, { useState, useCallback } from 'react';
import { useEndingList, EndingPartial } from '../ending-partials';
import EndingProgress from './EndingProgress';
import { getEndingDescriptionIfAchieved, getAchievedEndingSet } from '../ending';
import FancyText from './FancyText';
import Lock from './Lock';
import { GameState } from '../gameState';
import { InputChangeEvent } from '../type-shorthand';

export interface EndingCardProps {
  state: GameState;
  ending: EndingPartial;
}

function EndingCard({ state, ending: { id, title } }: EndingCardProps) {
  const desc = getEndingDescriptionIfAchieved(id);

  return (
    <div key={id}>
      <div className={'ending'}>
        <div className={'endingTitle'}>
          <FancyText inline disableLinks disableExpressions state={state} text={title} />
        </div>
        {desc ? (
          <div className={'endingDescription'}>
            <FancyText disableExpressions state={state} text={desc} />
          </div>
        ) : (
          <Lock />
        )}
      </div>
    </div>
  );
}

export interface EndingListProps {
  state: GameState;
}

function EndingList({ state }: EndingListProps) {
  const data = useEndingList();
  const achievedEndingsSet = getAchievedEndingSet();

  const [achievedVisible, setAchievedVisible] = useState(true);
  const [lockedVisible, setLockedVisible] = useState(true);

  const handleLockedVisibleChange = useCallback(() => {
    setLockedVisible((x) => !x);
  }, []);
  const handleAchievedVisibleChange = useCallback(() => {
    setAchievedVisible((x) => !x);
  }, []);

  const [filter, setFilter] = useState('');
  const handleFilterChange = useCallback((ev: InputChangeEvent) => {
    setFilter(ev.currentTarget.value);
  }, []);

  if (!data) {
    return <p className='ending-progress-text'>Loading Ending Data...</p>;
  }

  const sortedData = data.sort(function(a, b) {
    if (a.title < b.title) {
      return -1;
    }
    if (a.title > b.title) {
      return 1;
    }
    return 0;
  });

  const filteredData = sortedData.filter((ending) =>
    filter.trim() === '' ? true : ending.title.includes(filter.trim())
  );

  const achievedEndings = sortedData.filter((x) => achievedEndingsSet.has(x.id));
  const lockedEndings = sortedData.filter((x) => !achievedEndingsSet.has(x.id));
  const achievedFilteredEndings = filteredData.filter((x) => achievedEndingsSet.has(x.id));
  const lockedFilteredEndings = filteredData.filter((x) => !achievedEndingsSet.has(x.id));

  return (
    <>
      <EndingProgress />

      <input
        onChange={handleFilterChange}
        value={filter}
        placeholder='Filter'
        type='text'
        style={{ width: '100%' }}
      />
      <br />
      <br />
      <h2>
        Achieved Endings ({achievedEndings.length}){' '}
        <a href='#' className='link' onClick={handleAchievedVisibleChange}>
          [{achievedVisible ? 'hide' : 'show'}]
        </a>
      </h2>
      {achievedVisible &&
        achievedFilteredEndings.map((ending) => (
          <EndingCard key={ending.id} state={state} ending={ending} />
        ))}
      <h2>
        Locked Endings ({lockedEndings.length}){' '}
        <a href='#' className='link' onClick={handleLockedVisibleChange}>
          [{lockedVisible ? 'hide' : 'show'}]
        </a>
      </h2>
      {lockedVisible &&
        lockedFilteredEndings.map((ending) => (
          <EndingCard key={ending.id} state={state} ending={ending} />
        ))}
    </>
  );
}

export default EndingList;
