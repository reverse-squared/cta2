import Discord from 'discord.js';

import { Scene } from '../shared/types';

import env from '../../env.json';

let bot: Discord.Client;
let votingChannel: Discord.TextChannel;

export function initBot() {
  if(env.bot.token && env.bot.votingChannel) {
    bot = new Discord.Client();
    bot.login(env.bot.token);

    
    bot.on('ready', () => {
      bot.user.setActivity('Adventuring...');
      
      const guild = bot.guilds.get('606244107031150623');

      if(!guild) {
        throw new Error('Guild does not exist.');
      }

      votingChannel = guild.channels.get(env.bot.votingChannel) as Discord.TextChannel;

      // TODO: Remove this test code.
      postScene({
        "passage": "You stumble upon a penny when walking to work.",
        "options": [
          {
            "label": "Pick it up.",
            "to": "pennyPickup"
          },
          {
            "label": "Leave it.",
            "to": "work"
          }
        ],
        "source": [{ "name": "dave", "desc": "Idea" }, "john"]
      });

      // TODO: Make this a fancy.
      console.log('[Bot] Bot ready.');
    });
  }
}

/**
 * Posts an embed to the voting channel for people to vote for it to be added.
 * @param scene The scene to post to the voting channel.
 */
export async function postScene(scene: Scene) {
  const message = await votingChannel.send({ embed: {
    color: 0x64ed98,
    title: 'New Scene',
    description: scene.passage,
    fields: scene.options.map((option) => {
      if(option === 'separator') {
        return option;
      }

      return {
        name: option.label,
        value: `Goes to \`${option.to}\`.`
      }
    }),
    timestamp: new Date()
  } }) as Discord.Message;

  await message.react('👍');
  await message.react('👎');

  const collectedReactions: Discord.Collection<string, Discord.MessageReaction> = await message.awaitReactions((reaction, user) => {
    return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
  }, { time: 10000 });
  // TODO: Change this time to 86400000ms.

  // If we have at least one reaction on either side.
  if(collectedReactions.size > 0) {
    let upvoteReaction = collectedReactions.get('👍');
    let downvoteReaction = collectedReactions.get('👎');
    
    const upvotes = upvoteReaction ? upvoteReaction.count - 1 : 0;
    const downvotes = downvoteReaction ? downvoteReaction.count - 1 : 0;

    // If there are more upvotes than downvotes.
    if(upvotes > downvotes) {
      // TODO:
    }
  }

  // Delete the message.
  message.delete();
}
