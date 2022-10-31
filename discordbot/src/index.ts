import WebSocketServer from "ws";
import {
  Client,
  Events,
  BaseGuildTextChannel,
  Webhook,
} from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import {
  ConfigModel,
  NotificationModel,
  StatusEnum,
  SteamUserModel,
} from "./models";
import axios from "axios";
import { config } from "process";
const Config = require(Number(process.env.DEV || 0) === 1
  ? "./config_dev"
  : "./config").default as ConfigModel;
const wss = new WebSocketServer.Server({
  port: +(Config.ws_port || 6969),
});

let webhook: Webhook | undefined;
let channel: BaseGuildTextChannel | undefined;
let status: { [key: string]: NotificationModel } = {};
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

async function getWebhookOfChannel(
  channel: BaseGuildTextChannel,
  force: boolean = false
): Promise<Webhook> {
  if (webhook && !force) {
    return webhook;
  }

  var webhooks = await channel.fetchWebhooks();
  var foundWebhook = webhooks.find(
    (wbhk) => wbhk.owner?.id === client.user?.id
  );

  if (foundWebhook) {
    return foundWebhook;
  } else {
    webhook = await channel.createWebhook({
      name: "Gmod Chat Sync",
      reason: "No Webhook created for Chat Sync",
    });
    return webhook;
  }
}

async function fetchSteamAvatar(steamId64: string) {
  const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Config.apiKey}&steamids=${steamId64}`;

  var players = (
    (
      await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).data as any
  ).response.players as SteamUserModel[];

  if (players.length === 0) {
    console.log("Invalid SteamId send");
    return;
  }
  return players[0];
}

client.once(Events.ClientReady, async (c) => {
  channel = client.channels.cache.get(
    Config.dc_channelId
  ) as BaseGuildTextChannel;
  await getWebhookOfChannel(channel);
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

wss.on("connection", (ws, req) => {
  console.log("New Client connected");
  if (
    req.socket.remoteAddress !== Config.gm_address &&
    req.socket.remoteAddress !== "::1" &&
    req.socket.remoteAddress !== "localhost" &&
    req.socket.remoteAddress !== "127.0.0.1"
  ) {
    ws.close(1000);
    return;
  }
  ws.on("message", async (dta: string) => {
    var data = JSON.parse(dta) as NotificationModel;

    status[req.socket.remoteAddress!] = {
      status: data.status,
    };

    if (!channel) {
      console.log("Channel Id is Invalid!");
      return;
    }
    var webhook = await getWebhookOfChannel(channel);
    if (data.chat) {
      var avatar = (await fetchSteamAvatar(data.chat.userSteamId!))?.avatarfull;
      webhook.send({
        username: data.chat.user,
        avatarURL: avatar,
        content: data.chat.message,
      });
    } else if (data.notification) {
      if(typeof data.notification === "string"){
        if(Config.translations[data.notification]){
          webhook.send(Config.translations[data.notification]);
        }else{
          webhook.send(data.notification);
        }
      }else{
        webhook.send(data.notification);
      }
    }
  });
  ws.on("close", async (code, reason) => {
    console.log("Connection to Client closed!");
    if (status[req.socket.remoteAddress!].status !== StatusEnum.Shutdown) {
      console.log("Gmod Server crashed!");
      if (!channel) {
        console.log("Channel Id is Invalid!");
        return;
      }
      var webhook = await getWebhookOfChannel(channel);
      webhook.send({
        content: Config.translations["crashed"],
      });
    }
  });
  ws.onerror = (err) => {
    console.log("Some Error occurred");
    console.log(err.message);
  };
});
console.log(
  "The WebSocket server is running on port " + (Config.ws_port || "6969")
);

client.on(Events.MessageCreate, (msg) => {
  if (msg.channelId !== Config.dc_channelId || msg.author.bot || msg.webhookId)
    return;
  msg.fetch().then((msg) => {
    if (
      Config.ignore_prefix.find((x) => {
        return msg.content.startsWith(x);
      })
    )
      return;
    wss.clients.forEach((cl, cl1) => {
      cl.send(
        JSON.stringify({
          chat: {
            user: msg.author.username,
            message: msg.content,
          },
        } as NotificationModel)
      );
    });
  });
});

client.login(Config.dc_token);
