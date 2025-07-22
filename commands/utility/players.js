const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Rcon = require('rcon-client').Rcon;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('Show online fwiends! ^^'),

  async execute(interaction) {
    const host = '10.10.10.32';
    const port = 25575;
    const password = '123456';

    console.log(`Attempting to connect to RCON at ${host}:${port} with password: ${password}`);

    const rcon = new Rcon({
      host: host,
      port: port,
      password: password,
    });

    try {
      await rcon.connect();
      console.log('Successfully connected to RCON!');
      const response = await rcon.send('list');
      console.log('Response from server:', response);

      const playerMatch = response.match(/players online: (.*)/);
      
      if (playerMatch) {
        const playerNames = playerMatch[1].split(',').map(player => player.trim());

        if (playerNames.length === 0 || playerNames[0] === '') {
          await interaction.reply('no wun is onwine.. so lonely :C');
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('**Now online!**')
          .setDescription(playerNames.map(player => `${player}`).join('\n'))
          .setFooter({ text: `Pweoples online! : ${playerNames.length}` })

        await interaction.reply({ embeds: [embed] });
        console.log('Interaction replied with player list in embed.');
      } else {
        await interaction.reply('awwh i cannot connect :< ');
      }

    } catch (err) {
      console.error('Error during RCON connection or command execution:', err);
      await interaction.reply('awwh i cannot connect :< | ' + err.message);
    } finally {
      rcon.end();
      console.log('Disconnected from RCON.');
    }
  },
};
