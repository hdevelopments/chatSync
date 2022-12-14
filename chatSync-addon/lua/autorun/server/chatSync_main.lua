require("gwsockets")
util.AddNetworkString("ROOKI.Discord.Message")
local config = include("autorun/server/chatSync_config.lua")
chatSync_WS = chatSync_WS or GWSockets.createWebSocket(config.websocket_address, false)

local function SendMessage(ply, txt)
    if config.whitelistPrefix then
        for _, v in ipairs(config.whitelistPrefix) do
            txt = string.Replace(txt, v, "")
        end
    end

    chatSync_WS:write(util.TableToJSON({
        status = 1,
        chat = {
            user = ply:Nick(),
            userSteamId = ply:SteamID64(),
            message = txt
        }
    }))
end

local tries = 0

local function RecieveMessage(user, msg)
    net.Start("ROOKI.Discord.Message")
    net.WriteString(util.TableToJSON(msg))
    net.Broadcast()
end

local function IsValidText(txt)
    if config.whitelistPrefix then
        for _, v in ipairs(config.whitelistPrefix) do
            if string.StartWith(txt, v) then return true end
        end

        if config.onlyWhiteList then return false end
    end

    for _, v in ipairs(config.ignorePrefix) do
        if string.StartWith(txt, v) then return false end
    end

    return true
end

hook.Add("PlayerSay", "ROOKI.chatSync.PlayerSay", function(ply, txt, tc)
    if config.ignoreTeamChat and tc or not IsValidText(txt) then return end
    SendMessage(ply, txt)
end)

function chatSync_WS:onMessage(msg)
    msg = util.JSONToTable(msg)
    if not msg.chat then return end
    local text = {}

    if istable(config.chatPrefix) == "table" then
        for _, v in ipairs(config.chatPrefix) do
            if isstring(v) then
                table.insert(text, string.Replace(v, "{user}", msg.chat.user))
            else
                table.insert(text, v)
            end
        end
    else
        table.insert(text, config.chatPrefix)
    end

    table.insert(text, msg.chat.message)
    RecieveMessage(text)
end

function chatSync_WS:onError(errMessage)
    print("An Error occured " .. errMessage)
end

function chatSync_WS:onConnected()
    print("Connect with the Server")
    tries = 0
end

function chatSync_WS:onDisconnected()
    if tries == 0 then
        print("Disconnected with the Server, retry in 30 seconds")
    end

    timer.Simple(30, function()
        tries = tries + 1
        chatSync_WS:open()
    end)
end

hook.Add("ShutDown", "ROOKI.chatSync.Shutdown", function()
    chatSync_WS:write(util.TableToJSON({
        status = 0,
        notification = "shutdown"
    }))

    chatSync_WS:close()
end)

timer.Simple(5, function()
    if not chatSync_WS:isConnected() then
        chatSync_WS:open()
    end

    chatSync_WS:write(util.TableToJSON({
        status = 1,
        notification = "starting"
    }))
end)