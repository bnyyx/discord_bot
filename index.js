const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');
const cron = require('node-cron');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.DirectMessages, 
        GatewayIntentBits.MessageContent
    ],
    partials: ["CHANNEL"] 
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const isDM = !interaction.guild;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, isDM);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});


const { Rcon } = require('rcon-client');

client.once(Events.ClientReady, async readyClient => {


    cron.schedule('0 15 * * 5', function() {
        client.channels.cache.get('1351915798087860245').send('https://cdn.discordapp.com/attachments/523454612800536599/1109218838777692240/flatwormfriday.mp4?ex=67dbd44b&is=67da82cb&hm=e9e366048844fadf487badad5f7e49101174f85f9f7f7daf8331aa8cb57db5cb&')
    }, {
        timezone: "Europe/Amsterdam",
        scheduled: true

    });

    console.log(`Bot is online: ${readyClient.user.tag}`);

    const host = '10.10.10.32';
    const port = 25575;
    const password = '123456';
    const maxPlayers = 20;
   
    async function updatePlayerStatus() {
        const rcon = new Rcon({ host, port, password });
        let connectedSuccessfully = false; 

        try {
            await rcon.connect();
            connectedSuccessfully = true; 
            console.log('Connected to RCON!');

            const response = await rcon.send('list');
            console.log('Response from server:', response);

            const playerMatch = response.match(/There are (\d+) of a max of (\d+) players online: ?(.*)?/);
            let playerCount = 0;
            let playerList = "No players online";
            let playerNames = [];

            if (playerMatch) {
                playerCount = parseInt(playerMatch[1], 10) || 0;
                const maxPlayers = parseInt(playerMatch[2], 10) || 20; 

                if (playerMatch[3]) {
                    playerNames = playerMatch[3].split(',').map(player => player.trim());
                }

                if (playerNames.length > 0) {
                    playerList = playerNames.join(', ');

                    if (playerList.length > 128) {
                        playerList = playerList.substring(0, 125) + '...';
                    }
                }
            }

            client.user.setActivity({
                name: `Players Online: ${playerCount}`,
                type: ActivityType.Playing,
                state: playerList,
            });


        } catch (err) {
            console.error('Error fetching player count:', err);
            client.user.setActivity({
                name: 'Error fetching players',
                type: ActivityType.Playing
            });
        } finally {
            if (connectedSuccessfully) {
                rcon.end();
                console.log('Disconnected from RCON.');
            } else {
                console.log('RCON connection was not established, skipping rcon.end().');
            }
        }
    }

    updatePlayerStatus();
    setInterval(updatePlayerStatus, 30000);
});


client.login(token);

// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | month
// | | | day of month
// | | hour
// | minute
// second ( optional )