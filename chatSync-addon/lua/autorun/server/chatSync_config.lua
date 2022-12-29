config = {
    websocket_address = "ws://localhost:6969", -- the IP of the Discordbot Server
    ignoreTeamChat = true, -- Should the Team Chat be ignored
    whitelistPrefix = {"//", "/ooc"}, -- false = everything except ignoreprefix | {"//"} if it is in the "list" it will be going through even if a part is in the ignoreprefix
    ignorePrefix = {"/", ".", "!"},
    chatPrefix = {Color(255,0,0), "[OOC - Discord] | {user}:"} -- User gets replaced with username of the dc user
}

-- Ignored prefixes if you dont want that commands gets printed in discord
return config