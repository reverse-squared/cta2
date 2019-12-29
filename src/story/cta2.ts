import { StringObject } from '../client/type-shorthand';
import { Scene } from '../shared/types';

const cta2BuiltInScenes: StringObject<Scene> = {
  'cta2/start': {
    meta: 'redirect:cta2/plane_waiting',
  } as any,
  'cta2/plane_waiting': {
    type: 'scene',
    passage: `You're boarding the Community Airlines on your way to Europe, it's going to be a great
    flight. You got another \${startingFlightTimeLeft} hour\${startingFlightTimeLeft==1?"":"s"} left on your flight, what shall you do
    to pass the time?`,
    options: [
      {
        label: 'Try to fall asleep',
        to: 'plane_tryToSleep',
      },
      {
        label: 'Demand to get a 1st class seat',
        to: 'plane_becomeKaren',
      },
      {
        label: 'Look out the window',
        to: 'plane_lookOutTheWindow',
      },
      {
        label: 'Play on your phone',
        to: 'plane_playOnYourPhone',
      },
      {
        label: 'Get up from your seat',
        to: 'plane_getUp',
      },
    ],
    onFirstActivate: 'startingFlightTimeLeft=8;title="CTA 2"',
    onActivate: 'startingFlightTimeLeft<=0?(scene="cta2/plane_gettingOff"):0',
    source: 'Dave Caruso',
    preloadScenes: ['plane_gettingOff'],
  },
  'cta2/plane_getUp': {
    type: 'scene',
    passage: `You get from from the window seat, having to cross over two sleeping passengers.
    There are 173 other passengers aboard this plane. You are seated in the economy section.`,
    options: [
      {
        label: 'Go to the bathroom',
        to: 'plane_placeC4Charge',
      },
      {
        label: 'Put a C4 charge on the cabin door',
        to: 'plane_placeC4Charge',
      },
      {
        label: 'Go to the bathroom.',
        to: 'plane_bathroom',
      },
      {
        label: 'Ask the flight attendant for a drink.',
        to: 'plane_askForDrink',
      },
      {
        label: 'Sit back down',
        to: 'plane_satBackDown',
      },
    ],
    source: ['Hunter Parcells', 'Dave Caruso'],
  },
  'cta2/plane_satBackDown': {
    type: 'scene',
    passage: `Your intense journey of standing up and sitting down took an entire hour.

    You're boarding the Community Airlines on your way to Europe, it's going to be a great
    flight. You got another \${startingFlightTimeLeft} hours left on your flight, what shall you do
    to pass the time?`,
    options: [
      {
        label: 'Try to fall asleep',
        to: 'plane_tryToSleep',
      },
      {
        label: 'Demand to get a 1st class seat',
        to: 'plane_becomeKaren',
      },
      {
        label: 'Look out the window',
        to: 'plane_lookOutTheWindow',
      },
      {
        label: 'Play on your phone',
        to: 'plane_playOnYourPhone',
      },
      {
        label: 'Get up from your seat',
        to: 'plane_getUp',
      },
    ],
    onActivate:
      'startingFlightTimeLeft=startingFlightTimeLeft-1;(startingFlightTimeLeft<=0)?(goToScene("plane_gettingOff")):0',
    source: 'Dave Caruso',
  },
};

export default cta2BuiltInScenes;
