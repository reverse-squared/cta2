import { app } from 'fullstack-system';
import r from 'rethinkdb';
import fs from 'fs-extra';
import path from 'path';
import bodyParser from 'body-parser';
import { initBot, postScene } from '../discord-bot/bot';
import { getScene, getAllSources, getAllEndings, sceneExists, createScene } from './scene';
import { connectToDatabase, runDb, ctaDb } from './database';
import { validateScene } from '../shared/validateScene';
import NodeCache from 'node-cache';
import { Scene } from '../shared/types';
import env from '../shared/env';

// Connect to the database
connectToDatabase();

// Start the Discord bot;
initBot();

// Create caches.
const sceneCache = new NodeCache({ stdTTL: 86400 });
const otherCache = new NodeCache({ stdTTL: 240 });

app.use(bodyParser.json());

app.get('/api/client_env.js', (req, res) => {
  // CLIENT ENVIRONMENT
  const clientEnv = {
    googleAnalyticsID: env.googleAnalyticsID,
  };

  res.setHeader('Content-Type', 'text/javascript');
  res.end(`window.__ENV=${JSON.stringify(clientEnv)}`);
});

app.get('/api/scene/*', async (req, res) => {
  const sceneName = req.url.substr(11);
  const cachedScene = sceneCache.get(sceneName);
  let scene;

  if (cachedScene) {
    scene = cachedScene as Scene;
  } else {
    scene = (await getScene(req.url.substr(11))) as Scene;
  }

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

    sceneCache.set(sceneName, scene);
  } else {
    res.send({ exists: false });
  }
});

app.get('/api/endings', async (req, res) => {
  const cached = otherCache.get('endings');
  if (cached) {
    res.send(cached);
  } else {
    const data = await getAllEndings();
    res.send(data);
    otherCache.set('endings', data);
  }
});
app.get('/api/sources', async (req, res) => {
  const cached = otherCache.get('sources');
  if (cached) {
    res.send(cached);
  } else {
    const data = await getAllSources();
    res.send(data);
    otherCache.set('sources', data);
  }
});

// scene names are allowed for only the story
const allowedSceneNames = [/cta2\/.*/];

app.post('/api/request', async (req, res) => {
  try {
    if (!req.body) {
      throw new Error('no body');
    }
    if (typeof req.body !== 'object') {
      throw new Error('not obj');
    }
    if (typeof req.body.id !== 'string') {
      throw new Error('no id');
    }
    if (!allowedSceneNames.some((x) => x.exec(req.body.id))) {
      throw new Error('scene name banned');
    }
    if (typeof req.body.comment !== 'string') {
      throw new Error('comment not a string');
    }
    validateScene(req.body.scene);
    if (req.body.isEditing) {
      if (req.body.developerToken === env.developerPassword) {
        createScene(req.body.id, req.body.scene, true);
        res.send({ error: false });
      } else {
        throw new Error('incorrect developer information');
      }
      return;
    }
    if (await sceneExists(req.body.id)) {
      throw new Error('scene exists');
    }
    postScene(req.body.id, req.body.scene, req.body.comment);
    res.send({ error: false });
  } catch (error) {
    console.log(error);
    res.send({ error: error.message });
  }
});
