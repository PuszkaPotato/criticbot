# Critic Bot

What is critic bot? Well, it's a project of sweat, tears, blood, few minutes of coding and many more minutes of crafting prompt for unruly chatgpt.

Basically the bot gives fun facts about the songs posted in a channel, possibly other videos too, I never restricted it to check if it's a song. But it also roasts the victim of your choosing!

## How to use

### Prerequisites
- Node.js v18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))
- An OpenAI API key ([OpenAI Platform](https://platform.openai.com/api-keys))

### Setup
1. Clone the repository
2. Run `npm install`
3. Create a `config.json` file in the root directory from `config.json.example`:
```json
{
    "bot_token": "your_discord_bot_token",
    "listen_channel_id": "channel_id_to_watch",
    "guild_id": "your_server_id",
    "victim_id": "user_id_to_roast",
    "openai_api_key": "your_openai_api_key",
    "openai_model": "gpt-4.1-mini"
}
```
4. Run the bot with `node main.js`

### Discord Bot Setup
In the [Discord Developer Portal](https://discord.com/developers/applications), make sure your bot has the following **Privileged Gateway Intents** enabled:
- Message Content Intent
- Server Members Intent

### What it does
- Listens to a specified channel for YouTube or Spotify links
- Replies with an obscure fun fact about the song using OpenAI with web search
- Roasts a specified victim user for every message they send in the channel

### Notes
- `config.json` is gitignored and should never be committed — keep your tokens safe
- Fun facts are powered by OpenAI's web search, so quality may vary (blame GPT, not me)
- The victim has no say in this