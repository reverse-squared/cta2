import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';

import { Scene, NormalScene, EndingScene } from '../shared/types';

import env from '../shared/env';
import { requestedScenesRoot, contentRoot } from '../shared/roots';
import getFilesRecursively from './utils/getFilesRecursively';
import { createScene } from '../server/scene';

let bot: Discord.Client;
let votingChannel: Discord.TextChannel;
let archiveChannel: Discord.TextChannel;

interface RequestedNormalScene extends NormalScene {
  createdOn: number;
  discordMessageId: string;
}
interface RequestedEndingScene extends EndingScene {
  createdOn: number;
  discordMessageId: string;
}
type RequestedScene = RequestedNormalScene | RequestedEndingScene;

const VOTING_PERIOD = 86400000;

export function initBot() {
  if (env.bot.token && env.bot.votingChannel) {
    bot = new Discord.Client();
    bot.login(env.bot.token);

    bot.on('ready', () => {
      bot.user.setActivity('Adventuring...');

      const guild = bot.guilds.get(env.bot.homeGuild);
      if (!guild) {
        throw new Error('Guild does not exist.');
      }

      votingChannel = guild.channels.get(env.bot.votingChannel) as Discord.TextChannel;
      archiveChannel = guild.channels.get(env.bot.archiveChannel) as Discord.TextChannel;

      // Get all the files inside of requested-scenes.
      getFilesRecursively(requestedScenesRoot, (error: any, res: string[]) => {
        if (error) {
          throw new Error(error);
        }

        async function checkResults(fileName: string, scene: RequestedScene) {
          const message = await votingChannel.fetchMessage(scene.discordMessageId);
          const messageReactions = message.reactions;
          const addOverrideReaction = messageReactions.get('✅');
          const removeOverrideReaction = messageReactions.get('❌');
          const upvoteReactions = messageReactions.get('👍');
          const downvoteReactions = messageReactions.get('👎');

          // This part should only matter when we are booting up.
          if (addOverrideReaction) {
            // FIXME: This does not work because the users collection is empty. Discord.JS issue probably.
            // const addOverridee = addOverrideReaction.users.first().tag;

            createScene(fileName.substring(17).replace('.json', ''), scene);

            const forcedEmbed =
              scene.type === 'scene'
                ? {
                    color: 0x64ed98,
                    title: `New Scene: ${fileName.substring(17).replace('.json', '')}`,
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
                    timestamp: new Date(),
                    footer: {
                      text: 'Force added by: Unknown',
                    },
                  }
                : {
                    color: 0x64ed98,
                    title: `New Ending: ${fileName.substring(17).replace('.json', '')}`,
                    description: scene.passage,
                    // TODO: add the rest
                    timestamp: new Date(),
                    footer: {
                      text: 'Force added by: Unknwon',
                    },
                  };
            archiveChannel.send({ embed: forcedEmbed });

            // Delete the message.
            message.delete();

            // Delete the request file.
            await fs.unlink(path.join(requestedScenesRoot, fileName.substring(17)));

            return;
          } else if (removeOverrideReaction) {
            // FIXME: This does not work because the users collection is empty. Discord.JS issue probably.
            // const removeOverridee = removeOverrideReaction.users.first().tag;

            const forcedEmbed =
              scene.type === 'scene'
                ? {
                    color: 0x64ed98,
                    title: `New Scene: ${fileName.substring(17).replace('.json', '')}`,
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
                    timestamp: new Date(),
                    footer: {
                      text: 'Force removed by: Unknown',
                    },
                  }
                : {
                    color: 0x64ed98,
                    title: `New Ending: ${fileName.substring(17).replace('.json', '')}`,
                    description: scene.passage,
                    // TODO: add the rest
                    timestamp: new Date(),
                    footer: {
                      text: 'Force removed by: Unknown',
                    },
                  };
            archiveChannel.send({ embed: forcedEmbed });

            // Delete the message.
            message.delete();

            // Delete the request file.
            await fs.unlink(path.join(requestedScenesRoot, fileName.substring(17)));

            return;
          }

          const upvotes = upvoteReactions ? upvoteReactions.count - 1 : 0;
          const downvotes = downvoteReactions ? downvoteReactions.count - 1 : 0;

          // Check if not enough votes were casted.
          if (!upvotes && !downvotes) {
            const forcedEmbed =
              scene.type === 'scene'
                ? {
                    color: 0x64ed98,
                    title: `New Scene: ${fileName.substring(17).replace('.json', '')}`,
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
                    timestamp: new Date(),
                    footer: {
                      text: 'Was not added because not enough votes were casted.',
                    },
                  }
                : {
                    color: 0x64ed98,
                    title: `New Ending: ${fileName.substring(17).replace('.json', '')}`,
                    description: scene.passage,
                    // TODO: add the rest
                    timestamp: new Date(),
                    footer: {
                      text: 'Was not added because not enough votes were casted.',
                    },
                  };
            archiveChannel.send({ embed: forcedEmbed });

            // Delete the message.
            message.delete();

            // Delete the request file.
            await fs.unlink(path.join(requestedScenesRoot, fileName.substring(17)));

            return;
          }

          if (upvotes > downvotes) {
            createScene(fileName.substring(17).replace('.json', ''), scene);
          }

          // Delete the message.
          message.delete();

          // Delete the request file.
          await fs.unlink(path.join(requestedScenesRoot, fileName.substring(17)));

          // Send a archived message.
          const embed =
            scene.type === 'scene'
              ? {
                  color: 0x64ed98,
                  title: `New Scene: ${fileName.substring(17).replace('.json', '')}`,
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
                  timestamp: new Date(),
                  footer: {
                    text: `${
                      upvotes > downvotes
                        ? `Added with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                        : `Not added with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                    }`,
                  },
                }
              : {
                  color: 0x64ed98,
                  title: `New Ending: ${fileName.substring(17).replace('.json', '')}`,
                  description: scene.passage,
                  // TODO: add the rest
                  timestamp: new Date(),
                  footer: {
                    text: `${
                      upvotes > downvotes
                        ? `Added with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                        : `Not added with ${(upvotes / (upvotes + downvotes)) * 100}% of the vote.`
                    }`,
                  },
                };
          archiveChannel.send({ embed });
        }

        // Find all the JSON files.
        const filesToCheck = res.filter((file) => file.endsWith('.json'));

        // For each file...
        filesToCheck.forEach(async (file) => {
          const fileContents = await fs.readFile(path.join(process.cwd(), file));
          const scene: RequestedScene = JSON.parse(fileContents.toString());

          // If it is past the time.
          if (scene.createdOn + VOTING_PERIOD <= Date.now()) {
            checkResults(file, scene);
          } else {
            const message = await votingChannel.fetchMessage(scene.discordMessageId);

            // Create a reaction collector for when an admin forces a vote.
            const moderatorVoteCollector = message.createReactionCollector(
              (reaction, user) => {
                const reactingUser = message.guild.members.get(user.id);

                if (!reactingUser) {
                  throw new Error('User reacting does not exist in guild.');
                }

                return (
                  ['✅', '❌'].includes(reaction.emoji.name) &&
                  reactingUser.roles.has('658727143551008779')
                );
              },
              { time: scene.createdOn + VOTING_PERIOD - scene.createdOn }
            );

            moderatorVoteCollector.on('collect', async (reaction) => {
              if (reaction.emoji.name === '✅') {
                createScene(file.substring(17).replace('.json', ''), scene);

                // Delete the request file.
                await fs.unlink(path.join(requestedScenesRoot, file.substring(17)));

                const forcedEmbed =
                  scene.type === 'scene'
                    ? {
                        color: 0x64ed98,
                        title: `New Scene: ${file.substring(17).replace('.json', '')}`,
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
                        timestamp: new Date(),
                        footer: {
                          text: `Force added by: ${reaction.users.first().tag}`,
                        },
                      }
                    : {
                        color: 0x64ed98,
                        title: `New Ending: ${file.substring(17).replace('.json', '')}`,
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
                await fs.unlink(path.join(requestedScenesRoot, file.substring(17)));

                const forcedEmbed =
                  scene.type === 'scene'
                    ? {
                        color: 0x64ed98,
                        title: `New Scene: ${file.substring(17).replace('.json', '')}`,
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
                        timestamp: new Date(),
                        footer: {
                          text: `Force removed by: ${reaction.users.first().tag}`,
                        },
                      }
                    : {
                        color: 0x64ed98,
                        title: `New Ending: ${file.substring(17).replace('.json', '')}`,
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
            });

            // Check resultes when 24 hours is up.
            setTimeout(() => {
              checkResults(file, scene);
            }, scene.createdOn + VOTING_PERIOD - scene.createdOn);
          }
        });
      });

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

  const filePath = name.split('/');
  filePath[filePath.length - 1] += '.json';

  await fs.mkdirs(path.join(requestedScenesRoot, path.dirname(name)));

  // Create a JSON file.
  await fs.writeFile(
    path.join(requestedScenesRoot, ...filePath),
    JSON.stringify({
      ...scene,
      createdOn: new Date().valueOf(),
      discordMessageId: message.id,
    })
  );

  async function createScene(scene: Scene) {
    await fs.mkdirs(path.join(contentRoot, path.dirname(`${name}`)));
    await fs.writeFile(path.join(contentRoot, ...filePath), JSON.stringify(scene));
  }

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
    { time: VOTING_PERIOD }
  );

  let shouldDoFinalCollect = true;

  moderatorVoteCollector.on('collect', async (reaction) => {
    if (reaction.emoji.name === '✅') {
      createScene(scene);

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
      await fs.unlink(path.join(requestedScenesRoot, ...filePath));

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
    { time: VOTING_PERIOD }
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
        createScene(scene);
      }

      // Delete request file.
      await fs.unlink(path.join(requestedScenesRoot, ...filePath));

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
              timestamp: new Date(),
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
    } else {
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
              timestamp: new Date(),
              footer: {
                text: 'Was not added because not enough votes were casted.',
              },
            }
          : {
              color: 0x64ed98,
              title: `New Ending: ${name}`,
              description: scene.passage,
              // TODO: add the rest
              timestamp: new Date(),
              footer: {
                text: 'Was not added because not enough votes were casted.',
              },
            };
      archiveChannel.send({ embed });

      // Delete the request file.
      await fs.unlink(path.join(requestedScenesRoot, ...filePath));
    }

    // Delete the message.
    message.delete();
  }
}
