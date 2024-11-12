const Discord = require("discord.js");
const config = require("./configs/config.json");
const { DateTime } = require("luxon");
const fetch = require("node-fetch");
const client = new Discord.Client({ intents: 34815 });

// TODO: status CardsFarmer

const re1 = /(addlicense|redeempoints)\sasf\s(?:s\/|)((?:\d+[,\s]*)+)/gi;

const apiBot = ["pause", "resume", "start", "stop", "addlicense", "redeempoints"];
const apiASF = ["exit", "restart", "update"];
const BotVersion = "v2.1.1";

const ASF_ICON = "https://raw.githubusercontent.com/JustArchiNET/ArchiSteamFarm/refs/heads/main/resources/ASF_184x184.png";

const translations = {
  PurchaseResultDetail: {},
  Result: {},
  Currency: {}
}

const schemaMapping = {
  "SteamKit2.EPurchaseResultDetail": "PurchaseResultDetail",
  "SteamKit2.EResult": "Result",
  "SteamKit2.ECurrencyCode": "Currency"
};

const rpcStat = {
  pinging: "ASF | pinging...",
  booting: "ASF | booting...",
  online: "ASF | online",
  offline: "ASF | offline"
}

const colorCrit = "#F04747"
const colorWarn = "#F09C48"
const colorBase = "#48F0F0"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

client.once("ready", (c) => {
  basicCLog(`[${c.user.username}] I am Booting...!`);
  heartbeat();
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.user.id != config.security.USER_ID) return;
  if (!interaction.isChatInputCommand()) return;

  try {
    await interaction.reply(basicEmbed("Fetching data...", colorWarn));
    await onlineCheck();
    let response;
    let body = {};

    if (apiBot.includes(interaction.commandName)) {
      let IDs;
      let time;
      let bots = await fetchBots();

      if (bots != null) {
        let botname = interaction.options.getString("botname");

        if (!botname) {
          basicCLog(`- - - - - - - - - - -\n> ${interaction.user.tag} executed ${interaction.commandName}`);

          if (interaction.commandName === "pause") {
            body = {
              "Permanent": true,
              "ResumeInSeconds": 0
            };

            if ((time = Math.abs(interaction.options.getInteger("time"))) != 0) {
              body.Permanent = false;
              body.ResumeInSeconds = time;
              response = await responseBodyP(body);
              basicCLog(response.message);
              return await interaction.editReply(basicEmbed(response.message, response.color));
            }

            else {
              response = await responseBodyP(body);
              basicCLog(response.message);
              return await interaction.editReply(basicEmbed(response.message, response.color));
            };
          }

          else if (interaction.commandName === "addlicense") {

            body = {
              Apps: interaction.options.getString("license_ids").split(/[,\s]+/),
              Packages: interaction.options.getString("license_ids").split(/[,\s]+/),
            };

            response = await responseBodyAL(body)
            basicCLog(response);
            return await interaction.editReply(basicEmbed(response, colorBase));
          }

          else if (interaction.commandName === "redeempoints") {
            IDs = interaction.options.getString("item_ids").split(/[,\s]+/);
            response = await responseBodyRP(IDs);
            basicCLog(response);
            return await interaction.editReply(basicEmbed(response, colorBase));
          }

          else {
            response = await sendIPC(interaction.commandName);
            basicCLog(response.message);
            return await interaction.editReply(basicEmbed(response.message, response.color));
          };
        }

        else if (bots.includes(botname)) {
          basicCLog(`- - - - - - - - - - -\n> ${interaction.user.tag} executed ${interaction.commandName} for <${botname}>`)

          if (interaction.commandName === "pause") {
            body = {
              "Permanent": true,
              "ResumeInSeconds": 0
            }

            if ((time = Math.abs(interaction.options.getInteger("time"))) != 0) {
              body.Permanent = false;
              body.ResumeInSeconds = time;
              response = await responseBodyP(body, botname);
              basicCLog(response.message);
              return await interaction.editReply(basicEmbed(response.message, response.color));
            }

            else {
              response = await responseBodyP(body, botname);
              basicCLog(response.message);
              return await interaction.editReply(basicEmbed(response.message, response.color));
            };
          }

          else if (interaction.commandName === "addlicense") {

            body = {
              Apps: interaction.options.getString("license_ids").split(/[,\s]+/),
              Packages: interaction.options.getString("license_ids").split(/[,\s]+/),
            };

            response = await responseBodyAL(body, botname)
            basicCLog(response);
            return await interaction.editReply(basicEmbed(response, colorBase));
          }

          else if (interaction.commandName === "redeempoints") {

            IDs = interaction.options.getString("item_ids").split(/[,\s]+/);

            response = await responseBodyRP(IDs, botname);
            basicCLog(response);
            return await interaction.editReply(basicEmbed(response, colorBase));
          }

          else {
            response = await sendIPC(interaction.commandName, botname);
            basicCLog(response.message);
            return await interaction.editReply(basicEmbed(response.message, response.color));
          };
        };
      }

      else {
        basicCLog("Add Bots in ASF first!");
        return interaction.editReply(basicEmbed("Add Bots in ASF first!", colorCrit));
      };
    }

    else if (apiASF.includes(interaction.commandName)) {

      basicCLog(`- - - - - - - - - - -\n> ${interaction.user.tag} executed ${interaction.commandName}`)

      if (interaction.commandName === "update") {
        body = {
          "Channel": null,
          "Forced": false
        };

        response = await responseBodyUp(body)
        basicCLog(response.message)
        return await interaction.editReply(basicEmbed(response.message, response.color))
      }

      else {
        response = await sendIPC(interaction.commandName);
        basicCLog(response.message);
        return await interaction.editReply(basicEmbed(response.message, response.color));
      };
    }

    else {

      switch (interaction.commandName) {

        case "status":
          basicCLog(`- - - - - - - - - - -\n> ${interaction.user.tag} executed ${interaction.commandName}`)
          let botname = interaction.options.getString("botname");
          response = await responseBodyStat(botname);
          await interaction.editReply(response);
          break;

        case "ping":
          const startTimestamp = Date.now();
          const latency = Date.now() - startTimestamp;
          await interaction.editReply(basicEmbed(`Pong! The bots latency is ${latency}ms.`, colorBase));
          break;

        case "botversion":
          await interaction.editReply(basicEmbed(BotVersion, colorBase));
          break;
      };
    };
  }

  catch (error) {
    console.error('Error handling command:', error);
    return await interaction.editReply(basicEmbed("An error occurred while processing your command", colorCrit));
  };
});

client.on("messageCreate", async (message) => {
  if (message.channel.id != config.input.CHANNEL_ID) return;

  for (let i = 0; i < message.embeds.length; i++) {
    if (message.embeds[i].description === undefined) return;
    const cmdd = re1.exec(message.embeds[i].description);

    if (cmdd != null) {

      if (cmdd[1].toLowerCase() === "addlicense") {
        let command = {
          Apps: cmdd[2].split(/[,\s]+/),
          Packages: cmdd[2].split(/[,\s]+/),
        };

        const responseMessage = await responseBodyAL(command);

        message.channel.send(basicEmbed(responseMessage, colorBase));
      }

      else {
        let IDs = cmdd[2].split(/[,\s]+/);

        const responseMessage = await responseBodyRP(IDs);

        message.channel.send(basicEmbed(responseMessage, colorBase));
      };
    };
  };
});

async function sendIPC(cmd, bot) {
  try {

    await onlineCheck();
    let response;

    if (apiBot.includes(cmd)) {

      if (!bot) {
        response = await fetch(
          `https://${config.security.IP}/Api/Bot/ASF/${cmd.charAt(0).toUpperCase() + cmd.slice(1)}`,
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authentication: config.security.IPC_PASSWORD,
            },
          }
        );
      }

      else {
        response = await fetch(
          `https://${config.security.IP}/Api/Bot/${bot}/${cmd.charAt(0).toUpperCase() + cmd.slice(1)}`,
          {
            method: "post",
            headers: {
              "Content-Type": "application/json",
              Authentication: config.security.IPC_PASSWORD,
            },
          }
        );
      };
    }

    else if (apiASF.includes(cmd)) {
      response = await fetch(
        `https://${config.security.IP}/Api/ASF/${cmd.charAt(0).toUpperCase() + cmd.slice(1)}`,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authentication: config.security.IPC_PASSWORD,
          },
        }
      );
    };

    let body = await response.json();

    if (body.Success) {
      return {
        message: body.Message,
        color: colorBase
      };
    }

    else if (!body.Success) {
      return {
        message: body.Message,
        color: colorWarn
      };
    }

    else {
      console.log("func Error:", body.title);
      console.log("func Status:", body.status);

      if (Array.isArray(body.errors)) {
        console.log("Validation Errors:");
        body.errors.forEach((error, index) => {
          console.log(`Error ${index + 1}:`, error.message);
          console.log("Field:", error.field);
          console.log("Details:", error.details);
        });
      }

      else {
        console.log("Unknown validation error occurred");
      };

      console.log("Trace ID:", body.traceId);
    };
  }

  catch (error) {
    console.error("Fetch error:", error);
  };
};


async function heartbeat() {

  client.user.setActivity(rpcStat.pinging, {
    type: Discord.ActivityType.WATCHING,
  });

  client.user.setStatus('idle');

  setInterval(async () => {
    try {
      let response = await fetch(
        `https://${config.security.IP}/HealthCheck`,
        {
          method: "get",
        }
      );

      if (response.status == 200 && client.user.presence.activities[0].name != rpcStat.online) {
        basicCLog(`ASF is online`);
        client.user.setActivity(rpcStat.online, {
          type: Discord.ActivityType.WATCHING,
        });
        client.user.setStatus("online");

        if (Object.keys(translations.PurchaseResultDetail).length === 0) {
          fetchTranslations().then(() => {
            basicCLog(`Translations loaded`);
            basicCLog(`[${client.user.username}] Ready!`);
          });
        };
      }

      else if (response.status == 502 && client.user.presence.activities[0].name != rpcStat.booting) {
        basicCLog(`ASF is starting`);
        client.user.setActivity(rpcStat.booting, {
          type: Discord.ActivityType.WATCHING,
        });
        client.user.setStatus("idle");
      }

      else {
        basicCLog(response);
      };
    }

    catch (error) {

      if (error.code == "ETIMEDOUT" && client.user.presence.activities[0].name != rpcStat.offline) {
        basicCLog(`ASF is offline`);
        client.user.setActivity(rpcStat.offline, {
          type: Discord.ActivityType.WATCHING,
        });
        client.user.setStatus("dnd");
      }

      else if (error.code == "ECONNREFUSED" && client.user.presence.activities[0].name != rpcStat.booting) {
        basicCLog(`ASF is starting`);
        client.user.setActivity(rpcStat.booting, {
          type: Discord.ActivityType.WATCHING,
        });
        client.user.setStatus("idle");
      }

      else {
        console.error("Fetch error:", error);
      };
    };
  }, 10000);
};

async function onlineCheck() {
  const currentActivity = client.user.presence.activities?.[0]?.name;

  if (currentActivity === rpcStat.pinging) {
    basicCLog(`Bot is currently pinging...`);

    await new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const updatedActivity = client.user.presence.activities?.[0]?.name;

        if (updatedActivity === rpcStat.online) {
          basicCLog(`ASF is online.`);
          clearInterval(checkInterval);
          resolve();
        }

        else if (updatedActivity === rpcStat.booting) {
          clearInterval(checkInterval);
          resolve();
          basicCLog(`ASF is starting. Waiting for it to become online...`);

          await new Promise((resolve) => {
            const checkInterval2 = setInterval(async () => {
              const updatedActivity = client.user.presence.activities?.[0]?.name;

              if (updatedActivity === rpcStat.online) {
                basicCLog(`ASF is now online.`);
                clearInterval(checkInterval2);
                resolve();
              }

              else if (updatedActivity === rpcStat.offline) {
                basicCLog(`ASF is Offline`);
                clearInterval(checkInterval2);
                resolve();

                return {
                  message: "ASF is Offline",
                  color: colorCrit
                };
              };
            }, 1000);
          });
        }

        else if (updatedActivity === rpcStat.offline) {
          basicCLog(`ASF is Offline`);
          clearInterval(checkInterval);
          resolve();

          return {
            message: "ASF is Offline",
            color: colorCrit
          };
        };
      }, 1000);
    });
  };
};

async function fetchBots() {
  try {

    const response = await fetch(
      `https://${config.security.IP}/Api/Bot/ASF`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authentication: config.security.IPC_PASSWORD,
        },
      }
    );
    const body = await response.json();

    if (body.Success) {
      return Object.keys(body.Result);
    };
    throw new Error("Failed to fetch bot names");
  }

  catch (error) {
    console.error("Fetch error:", error);
    return [];
  };
};

async function fetchTranslations() {
  try {

    const response = await fetch(
      `https:${config.security.IP}/swagger/ASF/swagger.json`
    );

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    for (const [schemaName, translationKey] of Object.entries(schemaMapping)) {
      const schema = data.components.schemas[schemaName];

      if (schema && schema["x-definition"]) {
        const xDefinition = schema["x-definition"];

        for (const [code, translation] of Object.entries(xDefinition)) {
          translations[translationKey][code] = translation;
        };
      } 
      
      else {
        console.error(`Expected structure not found in the JSON response for ${schemaName}`);
      }
    };
  }
  
  catch (error) {
    console.error("Error fetching translations:", error);
  };
};

async function getTranslation(schema, code) {

  if (translations[schema]) {

    if (Object.keys(translations[schema]).length === 0) {
      return `Translations are still loading...`;
    }

    return Object.keys(translations[schema]).find(key => translations[schema][key] === code) || "Translation not found";
  } 
  
  else {
    console.error(`Schema "${schema}" not found.`);
    return "Schema not found";
  };
};

function basicEmbed(description, color) {
  let embed = new Discord.EmbedBuilder()
    .setColor(color)
    .setAuthor({
      name: "ASF Rcon Commands",
      iconURL: ASF_ICON
    })
    .setDescription(description)
    .setTimestamp(Date.now())
    .setFooter({
      text: `ASF-Bot ${BotVersion}`,
      iconURL: `https://cdn.discordapp.com/avatars/${config.bot.ID}/${client.user.avatar}.webp?size=512`,
    });
  return { embeds: [embed] };
};

function basicCLog(message) {

  if (message.includes('\n')) {
    let lines = message.split('\n');
    lines.forEach(line => {
      console.log(`${getTime()} | ` + line);
    });
  } 
  
  else {
    console.log(`${getTime()} | ` + message);
  };
};

async function responseBodyStat(bot) {
  let link

  if (bot) {
    link = `https://${config.security.IP}/Api/Bot/${bot}`
  } else {
    link = `https://${config.security.IP}/Api/ASF`
  };

  try {
    const res = await fetch(
      link,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authentication: config.security.IPC_PASSWORD,
        }
      }
    );

    const body = await res.json();

    if (body.Success) {

      if (bot) {
        let embed = new Discord.EmbedBuilder()
          .setColor(colorBase)
          .setAuthor({
            name: `${body.Result[bot].BotName}'s aka "${body.Result[bot].Nickname}" status`,
            iconURL: `https://avatars.cloudflare.steamstatic.com/${body.Result[bot].AvatarHash}.jpg`,
            url: `https://steamcommunity.com/profiles/${body.Result[bot].s_SteamID}/`
          })
          .setDescription((`**Steam ID:** [${body.Result[bot].s_SteamID}](https://steamid.xyz/${body.Result[bot].s_SteamID})\n**Wallet:** ${body.Result[bot].WalletBalance} ${await getTranslation("Currency", body.Result[bot].WalletCurrency)}`))
          .setTimestamp(Date.now())
          .setFooter({
            text: `ASF-Bot ${BotVersion}`,
            iconURL: `https://cdn.discordapp.com/avatars/${config.bot.ID}/${client.user.avatar}.webp?size=512`,
          });
        return { embeds: [embed] };
      } 
      
      else {

        let uptimeMillis = Date.now() - new Date(body.Result.ProcessStartTime).getTime();

        let days = Math.floor(uptimeMillis / (1000 * 60 * 60 * 24));
        let hours = Math.floor((uptimeMillis % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((uptimeMillis % (1000 * 60 * 60)) / (1000 * 60));

        let embed = new Discord.EmbedBuilder()
          .setColor(colorBase)
          .setAuthor({
            name: "ASF status",
            iconURL: ASF_ICON,
            url: `https://${config.security.IP}/`
          })
          .setDescription((`**Version**: ${body.Result.Version}\n**Uptime**: ${days}d:${hours}h:${minutes}m (<t:${Math.floor(new Date(body.Result.ProcessStartTime).getTime() / 1000)}:R>)\n**Memory Usage**: ${(body.Result.MemoryUsage / 1024).toFixed(2)} MB`))
          .setTimestamp(Date.now())
          .setFooter({
            text: `ASF-Bot ${BotVersion}`,
            iconURL: `https://cdn.discordapp.com/avatars/${config.bot.ID}/${client.user.avatar}.webp?size=512`,
          });
        return { embeds: [embed] };
      };
    };
  } 
  
  catch (error) {
    console.error("Status fetch error:", error);
  };
};

async function responseBodyUp(data) {
  let response

  try {
    const res = await fetch(
      `https://${config.security.IP}/Api/ASF/Update`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authentication: config.security.IPC_PASSWORD,
        }
      }
    );

    const body = await res.json();

    if (body.Success) {
      response = body.Message

      return {
        message: response,
        color: colorBase
      };
    } 
    
    else if (!body.Success) {
      response = body.Message

      return {
        message: response,
        color: colorWarn
      };
    };
  } 
  
  catch (error) {
    console.error("Update fetch error:", error);
  };
};

async function responseBodyP(data, bot) {
  let response = ""
  let resumeTimeFormat = ""
  let link

  if (bot) {
    response = `<${bot}> `
    link = `https://${config.security.IP}/Api/Bot/${bot}/Pause`
  } else {
    link = `https://${config.security.IP}/Api/Bot/ASF/Pause`
  };

  try {
    const res = await fetch(
      link,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authentication: config.security.IPC_PASSWORD,
        }
      }
    );

    const body = await res.json();

    if (data.ResumeInSeconds != 0) {
      let resumeTime = Math.floor(Date.now() / 1000) + data.ResumeInSeconds
      resumeTimeFormat = ` Resuming <t:${resumeTime}:R>`
    };

    if (body.Success) {
      response = response + body.Message + resumeTimeFormat

      return {
        message: response,
        color: colorBase
      };
    } 
    
    else if (!body.Success) {
      response = response + body.Message
      
      return {
        message: response,
        color: colorWarn
      };
    };
  } 
  
  catch (error) {
    console.error("Pause fetch error:", error);
  };
};

async function responseBodyAL(data, bot) {
  let response
  let link

  if (bot) {
    link = `https://${config.security.IP}/Api/Bot/${bot}/AddLicense`
  } else {
    link = `https://${config.security.IP}/Api/Bot/ASF/AddLicense`
  }

  try {
    const res = await fetch(
      link,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authentication: config.security.IPC_PASSWORD,
        }
      }
    );

    const body = await res.json();

    if (body.Success) {
      response = body.Result
    };
  } 
  
  catch (error) {
    console.error("Addlicence fetch error:", error);
  }

  let output = "";

  for (let botName of Object.keys(response)) {
    let apps = response[botName].Apps;
    let packages = response[botName].Packages;

    for (let id of Object.keys(apps)) {
      let appDetail = apps[id];
      let packageDetail = packages[id];

      output += `<${botName}> Apps ID: ${id} | Status: ${await getTranslation("Result", appDetail.Result)} | Status Detail: ${await getTranslation("PurchaseResultDetail", appDetail.PurchaseResultDetail)}\n`;

      output += `<${botName}> Packages ID: ${id} | Status: ${await getTranslation("Result", packageDetail.Result)} | Status Detail: ${await getTranslation("PurchaseResultDetail", packageDetail.PurchaseResultDetail)}\n`;

      output += "\n";
    };

    output += "\n";
  };

  return output.trim();
};

async function responseBodyRP(IDs, bot) {
  let results = [];
  let link

  if (bot) {
    link = `https://${config.security.IP}/Api/Bot/${bot}/RedeemPoints/`
  } else {
    link = `https://${config.security.IP}/Api/Bot/ASF/RedeemPoints/`
  };

  try {
    for (const id of IDs) {
      try {
        const res = await fetch(
          link + id,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authentication: config.security.IPC_PASSWORD,
            },
          }
        );

        const body = await res.json();

        if (body && body.Result) {
          results.push({
            id,
            message: body.Message,
            result: body.Result,
          });
        };
      } 
      
      catch (error) {
        console.error(`Redeem Points error with ID ${id}:`, error);
        results.push({
          id,
          message: `Error: ${error.message}`,
          result: null,
        });
      };
    };

    let output = "";
    let botGroups = {};

    for (const { id, message, result } of results) {
      if (result) {
        for (const [botName, statusDetail] of Object.entries(result)) {
          if (!botGroups[botName]) {
            botGroups[botName] = [];
          }

          botGroups[botName].push({
            id,
            status: message,
            statusDetail: await getTranslation("Result", statusDetail),
          });
        };
      };
    };

    for (const [botName, entries] of Object.entries(botGroups)) {
      entries.forEach(({ id, status, statusDetail }) => {
        output += `<${botName}> ID: ${id} | Status: ${status} | Status Detail: ${statusDetail}\n`;
      });
      output += "\n";
    };

    return output.trim();

  } 
  
  catch (error) {
    console.error("Redeem Points fetch error:", error);
  };
};

function getTime(ms) {
  const now = DateTime.local().setZone(config.TZ);
  const newTime = now.plus({ milliseconds: ms });
  const formattedTime = newTime.toFormat("[dd HH:mm:ss]");
  return formattedTime;
};

client.login(config.bot.token);