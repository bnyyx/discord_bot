const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Rcon = require('rcon-client').Rcon;
const locations = require('../../locations'); // Import the locations file

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doxx')
    .setDescription('Doxx your fwiends~!'),

  async execute(interaction, isDM) {
    const host = '10.10.10.32';
    const port = 25575;
    const password = '123456';

    console.log(`Attempting to connect to RCON at ${host}:${port}`);

    const rcon = new Rcon({ host, port, password });

    try {
      await rcon.connect();
      console.log('Successfully connected to RCON!');

      const response = await rcon.send('list');
      console.log('Response from server:', response);

      const playerMatch = response.match(/players online: (.*)/);
      if (!playerMatch || !playerMatch[1]) {
        await interaction.reply({ content: 'nobunny is ownine :< ', ephemeral: isDM });
        return;
      }

      const playerNames = playerMatch[1].split(',').map(player => player.trim()).filter(Boolean);
      if (playerNames.length === 0) {
        await interaction.reply({ content: 'nobunny is ownine :<', ephemeral: isDM });
        return;
      }

      let playerData = [];

      for (const player of playerNames) {
        console.log(`Fetching data for player: ${player}`);
        
        try {
          const hiddenCheckResponse = await rcon.send(`execute if data entity ${player} Inventory[{id:"minecraft:stick", components:{"minecraft:custom_name":'"hidden"'}}]`);
          console.log(`Hidden check response for ${player}:`, hiddenCheckResponse);

          if (!hiddenCheckResponse.includes("Test failed")) {
            console.log(`Player ${player} is hidden (found hidden item)`);
            playerData.push(`**${player}** | is hidden`);
            continue;
          }
        } catch (inventoryError) {
          console.log(`Failed to check hidden item for ${player}:`, inventoryError);
        }

        const coordsResponse = await rcon.send(`data get entity ${player} Pos`);
        console.log(`Coordinates response for ${player}:`, coordsResponse);

        const dimensionResponse = await rcon.send(`data get entity ${player} Dimension`);
        console.log(`Dimension response for ${player}:`, dimensionResponse);

        let dimension = "?";
        if (dimensionResponse.includes("minecraft:overworld")) dimension = "Overworld";
        else if (dimensionResponse.includes("minecraft:the_nether")) dimension = "Nether";
        else if (dimensionResponse.includes("minecraft:the_end")) dimension = "End";

        const coordsMatch = coordsResponse.match(/\[(-?\d+\.\d+)d, (-?\d+\.\d+)d, (-?\d+\.\d+)d\]/);
        if (coordsMatch) {
          const x = Math.floor(parseFloat(coordsMatch[1]));
          const y = Math.floor(parseFloat(coordsMatch[2]));
          const z = Math.floor(parseFloat(coordsMatch[3]));

          let locationFound = false;
          for (const location of locations) {
            if (dimension === location.dimension &&
                Math.abs(x - location.coords.x) <= location.threshold.x &&
                Math.abs(y - location.coords.y) <= location.threshold.y &&
                Math.abs(z - location.coords.z) <= location.threshold.z) {
              playerData.push(`**${player}** | **${location.name}** (${dimension})`);
              locationFound = true;
              break;
            }
          }

          if (!locationFound) {
            playerData.push(`**${player}** | **X:** ${x} **Y:** ${y} **Z:** ${z} (${dimension})`);
          }
        } else {
          console.log(`Failed to match coordinates for ${player}`);
        }
      }

      if (playerData.length === 0) {
        await interaction.reply({ content: 'awh comand no worky!.', ephemeral: isDM });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Fwiend Locations')
        .setDescription(playerData.join('\n'))
        .setFooter({ text: 'hide yourself by renaming a stick to "hidden" (without quotes)' });
      
      await interaction.reply({ embeds: [embed], ephemeral: isDM });
      console.log('Sent player list and coordinates in embed.');
    } catch (err) {
      console.error('Error during RCON connection or command execution:', err);
      await interaction.reply({ content: `awh comand no worky! | ${err.message}`, ephemeral: isDM });
    } finally {
      rcon.end();
      console.log('Disconnected from RCON.');
    }
  },
};
