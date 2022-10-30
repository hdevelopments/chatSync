config = {
    server_name = "Main Server", -- The Nickname of the server ( for identification )
    websocket_address = "ws://localhost:6969", -- the IP of the Discordbot Server
    ignoreTeamChat = true, -- Should the Team Chat be ignored
    ignorePrefix = {"/", ".", "!",}
}

-- Ignored prefixes if you dont want that commands gets printed in discord
return config