import OpenAI from 'openai';
import config from './config.json' with { type: 'json' };

const { openai_api_key, openai_model } = config;

const client = new OpenAI({ apiKey: openai_api_key });

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

export async function getRandomRoast(message) {
    const prompt = constructRoastPrompt(message);

    console.log(`Constructed roast prompt: ${prompt}`);
    const response = await client.chat.completions.create({
        model: openai_model,
        messages: [
            { role: "user", content: prompt }
        ]
    });

    console.log(`OpenAI response: ${response.choices[0].message.content}`);

    return response.choices[0].message.content;
}

export async function getRandomFunFact(url, title = null) {
    const songRef = title ? `"${title}" (${url})` : url;
    const prompt = `Give me a one sentence fact about this song ${songRef}. The fact cannot be readily available information like: title, author, singer, band, album, release date, language, location, cast, movie. It must be a fact that the general public doesn't know and isn't on the surface. Dig deep — check Reddit, fan forums, YouTube comments, behind the scenes details, recording trivia, unexpected connections. If the song includes Nightcore in the title, look up the original song instead. If the song is a parody, find an obscure fact about the parody itself, otherwise reply with 'No fun fact found for this song.'. Only reply with 'No fun fact found for this song.' if you have exhausted all search options and truly cannot find anything interesting. Do not describe what the song is about. Do not make anything up.`;
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

    console.log(`OpenAI response: ${content}`);
    
    if (content.trim() === "No fun fact found for this song.") {
        return "No fun fact found for this song.";
    }

    return content
    .replace(/\s*\(\[.*?\]\(.*?\)\)/g, '')  // removes ([text](url))
    .replace(/\s*\([^)]*\.[^)]*\)/g, '')    // removes plain (source.com) as fallback
    .trim();
}


