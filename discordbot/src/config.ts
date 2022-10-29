import { ConfigModel } from "./models";

var Config:ConfigModel  = {
  gm_address: "localhost", // So that no random IP can connect ;)
  ws_port: 6969, // What port should be opened for the Websocket
  dc_token:
    "YOUR DISCORD TOKEN HERE", // Your Discord Token
  dc_channelId: "Channel Id here", // The channel Id that the messages should be send and listened to
  ignore_prefix: ["/", "!", "."], // What prefixes should be ignored.
  apiKey: "YOUR STEAM API KEY HERE" // For the Avatars from the Steam Users
};
export default Config;
