import Discord from 'discord.js';
import fs from 'fs-extra';
import path from 'path';

import { Scene } from '../shared/types';

import env from '../shared/env';
import { requestedScenesRoot, contentRoot } from '../shared/roots';
import { createScene } from '../server/scene';

let bot: Discord.Client;
let votingChannel: Discord.TextChannel;

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
              return option;
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

  const collectedReactions: Discord.Collection<
    string,
    Discord.MessageReaction
  > = await message.awaitReactions(
    (reaction, user) => {
      return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
    },
    { time: 10000 }
  );
  // TODO: Change this time to 86400000ms.

  // If we have at least one reaction on either side.
  if (collectedReactions.size > 0) {
    let upvoteReaction = collectedReactions.get('👍');
    let downvoteReaction = collectedReactions.get('👎');

    const upvotes = upvoteReaction ? upvoteReaction.count - 1 : 0;
    const downvotes = downvoteReaction ? downvoteReaction.count - 1 : 0;

    // If there are more upvotes than downvotes.
    if (upvotes > downvotes) {
      await createScene(name, scene);
    }
    await fs.unlink(path.join(requestedScenesRoot, name + '.json'));
  }

  // Delete the message.
  message.delete();
}
