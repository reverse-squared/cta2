import { app } from 'fullstack-system';
import fs from 'fs-extra';
import path from 'path';

import { initBot } from '../discord-bot/bot';
import { getScene } from './scene';
import { connectToDatabase } from './database';

// Connect to the database
connectToDatabase();

// Start the Discord bot;
initBot();

app.get('/api/scene/*', async (req, res) => {
  const scene = await getScene(req.url.substr(11));

  if (scene) {
    res.send({ exists: true, scene });
  } else {
    res.send({ exists: false });
  }
});
