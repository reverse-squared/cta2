import React from 'react';
import { getAchievedEndingSet } from '../ending';
import { useEndingCount } from '../ending-partials';

export interface EndingProgressProps {}

function EndingProgress({}: EndingProgressProps) {
  const achieved = getAchievedEndingSet().size;
  const total = useEndingCount();

  if (achieved === 0) return null;

  return achieved !== null && total !== null ? (
    total !== 0 ? (
      <>
        <p className='ending-progress-text'>
          You have {achieved} of {total} total endings. ({((achieved / total) * 100).toFixed(1)}%
          Completion)
        </p>
        <div className='ending-bar'>
          <div className='ending-bar-inner' style={{ width: `${(achieved / total) * 100}%` }}></div>
        </div>
      </>
    ) : (
      <p className='ending-progress-text'>There are no endings yet.</p>
    )
  ) : (
    <>
      <p className='ending-progress-text'>Loading Ending Data...</p>
    </>
  );
}

export default EndingProgress;
