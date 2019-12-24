import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';

import { Scene } from '../shared/types';

import env from '../shared/env';
import { requestedScenesRoot, contentRoot } from '../shared/roots';
import { createScene } from '../server/scene';

let bot: Discord.Client;
let votingChannel: Discord.TextChannel;
let archiveChannel: Discord.TextChannel;

export function initBot() {
  if (env.bot.token && env.bot.votingChannel) {
    bot = new Discord.Client();
    bot.login(env.bot.token);

    bot.on('ready', () => {
      bot.user.setActivity('Adventuring...');

      const guild = bot.guilds.get('606244107031150623');
      if (!guild) {
        throw new Error('Guild does not exist.');
      }

      votingChannel = guild.channels.get(env.bot.votingChannel) as Discord.TextChannel;
      archiveChannel = guild.channels.get(env.bot.archiveChannel) as Discord.TextChannel;

      postScene('cta_dev_test/lmao', {
        type: 'scene',
        passage: 'You stumble upon a penny when walking to work.',
        options: [
          {
            label: 'Pick it up.',
            to: 'pennyPickup',
          },
          'separator',
          {
            label: 'Leave it.',
            to: 'work',
          },
        ],
        source: [{ name: 'dave', desc: 'Idea' }, 'john'],
      });

      // TODO: Check existing files in requested-scenes in case of a crash.

      // TODO: Make this a fancy.
      console.log('[Bot] Bot ready.');
    });
  }
}

/**
 * Posts an embed to the voting channel for people to vote for it to be added.
 * @param name The scene name. Also the location where the file is saved.
 * @param scene The scene to post to the voting channel.
 */
export async function postScene(name: string, scene: Scene) {
  const timeCreated = new Date();

  const embed =
    scene.type === 'scene'
      ? {
          color: 0x64ed98,
          title: `New Scene: ${name}`,
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
          timestamp: timeCreated,
        }
      : {
          color: 0x64ed98,
          title: `New Ending: ${name}`,
          description: scene.passage,
          // TODO: add the rest
          timestamp: timeCreated,
        };

  const message = (await votingChannel.send({
    embed: embed,
  })) as Discord.Message;

  await message.react('👍');
  await message.react('👎');

  await fs.mkdirs(path.join(requestedScenesRoot, path.dirname(name)));

  // Create a JSON file.
  await fs.writeFile(
    path.join(requestedScenesRoot, name + '.json'),
    JSON.stringify({
      ...scene,
      createdOn: new Date().valueOf(),
      discordMessageId: message.id,
    })
  );

  // Create a reaction collector for when an admin forces a vote.
  const moderatorVoteCollector = message.createReactionCollector(
    (reaction, user) => {
      const reactingUser = message.guild.members.get(user.id);

      if (!reactingUser) {
        throw new Error('User reacting does not exist in guild.');
      }

      return (
        ['✅', '❌'].includes(reaction.emoji.name) && reactingUser.roles.has('658727143551008779')
      );
    },
    { time: 30000 }
  );

  let shouldDoFinalCollect = true;

  moderatorVoteCollector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '✅') {
      createScene(name, scene);

      const forcedEmbed =
        scene.type === 'scene'
          ? {
              color: 0x64ed98,
              title: `New Scene: ${name}`,
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
              timestamp: timeCreated,
              footer: {
                text: `Force added by: ${reaction.users.first().tag}`,
              },
            }
          : {
              color: 0x64ed98,
              title: `New Ending: ${name}`,
              description: scene.passage,
              // TODO: add the rest
              timestamp: new Date(),
              footer: {
                text: `Force added by: ${reaction.users.first().tag}`,
              },
            };
      archiveChannel.send({ embed: forcedEmbed });
    } else if (reaction.emoji.name === '❌') {
      // Delete the request file.
      await fs.unlink(path.join(requestedScenesRoot, name + '.json'));

      const forcedEmbed =
        scene.type === 'scene'
          ? {
              color: 0x64ed98,
              title: `New Scene: ${name}`,
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
              timestamp: timeCreated,
              footer: {
                text: `Force removed by: ${reaction.users.first().tag}`,
              },
            }
          : {
              color: 0x64ed98,
              title: `New Ending: ${name}`,
              description: scene.passage,
              // TODO: add the rest
              timestamp: new Date(),
              footer: {
                text: `Force removed by: ${reaction.users.first().tag}`,
              },
            };
      archiveChannel.send({ embed: forcedEmbed });
    }

    message.delete();
    shouldDoFinalCollect = false;
  });

  // The reactions that were collected after 24 hours.
  const collectedReactions: Discord.Collection<
    string,
    Discord.MessageReaction
  > = await message.awaitReactions(
    (reaction, user) => {
      return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
    },
    { time: 30000 }
  );

  if (shouldDoFinalCollect) {
    // If we have at least one reaction on either side.
    if (collectedReactions.size > 0) {
      let upvoteReaction = collectedReactions.get('👍');
      let downvoteReaction = collectedReactions.get('👎');

      const upvotes = upvoteReaction ? upvoteReaction.count - 1 : 0;
      const downvotes = downvoteReaction ? downvoteReaction.count - 1 : 0;

      // If there are more upvotes than downvotes.
      if (upvotes > downvotes) {
        createScene(name, scene);
      }

      // Delete request file.
      await fs.unlink(path.join(requestedScenesRoot, name + '.json'));

      // Send a archived message.
      const embed =
        scene.type === 'scene'
          ? {
              color: 0x64ed98,
              title: `New Scene: ${name}`,
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
              timestamp: timeCreated,
              footer: {
                text: `${
                  upvotes > downvotes
                    ? `Added with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                    : `Not with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                }`,
              },
            }
          : {
              color: 0x64ed98,
              title: `New Ending: ${name}`,
              description: scene.passage,
              // TODO: add the rest
              timestamp: new Date(),
              footer: {
                text: `${
                  upvotes > downvotes
                    ? `Added with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                    : `Not with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                }`,
              },
            };

      archiveChannel.send({ embed });
    }

    // Delete the message.
    message.delete();
  }
}
