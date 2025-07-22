const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Rcon = require('rcon-client').Rcon;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tps')
    .setDescription('Show tps :3'),

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
      
      const response = await rcon.send('tps');
      console.log('Response from server:', response);

      const cleanedResponse = response.replace(/§[0-9a-fk-or]/g, '').trim();

      const tpsRegex = /TPS from last 1m, 5m, 15m: ([\d\.]+), ([\d\.]+), ([\d\.]+)/;
      const match = cleanedResponse.match(tpsRegex);

      if (match) {
        const fiveMinuteTps = match[2]; 

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('**TPS**')
          .setDescription(`Current TPS!!: **${fiveMinuteTps}**`)

        await interaction.reply({ embeds: [embed] });
        console.log('Interaction replied with 5-minute TPS in embed.');
      } else {
        await interaction.reply('awwh i cannot connect :<');
        console.log('Failed to match TPS values.');
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
