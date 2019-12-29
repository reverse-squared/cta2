export const blankScene = JSON.stringify(
  {
    type: 'scene',
    passage: 'You stumble upon a penny when walking to work.',
    options: [
      {
        label: 'Pick it up.',
        to: 'pennyPickup',
      },
      {
        label: 'Leave it.',
        to: 'work',
      },
    ],
    source: 'Anonymous',
  },
  null,
  2
);
