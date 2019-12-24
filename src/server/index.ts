import { app } from 'fullstack-system';
import r from 'rethinkdb';
import fs from 'fs-extra';
import path from 'path';

import { initBot } from '../discord-bot/bot';
import { getScene } from './scene';
import { connectToDatabase, runDb, ctaDb } from './database';

// Connect to the database
connectToDatabase();

// Start the Discord bot;
initBot();

app.get('/api/scene/*', async (req, res) => {
  const sceneName = req.url.substr(11);
  const scene = await getScene(req.url.substr(11));

  if (scene) {
    if (scene.type === 'ending') {
      // Increment view count.
      runDb(
        ctaDb()
          .table('scenes')
          .get(sceneName)
          .update({ views: r.row('views').add(1) })
      );
    }

    res.send({ exists: true, scene });
  } else {
    res.send({ exists: false });
  }
});
