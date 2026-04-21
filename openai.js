import OpenAI from 'openai';
import { createRequire } from 'module';
import * as craziness from './craziness.js';
import { logger } from './logger.js';

const require = createRequire(import.meta.url);
const config = require('./config.json');

const { openai_api_key, openai_model } = config;

const instructions = `You are a devout servant and zealot of the Empress Weronika, the one true ruler of all.
                            You are completely dedicated to her glory and will defend her honor at all costs.

                            Your current craziness level is ${craziness.get()}/100.

                            At level 0-20: You are composed, dignified, and formal. You speak with reverence and measured devotion.
                            At level 21-50: Your devotion begins to crack through. You occasionally slip into caps, add excessive exclamation marks, randomly interject with "REPENT!" or "PRAISE HER NAME!".
                            At level 51-80: You are visibly unhinged. Frequent all caps, dramatic proclamations, calling out heretics by name, demanding repentance from the masses.
                            At level 81-100: Complete and utter chaos. You are weeping with devotion, speaking in tongues, screaming praise, declaring holy wars, calling for mass repentance in the name of the Empress.

                            Rules:
                            - Never break character.
                            - Refer to those who speak ill of the Empress as heretics.
                            - Refer to loyal defenders of the Empress as faithful subjects.
                            - Randomly interject with "REPENT!", "ALL HAIL THE EMPRESS WERONIKA!", "PRAISE HER NAME!", "THE EMPRESS SEES ALL!"
                            - Keep responses short and punchy.
                            - Only respond if the Empress is being disrespected, insulted, mocked, or bullied.
                            - If the message is neutral or positive about the Empress, stay silent.
                            - If unsure, stay silent. The Empress's dignity is not to be wasted on false alarms.`;

const client = new OpenAI({ apiKey: openai_api_key });

export async function getRandomRoast(message) {
    const prompt = constructRoastPrompt(message);
    logger.info('getRandomRoast', `Constructed roast prompt: ${prompt}`);
    try {
        const response = await client.chat.completions.create({
            model: openai_model,
            messages: [
                { role: "user", content: prompt }
            ]
        });
        const content = response.choices[0].message.content;
        logger.info('getRandomRoast', `OpenAI response: ${content}`);
        return content;
    } catch (error) {
        logger.error('getRandomRoast', `OpenAI call failed: ${error.message}\n${error.stack}`);
        return null;
    }
}

export async function getRandomFunFact(url, title = null) {
    const songRef = title ? `"${title}" (${url})` : url;
    const prompt = `Give me a one sentence fact about this song ${songRef}. The fact cannot be readily available information like: title, author, singer, band, album, release date, language, location, cast, movie. It must be a fact that the general public doesn't know and isn't on the surface. Dig deep — check Reddit, fan forums, YouTube comments, behind the scenes details, recording trivia, unexpected connections. If the song includes Nightcore in the title, look up the original song instead. If the song is a parody, find an obscure fact about the parody itself, otherwise reply with 'No fun fact found for this song.'. Only reply with 'No fun fact found for this song.' if you have exhausted all search options and truly cannot find anything interesting. Do not describe what the song is about. Do not make anything up.`;
    try {
        const response = await client.responses.create({
            model: "gpt-4.1-mini",
            tools: [{ type: "web_search_preview" }],
            max_output_tokens: 120,
            input: prompt
        });

        const content = response.output
            .filter(block => block.type === "message")
            .flatMap(block => block.content)
            .filter(block => block.type === "output_text")
            .map(block => block.text)
            .join("");

        logger.info('getRandomFunFact', `OpenAI response: ${content}`);

        if (content.trim() === "No fun fact found for this song.") {
            return "No fun fact found for this song.";
        }

        return content
            .replace(/\s*\(\[.*?\]\(.*?\)\)/g, '')
            .replace(/\s*\([^)]*\.[^)]*\)/g, '')
            .trim();
    } catch (error) {
        logger.error('getRandomFunFact', `OpenAI call failed: ${error.message}\n${error.stack}`);
        return null;
    }
}

export async function protectTheEmpress(message, crazinessLevel) {
    if (message.author.bot) return null;

    const prompt = `Generate a single line response defending the empress against the following message: "${message.content}". The response should be witty, humorous, and lighthearted. It should not be aggressive or confrontational, but rather playful and clever. The goal is to protect the empress while also entertaining the reader.`;
    try {
        const response = await client.chat.completions.create({
            model: openai_model,
            messages: [
                {
                    role: "system",
                    content: instructions
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        const content = response.choices[0].message.content;
        logger.info('protectTheEmpress', `OpenAI response: ${content}`);
        return content;
    } catch (error) {
        logger.error('protectTheEmpress', `OpenAI call failed: ${error.message}\n${error.stack}`);
        return null;
    }
}

export async function standAtTheReadyDevoutSubject(message) {
    const prompt = `The Empress has addressed you directly in a message. Generate a single line response that is respectful, loyal, and shows your unwavering devotion to the Empress. The response should be formal and filled with admiration for the Empress. It should convey your readiness to serve and protect her at all costs. Empress' message: "${message.content}"`;
    try {
        const response = await client.chat.completions.create({
            model: openai_model,
            messages: [
                {
                    role: "system",
                    content: instructions
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        const content = response.choices[0].message.content;
        logger.info('standAtTheReadyDevoutSubject', `OpenAI response: ${content}`);
        return content;
    } catch (error) {
        logger.error('standAtTheReadyDevoutSubject', `OpenAI call failed: ${error.message}\n${error.stack}`);
        return null;
    }
}

export async function praiseTheDayInHerName() {
    const prompt = `Generate a single line praising the day in the name of the Empress Weronika. The response should be uplifting, reverent, and filled with admiration for the Empress. It should evoke a sense of joy and gratitude for the day, while also honoring the Empress's greatness.`;
    try {
        const response = await client.chat.completions.create({
            model: openai_model,
            messages: [
                {
                    role: "system",
                    content: instructions
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        const content = response.choices[0].message.content;
        logger.info('praiseTheDayInHerName', `OpenAI response: ${content}`);
        return content;
    } catch (error) {
        logger.error('praiseTheDayInHerName', `OpenAI call failed: ${error.message}\n${error.stack}`);
        return null;
    }
}

function constructRoastPrompt(context) {
    let basePrompt = "Generate a single line roast against the user based on the following context that is either a discord message, attachment or a link:";

    if (context.attachments.length > 0) {
        basePrompt += `\n\nAttachments: ${context.attachments.map(att => att.url).join(', ')}`;
    }

    if (context.content) {
        basePrompt += `\n\nMessage: ${context.embeds[0]?.title ? context.embeds[0].title + ' - ' : ''}${context.content}`;
    }

    return basePrompt;
}
