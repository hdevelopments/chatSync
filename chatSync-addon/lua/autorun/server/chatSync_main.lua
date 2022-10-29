require("gwsockets")
util.AddNetworkString("ROOKI.Discord.Message")
local config = include("autorun/chatSync_config.lua")
local WS = WS or GWSockets.createWebSocket(config.websocket_address, false)

local function SendMessage(ply, txt)
    WS:write(util.TableToJSON({
        user = ply:Nick(),
        message = txt
    }))
end

local function RecieveMessage(user, msg)
    print("Sending Discord Chat:")
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

function WS:onMessage(msg)
    msg = util.JSONToTable(msg)
    RecieveMessage(msg.user, msg.message)
end

function WS:onError(errMessage)
    print("An Error occured " .. errMessage)
end

function WS:onConnected()
    print("Connect with the Server")
end

function WS:onDisconnected()
    print("Disconnected with the Server, retry in 10 seconds")
    timer.Simple(10, function()
        WS:open()
    end)
end

hook.Add("ShutDown", "ROOKI.chatSync.Shutdown", function()
    WS:close()
end)

timer.Simple(0, function()
    WS:open()
end)