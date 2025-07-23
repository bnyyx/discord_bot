# discord_bot
just a discord bot made for my friend's server. 

# install
clone repo and install node
make sure nodejs is installed
```
npm install
```
```
node deploy-commands.js 
```
```
node index.js
```

# notes
this bot isnt really made to be used on other servers, might update that in the future

create the following files yourself or remove the quotes.js and locations.js files in the commands folder.
<br>there's probably more that won't work directly, just read the logs tbh, goodluck 
<br>
quotelist.js:
```
const quotes = [
	'list',
	'of',
	'quotes',
];
  
  module.exports = quotes;
```
locations.js:
```
const locations = [
  { name: "basename", dimension: 'Overworld', coords: { x: 197, y: 107, z: 122 }, threshold: { x: 91, y: 91, z: 91 } },
  { name: "Main End Island", dimension: 'End', coords: { x: 15, y: 49, z: 0 }, threshold: { x: 144, y: 144, z: 144 } },
];

module.exports = locations;
```

make sure to create a config.json file and edit the following
request the info at https://discord.com/developers/applications
```
	"token": "token",
	"clientId": "clientid",
	"guildId": "serverid" 
```
