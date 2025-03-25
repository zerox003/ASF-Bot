# ASF-Bot

### Discord Bot coded in JavaScript to control your ASF instance

#### (and automatically redeem free game promotions and steam points)

Control your ASF instance from within discord.

ASF support server:<br>
[![Discord](https://img.shields.io/discord/267292556709068800.svg?label=Discord&logo=discord&cacheSeconds=3600)](https://discord.gg/hSQgt8j)<br>
SteamDB server:<br>
[![Discord](https://img.shields.io/discord/467730051622764565.svg?logo=discord&label=Discord&cacheSeconds=3600)](https://discord.com/channels/467730051622764565/845984309638463488)<br>

## Usage

To start you have to fill in your `config.json` file.<br>
You need to join the SteamDB server and set the follow of [#free-promotions](https://discord.com/channels/467730051622764565/845984309638463488) to a channel of your server (`input.CHANNEL_ID`).

```
{
    "bot" : {
        "token" : "Bot token",
        "ID" : "Bot ID"
    },
    "security" : {
        "USER_ID": "Your own user id",
        "SERVER_ID": "Your own guild id",
        "IP" : "Here you put your ASF panel IP:PORT",
        "IPC_PASSWORD" : "Here you put your ASF IPC password",
        "SSL_STAT": "http or https"
    },
    "input" : {
        "CHANNEL_ID": "Relay bot channel ID (relayed from SteamDB Discord server <#845984309638463488>)"
    },
    "TZ" : "Put your Timezone here (luxon) eg. Europe/Berlin"
}
```

Execute `node run.js` for the Bot to start.<br>
Once the slash commands are registered and the bot has started and connected to the ASF instance, you can send commands through your discord server.

## Updates
Please refer to the [fork](https://github.com/zerox003/ASF-Bot) for updates.
