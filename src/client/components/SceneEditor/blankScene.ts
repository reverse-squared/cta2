export const blankScene = JSON.stringify(
  {
    type: 'scene',
    passage: 'You stumble upon a penny when walking to work.',
    options: [
      {
        label: 'Pick it up.',
        to: 'pennyPickup',
        isVisible: 'isPennyOnGround',
      },
      {
        label: 'Leave it.',
        to: 'work',
      },
    ],
    onFirstActivate: 'isPennyOnGround = true',
    source: 'yourself',
  },
  null,
  2
);
