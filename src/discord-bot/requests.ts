import { Scene } from '../shared/types';
import { ctaDb, runDb } from '../server/database';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const VOTING_PERIOD = 10 * SECOND;
// export const VOTING_PERIOD = 1 * DAY;

export interface SceneRequest {
  uuid: string;
  // scene info
  id: string;
  scene: Scene;
  // discord
  discordMessageId: string;
  // times
  starts: number;
  ends: number;
}

export async function createRequestInDb(
  id: string,
  scene: Scene,
  discordMessageId: string,
  time: number
): Promise<SceneRequest> {
  const obj = {
    id: id,
    scene: scene,
    discordMessageId: discordMessageId,
    starts: time,
    ends: time + VOTING_PERIOD,
  };

  const key = (
    await runDb(
      ctaDb()
        .table('requests')
        .insert(obj)
    )
  ).generated_keys[0];

  return {
    uuid: key,
    ...obj,
  };
}

export async function getAllRequests(): Promise<SceneRequest[]> {
  const response = await runDb(
    ctaDb()
      .table('requests')
      .coerceTo('array')
  );

  return response;
}

export async function getRequest(uuid: string): Promise<SceneRequest | null> {
  const response = await runDb(
    ctaDb()
      .table('requests')
      .get(uuid)
  );

  return response as SceneRequest | null;
}

export async function deleteRequest(uuid: string): Promise<void> {
  await runDb(
    ctaDb()
      .table('requests')
      .get(uuid)
      .delete()
  );
}
