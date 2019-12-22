import { app } from 'fullstack-system';
import fs from 'fs-extra';
import path from 'path';

const contentRoot = path.join(process.cwd(), 'content');

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
