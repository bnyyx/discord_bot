const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Rcon = require('rcon-client').Rcon;
const net = require('net'); 
const locations = require('../../locations'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doxx')
    .setDescription('doxx your friends crazy style.'),

  async execute(interaction) { 
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const host = '10.10.10.32';
    const port = 25575;
    const password = '123456';
    const connectionTimeout = 5000;

    console.log(`[${new Date().toLocaleTimeString()}] Attempting to connect to RCON at ${host}:${port}`);

    let rcon;
    let connectedSuccessfully = false;

    try {
      const socket = new net.Socket();
      let connectAttemptComplete = false;

      const connectPromise = new Promise((resolve, reject) => {
        socket.setTimeout(connectionTimeout); 

        socket.on('connect', () => {
          connectAttemptComplete = true;
          socket.destroy(); 
          resolve();
        });

        socket.on('timeout', () => {
          if (!connectAttemptComplete) {
            connectAttemptComplete = true;
            socket.destroy();
            reject(new Error('ETIMEDOUT: Connection timed out during initial TCP handshake.'));
          }
        });

        socket.on('error', (err) => {
          if (!connectAttemptComplete) {
            connectAttemptComplete = true;
            socket.destroy();
            reject(err);
          }
        });

        socket.connect(port, host);
      });

      await connectPromise;
      console.log(`[${new Date().toLocaleTimeString()}] Initial TCP handshake successful or timed out as expected.`);

      rcon = new Rcon({
        host: host,
        port: port,
        password: password,
        timeout: 5000 
      });

      await rcon.connect();
      connectedSuccessfully = true;
      console.log(`[${new Date().toLocaleTimeString()}] Successfully connected to RCON!`);

      const response = await rcon.send('list');
      console.log(`[${new Date().toLocaleTimeString()}] Response from server for 'list':`, response);

      const playerMatch = response.match(/players online: (.*)/);
      if (!playerMatch || !playerMatch[1] || playerMatch[1].trim() === '') {
        await interaction.editReply({ content: 'No players are currently online :(', ephemeral: true }); 
        return;
      }

      const playerNames = playerMatch[1].split(',').map(player => player.trim()).filter(Boolean);
      if (playerNames.length === 0) {
        await interaction.editReply({ content: 'No players are currently online :(', ephemeral: true }); 
        return;
      }

      let playerData = [];

      for (const player of playerNames) {
        console.log(`[${new Date().toLocaleTimeString()}] Fetching data for player: ${player}`);
        
        let isHidden = false;
        try {
          const hiddenCheckResponse = await rcon.send(`execute if data entity ${player} Inventory[{id:"minecraft:stick", components:{"minecraft:custom_name":'"hidden"'}}]`);
          console.log(`[${new Date().toLocaleTimeString()}] Hidden check response for ${player}:`, hiddenCheckResponse);

          if (!hiddenCheckResponse.includes("Test failed")) {
            console.log(`[${new Date().toLocaleTimeString()}] Player ${player} is hidden (found hidden item)`);
            playerData.push(`**${player}** | is hidden`);
            isHidden = true;
          }
        } catch (inventoryError) {
          console.warn(`[${new Date().toLocaleTimeString()}] Failed to check hidden item for ${player}:`, inventoryError.message);
        }

        if (isHidden) {
            continue; 
        }

        let playerCoords = 'Unknown Location';
        let playerDimension = 'Unknown';

        try {
            const coordsResponse = await rcon.send(`data get entity ${player} Pos`);
            console.log(`[${new Date().toLocaleTimeString()}] Coordinates response for ${player}:`, coordsResponse);

            const dimensionResponse = await rcon.send(`data get entity ${player} Dimension`);
            console.log(`[${new Date().toLocaleTimeString()}] Dimension response for ${player}:`, dimensionResponse);

            if (dimensionResponse.includes("minecraft:overworld")) playerDimension = "Overworld";
            else if (dimensionResponse.includes("minecraft:the_nether")) playerDimension = "Nether";
            else if (dimensionResponse.includes("minecraft:the_end")) playerDimension = "End";

            const coordsMatch = coordsResponse.match(/\[(-?\d+\.\d+)d, (-?\d+\.\d+)d, (-?\d+\.\d+)d\]/);
            if (coordsMatch) {
              const x = Math.floor(parseFloat(coordsMatch[1]));
              const y = Math.floor(parseFloat(coordsMatch[2]));
              const z = Math.floor(parseFloat(coordsMatch[3]));

              let locationFound = false;
              for (const location of locations) {
                if (playerDimension === location.dimension &&
                    Math.abs(x - location.coords.x) <= location.threshold.x &&
                    Math.abs(y - location.coords.y) <= location.threshold.y &&
                    Math.abs(z - location.coords.z) <= location.threshold.z) {
                  playerCoords = `**${location.name}** (${playerDimension})`;
                  locationFound = true;
                  break;
                }
              }

              if (!locationFound) {
                playerCoords = `**X:** ${x} **Y:** ${y} **Z:** ${z} (${playerDimension})`;
              }
            } else {
              console.log(`[${new Date().toLocaleTimeString()}] Failed to match coordinates for ${player}`);
            }
        } catch (coordFetchError) {
            console.warn(`[${new Date().toLocaleTimeString()}] Error fetching coords/dimension for ${player}:`, coordFetchError.message);
        }
        
        playerData.push(`**${player}** | ${playerCoords}`);
      }

      if (playerData.length === 0) {
        await interaction.editReply({ content: 'All online players are hidden or data could not be fetched.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Online Player Locations')
        .setDescription(playerData.join('\n'))
        .setFooter({ text: 'Hide yourself by renaming a stick to "hidden" (without quotes) and holding it.' }) 
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed], ephemeral: true });
      console.log(`[${new Date().toLocaleTimeString()}] Sent player list and coordinates in embed.`);

    } catch (err) {
      console.error(`[${new Date().toLocaleTimeString()}] Error during RCON connection or command execution:`, err);
      let errorMessage = 'Cannot connect to the server! Reason: ';

      if (err.message.includes('ETIMEDOUT')) {
        errorMessage += ' (Connection timed out - server is likely offline or RCON port is blocked/incorrect)';
      } else if (err.message.includes('Authentication failed')) {
        errorMessage += ' (RCON authentication failed, please check the password)';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage += ' (Connection refused - RCON is not running or firewall is blocking)';
      } else if (err.code === 'ENOTFOUND') {
          errorMessage += ' (Server IP address not found)';
      } else {
        errorMessage += ` (An unexpected error occurred: ${err.message})`;
      }
      await interaction.editReply({ content: errorMessage, ephemeral: true }); 
    } finally {
      if (connectedSuccessfully && rcon) { 
        try {
          rcon.end();
          console.log(`[${new Date().toLocaleTimeString()}] Disconnected from RCON.`);
        } catch (closeErr) {
          console.error(`[${new Date().toLocaleTimeString()}] Error while closing RCON connection:`, closeErr);
        }
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] RCON connection was not established, skipping rcon.end().`);
      }
    }
  },
};