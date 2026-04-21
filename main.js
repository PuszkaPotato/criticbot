import { Client, Events, GatewayIntentBits } from 'discord.js';
import { createRequire } from 'module';

import { getRandomFunFact, getRandomRoast, praiseTheDayInHerName, protectTheEmpress, standAtTheReadyDevoutSubject } from './openai.js';
import * as craziness from './craziness.js';
import * as messageTracker from './messageTracker.js';
import { logger } from './logger.js';

const require = createRequire(import.meta.url);
const config = require('./config.json');

const empress_id = config.empress_id;

const empressPattern = new RegExp(
    `\\b(Weronika|Wera|Weronica|Weronicka|Veronica|Veronika|Vee|weewee|Wee|Veewee|our empress|the empress)\\b|<@${config.empress_id}>`, 'i'
);

const { bot_token, listen_channel_id, guild_id, victim_id } = config;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers] });

if (!bot_token || !listen_channel_id || !guild_id) {
    logger.error('init', 'Missing required config: bot_token, listen_channel_id, or guild_id');;
    process.exit(1);
}

process.on('unhandledRejection', (reason) => {
    logger.error('process', `Unhandled promise rejection: ${reason?.stack ?? reason}`);
});

process.on('uncaughtException', (error) => {
    logger.error('process', `Uncaught exception: ${error.message}\n${error.stack}`);
});

client.on(Events.ClientReady, () => {
    logger.info('client', `Ready! Logged in as ${client.user.tag}`);
});

client.login(bot_token);

client.on(Events.MessageCreate, async (message) => {
    try {
        if (message.author.bot) return;
        logger.info('MessageCreate', `From ${message.author.tag} in #${message.channel.id}: "${message.content}" | embeds: ${message.embeds[0]?.title || 'none'} | attachments: ${message.attachments.size}`);

        if (message.channel.id === listen_channel_id) {
            if (message.author.id === victim_id) {
                logger.info('MessageCreate', `Victim detected, roasting ${message.author.tag}`);
                const roast = await getRandomRoast(message);
                if (!roast?.trim()) {
                    logger.warn('MessageCreate', 'Roast came back empty, skipping reply');
                } else {
                    message.reply(roast);
                }
            } else if (isYoutubeOrSpotifyLink(message.content) && message.embeds.length > 0) {
                const title = message.embeds[0]?.title;
                logger.info('MessageCreate', `Music link detected, fetching fun fact for: ${title || message.content}`);
                const funfact = await getRandomFunFact(message.content, title);
                if (!funfact?.trim() || funfact === "No fun fact found for this song.") {
                    logger.info('MessageCreate', `No fun fact found for: ${message.content}`);
                } else {
                    message.reply(funfact);
                }
            }
        }

        // Praise the day in her name.
        if (message.author.id === empress_id && messageTracker.isFirstMessageToday()) {
            logger.info('MessageCreate', `First empress message today, praising the day`);
            const response = await praiseTheDayInHerName(message);
            if (!response?.trim()) {
                logger.warn('MessageCreate', 'Praise response came back empty, skipping reply');
            } else {
                message.reply(response);
            }
            messageTracker.updateEmpressMessageDate();
        }

        // Protect the grace and honour of the Empress Weronika at all costs, even if it means sacrificing your own dignity and sanity.
        if (message.reference && message.reference.messageId) {
            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                if (referencedMessage.author.id === empress_id) {
                    logger.info('MessageCreate', `Reply to empress detected from ${message.author.tag}, protecting`);
                    const response = await protectTheEmpress(message, craziness.get());
                    if (!response?.trim()) {
                        logger.warn('MessageCreate', 'Protect response came back empty, skipping reply');
                    } else {
                        message.reply(response);
                    }
                    craziness.increase(1);
                }
            } catch (error) {
                logger.error('MessageCreate', `Error fetching referenced message: ${error.message}`);
            }
        }

        if (empressPattern.test(message.content) && message.author.id !== empress_id) {
            logger.info('MessageCreate', `Empress mentioned by ${message.author.tag}, protecting`);
            const response = await protectTheEmpress(message, craziness.get());
            if (!response?.trim()) {
                logger.warn('MessageCreate', 'Protect response came back empty, skipping reply');
            } else {
                message.reply(response);
            }
            craziness.increase(1);
        }

        // Stand at the ready devout subject!
        if (message.mentions.has(client.user) && message.author.id === empress_id) {
            logger.info('MessageCreate', `Bot mentioned by empress, standing at the ready`);
            const response = await standAtTheReadyDevoutSubject(message);
            if (!response?.trim()) {
                logger.warn('MessageCreate', 'StandAtTheReady response came back empty, skipping reply');
            } else {
                message.reply(response);
            }
        }
    } catch (error) {
        logger.error('MessageCreate', `Unhandled error in handler: ${error.message}\n${error.stack}`);
    }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    try {
        if (newMessage.partial) await newMessage.fetch();
        if (oldMessage.partial) await oldMessage.fetch();
        if (newMessage.author?.bot) return;
        if (oldMessage.embeds.length > 0 || newMessage.embeds.length === 0) return;
        if (newMessage.channel.id !== listen_channel_id) return;
        if (!isYoutubeOrSpotifyLink(newMessage.content)) return;

        const title = newMessage.embeds[0]?.title;
        logger.info('MessageUpdate', `New embed detected, fetching fun fact for: ${title || newMessage.content}`);
        const funfact = await getRandomFunFact(newMessage.content, title);

        if (!funfact?.trim() || funfact === "No fun fact found for this song.") {
            logger.info('MessageUpdate', `No fun fact found for updated message: ${newMessage.content}`);
            return;
        }

        newMessage.reply(funfact);
    } catch (error) {
        logger.error('MessageUpdate', `Unhandled error in handler: ${error.message}\n${error.stack}`);
    }
});

function isYoutubeOrSpotifyLink(content) {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/;
    const spotifyRegex = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/track\/([^\s&]+)/;
    return youtubeRegex.test(content) || spotifyRegex.test(content);
}
