net.Receive("ROOKI.Discord.Message", function()
    local msg = util.JSONToTable(net.ReadString())
    chat.AddText( msg)
end)