local config = include("autorun/chatSync_config.lua")

net.Receive("ROOKI.Discord.Message", function()
    local user = net.ReadString()
    local msg = net.ReadString()
    chat.AddText(Color(114, 137, 218), "[DISCORD]", Color(0, 0, 0), user .. ": ", Color(255, 255, 255), msg)
end)