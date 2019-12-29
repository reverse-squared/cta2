import React from 'react';
import { useCreditsList } from '../credits-data';

function Credits() {
  const credits = useCreditsList();

  return (
    <div>
      <h2>Game Developers</h2>
      <ul>
        <li className='option'>
          <a className='optionLink' href='https://davecode.me'>
            Dave Caruso
          </a>
        </li>
        <li className='option'>
          <a className='optionLink' href='https://hparcells.netlify.com'>
            Hunter Parcells
          </a>
        </li>
      </ul>
      <h2>Game Moderators</h2>
      <ul>
        <li className='option option-white'>Hunter Parcells</li>
        <li className='option option-white'>Mudkip557</li>
      </ul>
      <h2>Scene Contributors</h2>
      {credits ? (
        <ul>
          {credits.map((credit) => {
            return (
              <li className='option option-white' key={credit.id}>
                {credit.name}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Loading Scene Credits...</p>
      )}
      <br />
      <br />
    </div>
  );
}

export default Credits;
