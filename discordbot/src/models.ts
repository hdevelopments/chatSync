import { StringMappedInteractionTypes } from "discord.js"

export interface ChatModel{
    user: string,
    userSteamId?: string,
    message: string
}


export interface ConfigModel{
    gm_address: string,
    ws_port: number,
    dc_token:
        string,
    dc_channelId: string,
    ignore_prefix: string[],
    apiKey: string
}

export interface SteamUserModel{
    steamid: string,
    profileurl: string,
    avatar: string,
    avatarmedium: string,
    avatarfull: string
}