import { Scene } from './types';

export function validateScene(x: unknown): Scene {
  return x as any;
}
