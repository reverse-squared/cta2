import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';

import { Scene } from '../shared/types';

import env from '../shared/env';
import { createScene } from '../server/scene';
import { createRequestInDb, SceneRequest, deleteRequest, getAllRequests } from './requests';
import { runDb, ctaDb } from '../server/database';
import { formatSource } from '../shared/utils/formatSource';

const EMBED_COLOR = 0x64ed98;

let bot: Discord.Client;
let votingChannel: Discord.TextChannel;
let archiveChannel: Discord.TextChannel;
let commentChannel: Discord.TextChannel;

const botIsEnabled = env.bot.token && env.bot.votingChannel;

export function initBot() {
  if (botIsEnabled && env.bot.token && env.bot.votingChannel) {
    bot = new Discord.Client();
    bot.login(env.bot.token);

    bot.on('ready', async () => {
      bot.user.setActivity('Adventuring...');

      const guild = bot.guilds.get(env.bot.homeGuild);
      if (!guild) {
        throw new Error('Guild does not exist.');
      }

      votingChannel = guild.channels.get(env.bot.votingChannel) as Discord.TextChannel;
      archiveChannel = guild.channels.get(env.bot.archiveChannel) as Discord.TextChannel;
      commentChannel = guild.channels.get(env.bot.commentChannel) as Discord.TextChannel;

      (await getAllRequests()).forEach((request) => {
        watchForVoting(request);
      });

      console.log('[Bot] Bot ready.');
    });
  }
}

function getDiscordEmbed(
  id: string,
  requestId: string | null,
  scene: Scene,
  time: number,
  state: 'open' | 'closed-accept' | 'closed-deny' | 'force-accept' | 'force-deny',
  upvotes?: number,
  downvotes?: number
) {
  const embedBase = {
    color: EMBED_COLOR,
    footer: {
      text:
        state === 'open'
          ? 'Voting Open!'
          : `Voting Ended | Scene ${
              {
                'closed-accept': 'Added',
                'closed-deny': 'Not Added',
                'force-accept': 'Forcefully Added by Moderator',
                'force-deny': 'Forcefully Not Added by Moderator',
              }[state]
            } | ${upvotes} 👍, ${downvotes} 👎`,
    },
    timestamp: time,
    author: { name: formatSource(scene.source).substr(0, 250) },
  };

  const sceneEmbedPart =
    scene.type === 'scene'
      ? {
          title: `New Scene: ${id}`,
          description: scene.passage,
          fields: scene.options
            .map((option) => {
              if (option === 'separator') {
                return {
                  name: '​',
                  value: '​',
                };
              }

              return {
                name: option.label.substr(0, 250),
                value: `Goes to \`${option.to}\`.`.substr(0, 1000),
              };
            })
            .slice(0, 25),
        }
      : {
          title: `New Ending: ${id}`,
          description: scene.passage.substr(0, 2048),
          fields: [
            {
              name: scene.title,
              value: scene.description.substr(0, 1000),
            },
          ],
        };

  return {
    ...embedBase,
    ...sceneEmbedPart,
    ...(requestId && {
      url: 'https://cta2.davecode.me/inspect_request/' + requestId,
    }),
  };
}

async function deleteRequestsOfLikeId(id: string) {
  const requestsToRemove = await runDb(
    ctaDb()
      .table('requests')
      .getAll(id, { index: 'id' })
      .count()
  );

  for (let i = 0; i < requestsToRemove; i++) {
    // Yeet the message.
    const scene = await runDb(
      ctaDb()
        .table('requests')
        .getAll(id, { index: 'id' })
        .nth(0)
    );
    const message = await votingChannel.fetchMessage(scene.discordMessageId);

    message.delete();

    deleteRequest(scene.uuid);
  }
}

async function watchForVoting(request: SceneRequest) {
  let message: Discord.Message;
  try {
    message = await votingChannel.fetchMessage(request.discordMessageId);
    if (!message) {
      throw new Error('Message does not exist.');
    }
  } catch (error) {
    commentChannel.send(
      `Request \`${request.uuid}\` (for \`${request.id}\`)'s discord message wasn't found, deleting...`
    );
    deleteRequest(request.uuid);
    return;
  }

  // Create a reaction collector for when an admin forces a vote.
  const moderatorVoteCollector = message.createReactionCollector(
    (reaction, user) => {
      const reactingUser = message.guild.members.get(user.id);
      if (!reactingUser) return false;

      return (
        ['✅', '❌'].includes(reaction.emoji.name) &&
        reactingUser.roles.has(env.bot.moderatorRoleId)
      );
    },
    { time: request.ends - Date.now() }
  );

  moderatorVoteCollector.on('collect', async (reaction) => {
    const message = await votingChannel.fetchMessage(request.discordMessageId);

    const upvotes = message.reactions.find((react) => react.emoji.name === '👍').count - 1;
    const downvotes = message.reactions.find((react) => react.emoji.name === '👎').count - 1;

    if (reaction.emoji.name === '✅') {
      // accept
      createScene(request.id, request.scene);

      archiveChannel.send({
        embed: getDiscordEmbed(
          request.id,
          null,
          request.scene,
          Date.now(),
          'force-accept',
          upvotes,
          downvotes
        ),
      });
      commentChannel.send(
        `**REQUEST ADDED** \`${request.uuid}\` (for \`${request.id}\`); forced by ${
          reaction.users.array()[0]
        }`
      );
    } else if (reaction.emoji.name === '❌') {
      // delete
      archiveChannel.send({
        embed: getDiscordEmbed(
          request.id,
          null,
          request.scene,
          Date.now(),
          'force-deny',
          upvotes,
          downvotes
        ),
      });
    } else {
      return;
    }

    message.delete();
    deleteRequest(request.uuid);
    deleteRequestsOfLikeId(request.id);
  });

  setTimeout(async () => {
    const message = await votingChannel.fetchMessage(request.discordMessageId);

    const upvotes = message.reactions.find((react) => react.emoji.name === '👍').count - 1;
    const downvotes = message.reactions.find((react) => react.emoji.name === '👎').count - 1;

    if (upvotes > downvotes) {
      createScene(request.id, request.scene);
      archiveChannel.send({
        embed: getDiscordEmbed(
          request.id,
          null,
          request.scene,
          request.ends,
          'closed-deny',
          upvotes,
          downvotes
        ),
      });
      commentChannel.send(`**REQUEST ADDED** \`${request.uuid}\` (for \`${request.id}\`)`);
    } else {
      archiveChannel.send({
        embed: getDiscordEmbed(
          request.id,
          null,
          request.scene,
          request.ends,
          'closed-deny',
          upvotes,
          downvotes
        ),
      });
    }

    deleteRequestsOfLikeId(request.id);
  }, request.ends - Date.now());
}

export async function postScene(id: string, scene: Scene, comment: string) {
  if (!botIsEnabled) {
    console.warn(
      'WARNING: The discord bot is not enabled. Scene ' + id + ' was added without voting.'
    );
    createScene(id, scene);
    return;
  }

  const now = Date.now();
  const embed = getDiscordEmbed(id, null, scene, now, 'open');
  const message = (await votingChannel.send({ embed: embed })) as Discord.Message;
  const request = await createRequestInDb(id, scene, message.id, now);
  const embed2 = getDiscordEmbed(id, request.id, scene, now, 'open');

  await message.edit(embed2);

  await message.react('👍');
  await message.react('👎');

  watchForVoting(request);

  if (comment.trim() !== '') {
    commentChannel.send(
      `Comment for scene request \`${id}\`: \`\`\`${comment.replace(/`/g, '`\u2063')}\`\`\``
    );
  }
}
