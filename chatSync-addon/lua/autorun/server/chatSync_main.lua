require("gwsockets")
util.AddNetworkString("ROOKI.Discord.Message")
local config = include("autorun/chatSync_config.lua")
chatSync_WS = chatSync_WS or GWSockets.createWebSocket(config.websocket_address, false)

local function SendMessage(ply, txt)
    chatSync_WS:write(util.TableToJSON({
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
    net.WriteString(user)
    net.WriteString(msg)
    net.Broadcast()
end

local function IsValidText(txt)
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
    RecieveMessage(msg.chat.user, msg.chat.message)
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
        notification = {
            content = "Server is shutting down!"
        }
    }))
    chatSync_WS:close()
end)

timer.Simple(0, function()
    if not chatSync_WS:isConnected() then
        chatSync_WS:open()
    end
    chatSync_WS:write(util.TableToJSON({
        notification = {
            content = "Server has started!"
        }
    }))
end)