# chatSync

A small Discord - Gmod Chat Sync Addon.

# REQUIREMENTS:

A Gmod Server<br/>
A Server where you can run NPM ( for example a VServer by Hoster XYZ, NOT a Gameserver like IPS-Hosting they dont give you access to the SSH-Console! )<br/>

# Installation:

Put chatSync-Addon in your gmod Server Addons folder ( or edit the config and then publish it to Steam Workshop )<br/>
Edit the config of the Addon ( see chatSync-Addon/lua/autorun/chatSync_config.lua )<br/>
Install npm in on your V- or Root Server.<br/>
Put discordbot somewhere in your V- or Root Server. <br/>
Edit the config of the discordbot ( see discordbot/src/config.ts<br/>
Go into discordbot over SSH, run npm install and after thatnpm run start


# Running it for development

Install the Addon normally like before.
Create a config_dev.ts in discordbot/src
put there your development credentials in. ( just copy past config.ts )
then run npm run dev.
Then if you made any changes the config_dev.ts wouldnt be pushed.
