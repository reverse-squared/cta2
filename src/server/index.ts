import { app } from 'fullstack-system';
import fs from 'fs-extra';
import path from 'path';

import { initBot } from '../discord-bot/bot';

const contentRoot = path.join(process.cwd(), 'content');

// Start the Discord bot;
initBot();

app.get('/api/scene/*', async (req, res) => {
  const sceneId = req.url.substr(11);
  if (sceneId.includes('..')) {
    res.send({
      exists: false,
    });
    return;
  }
  if (!sceneId.includes('/')) {
    res.send({
      exists: false,
    });
    return;
  }
  const jsonPath = path.join(contentRoot, sceneId + '.json');
  if (await fs.pathExists(jsonPath)) {
    res.send({
      exists: true,
      scene: await fs.readJSON(jsonPath),
    });
  } else {
    res.send({
      exists: false,
    });
  }
});
