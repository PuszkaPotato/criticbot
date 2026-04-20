import { Client, Events, GatewayIntentBits } from 'discord.js';
import { createRequire } from 'module';

import { getRandomFunFact, praiseTheDayInHerName, protectTheEmpress } from './openai.js';
import { getRandomRoast } from './openai.js';
import * as craziness from './craziness.js';
import * as messageTracker from './messageTracker.js';

const require = createRequire(import.meta.url);
const config = require('./config.json');

const empress_id = config.empress_id;

const empressPattern = new RegExp(
    `\\b(Weronika|Wera|Weronica|Weronicka|Veronica|Veronika|Vee|weewee|Wee|Veewee|our empress|the empress)\\b|<@${config.empress_id}>`, 'i'
);

const { bot_token, listen_channel_id, guild_id, victim_id } = config;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMembers] });

if (!bot_token || !listen_channel_id || !guild_id) {
    console.error('Please set the bot_token, listen_cchannel_id, and guild_id in config.json');
    process.exit(1);
}

client.on(Events.ClientReady, () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

client.login(bot_token)

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    console.log(`Received message: ${message.content} from ${message.author.tag} in channel ${message.channel.id}, extra: ${message.embeds[0]?.title || 'no embed title'}, attachments: ${message.attachments.size}`);
    
    if (message.channel.id === listen_channel_id) {
        if (message.author.id === victim_id) {
            const roast = await getRandomRoast(message);
            message.reply(roast);
        } else if (isYoutubeOrSpotifyLink(message.content) && message.embeds.length > 0) {
            const title = message.embeds[0]?.title;
            const funfact = await getRandomFunFact(message.content, title);
            if (funfact === "No fun fact found for this song.") {
                console.log(`No fun fact found for the message: ${message.content}`);
                return;
            }
            message.reply(funfact);
        }
    }

    // Praise the day in her name.
    if (message.author.id === empress_id && messageTracker.isFirstMessageToday()) {
        const response = await praiseTheDayInHerName(message);
        message.reply(response);
        messageTracker.updateEmpressMessageDate();
    }

    // Protect the grace and honour of the Empress Weronika at all costs, even if it means sacrificing your own dignity and sanity.
    if (message.reference && message.reference.messageId) {
        try {
            const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
            if (referencedMessage.author.id === empress_id) {
                const response = await protectTheEmpress(message, craziness.get());
                message.reply(response);
                craziness.increase(1);
            }
        } catch (error) {
            console.error('Error fetching referenced message:', error);
        }
    }

    if (empressPattern.test(message.content) && message.author.id !== empress_id) {
        const response = await protectTheEmpress(message, craziness.get());
        message.reply(response);
        craziness.increase(1);
    }

    // Stand at the ready devout subject!

    if (message.mentions.has(client.user) && message.author.id === empress_id) {
        const response = await standAtTheReadyDevoutSubject(message);
        message.reply(response);
    }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
    if (newMessage.partial) await newMessage.fetch();
    if (oldMessage.partial) await oldMessage.fetch();
    if (newMessage.author?.bot) return;
    if (oldMessage.embeds.length > 0 || newMessage.embeds.length === 0) return;
    if (newMessage.channel.id !== listen_channel_id) return;
    if (!isYoutubeOrSpotifyLink(newMessage.content)) return;

    console.log(`MessageUpdate triggered, embed title: ${newMessage.embeds[0]?.title}`);
    
    const title = newMessage.embeds[0]?.title;
    const funfact = await getRandomFunFact(newMessage.content, title);

    if (funfact === "No fun fact found for this song.") {
        console.log(`No fun fact found for the updated message: ${newMessage.content}`);
        return;
    }

    newMessage.reply(funfact);
});

function isYoutubeOrSpotifyLink(content) {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/;
    const spotifyRegex = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/track\/([^\s&]+)/;
    return youtubeRegex.test(content) || spotifyRegex.test(content);
}