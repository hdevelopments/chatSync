import { MessagePayload, StringMappedInteractionTypes } from "discord.js"

export interface NotificationModel{
    chat?: {
        user: string,
        userSteamId?: string,
        message: string
    }
    notification?: string | MessagePayload
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