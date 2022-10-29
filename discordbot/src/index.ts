import Config from "./config";
import WebSocketServer from "ws";
import {
  Client,
  Events,
  BaseGuildTextChannel,
  MessageCreateOptions,
  EmbedBuilder,
} from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import ChatModel from "./models";
import { text } from "stream/consumers";
const wss = new WebSocketServer.Server({
  port: +(Config.ws_port || 6969),
  clientTracking: true,
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once(Events.ClientReady, (c) => {
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
  ws.on("message", (dta: string) => {
    var data = JSON.parse(dta) as ChatModel;

    client.channels.fetch(Config.dc_channelId!).then((channel) => {
      if (!channel) {
        console.log("Channel Id is invalid or not reachable for the Bot");
      }
      var textChannel = channel as BaseGuildTextChannel;

      var embed = new EmbedBuilder();
      textChannel.send({
        content: `**${data.user}**: ${data.message}`,
      } as MessageCreateOptions);
    });
  });
  ws.on("close", () => {
    console.log("Connection to Client closed!");
  });
  ws.onerror = function () {
    console.log("Some Error occurred");
  };
});
console.log(
  "The WebSocket server is running on port " + (Config.ws_port || "6969")
);

client.on(Events.MessageCreate, (msg) => {
  if (
    msg.channelId !== Config.dc_channelId ||
    msg.author.bot ||
    Config.ignore_prefix.find((x) => msg.content.startsWith(x))
  )
    return;
  msg.fetch().then((msg) => {
    wss.clients.forEach((cl, cl1) => {
      cl.send(
        JSON.stringify({
          user: msg.author.username,
          message: msg.content,
        } as ChatModel)
      );
    });
  });
});

client.login(Config.dc_token);
