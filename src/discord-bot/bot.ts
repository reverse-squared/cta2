import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';

import { Scene } from '../shared/types';

import env from '../shared/env';
import { createScene } from '../server/scene';
import { createRequestInDb, SceneRequest, deleteRequest, getAllRequests } from './requests';

const EMBED_COLOR = 0x64ed98;

let bot: Discord.Client;
let votingChannel: Discord.TextChannel;
let archiveChannel: Discord.TextChannel;

export function initBot() {
  if (env.bot.token && env.bot.votingChannel) {
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

      (await getAllRequests()).forEach((request) => {
        watchForVoting(request);
      });

      // TODO: Make this a fancy.
      console.log('[Bot] Bot ready.');
    });
  }
}

function getDiscordEmbed(
  id: string,
  scene: Scene,
  time: number,
  state: 'open' | 'closed-accept' | 'closed-deny' | 'force-accept' | 'force-deny',
  upvotes?: number,
  downvotes?: number
) {
  const embedBase = {
    color: EMBED_COLOR,
    footer:
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
    timestamp: time,
  };

  const sceneEmbedPart =
    scene.type === 'scene'
      ? {
          title: `New Scene: ${id}`,
          description: scene.passage,
          fields: scene.options.map((option) => {
            if (option === 'separator') {
              return {
                name: '​',
                value: '​',
              };
            }

            return {
              name: option.label,
              value: `Goes to \`${option.to}\`.`,
            };
          }),
        }
      : {
          title: `New Ending: ${id}`,
          description: scene.passage,
          // TODO: add the rest
        };

  return {
    ...embedBase,
    ...sceneEmbedPart,
  };
}

async function watchForVoting(request: SceneRequest) {
  const message = await votingChannel.fetchMessage(request.discordMessageId);
  if (!message) {
    // todo: log and delete the request
    throw new Error('Message does not exist.');
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
    if (reaction.emoji.name === '✅') {
      // accept
      createScene(request.id, request.scene);

      archiveChannel.send({
        embed: getDiscordEmbed(request.id, request.scene, request.ends, 'force-accept'),
      });
    } else if (reaction.emoji.name === '❌') {
      // delete
      archiveChannel.send({
        embed: getDiscordEmbed(request.id, request.scene, request.ends, 'force-deny'),
      });
    } else {
      return;
    }

    message.delete();
    deleteRequest(request.uuid);
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
          request.scene,
          request.ends,
          'closed-deny',
          upvotes,
          downvotes
        ),
      });
    } else {
      archiveChannel.send({
        embed: getDiscordEmbed(
          request.id,
          request.scene,
          request.ends,
          'closed-deny',
          upvotes,
          downvotes
        ),
      });
    }
  }, request.ends - Date.now());
}

export async function postSceneNew(id: string, scene: Scene) {
  const now = Date.now();

  const embed = getDiscordEmbed(id, scene, now, 'open');

  const message = (await votingChannel.send({ embed: embed })) as Discord.Message;

  await message.react('👍');
  await message.react('👎');

  const request = await createRequestInDb(id, scene, message.id, now);

  watchForVoting(request);
}
