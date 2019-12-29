import { app } from 'fullstack-system';
import r from 'rethinkdb';
import fs from 'fs-extra';
import path from 'path';
import bodyParser from 'body-parser';
import { initBot, postScene } from '../discord-bot/bot';
import { getScene, getAllSources, getAllEndings } from './scene';
import { connectToDatabase, runDb, ctaDb } from './database';
import { validateScene } from '../shared/validateScene';

// Connect to the database
connectToDatabase();

// Start the Discord bot;
initBot();

app.use(bodyParser.json());

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

app.get('/api/endings', async (req, res) => {
  res.send(await getAllEndings());
});
app.get('/api/sources', async (req, res) => {
  res.send(await getAllSources());
});

app.post('/api/request', async (req, res) => {
  try {
    if (!req.body) {
      throw new Error();
    }
    if (typeof req.body !== 'object') {
      throw new Error();
    }
    if (typeof req.body.id !== 'string') {
      throw new Error();
    }
    if (typeof req.body.comment !== 'string') {
      throw new Error();
    }
    validateScene(req.body.scene);
    postScene(req.body.id, req.body.scene, req.body.comment);
    res.send({ error: false });
  } catch (error) {
    res.send({ error: true });
  }
});
