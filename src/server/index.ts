import { app } from 'fullstack-system';
import fs from 'fs-extra';
import path from 'path';

import { initBot } from '../discord-bot/bot';
import doesSceneExist from './utils/doesSceneExist';

// Start the Discord bot;
initBot();

app.get('/api/scene/*', async (req, res) => {
  const scene = await doesSceneExist(req.url.substr(11));

  if(scene) {
    res.send(scene);
    return;
  }
  res.send({
    exists: false,
  });
});
