const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const locations = require('../../locations'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('location')
    .setDescription('Show points of interest'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Base Locations')
      .setDescription('Points of interest:')
      .addFields(locations.map(loc => ({
        name: loc.name,
        value: `**X:** ${loc.coords.x}, **Y:** ${loc.coords.y}, **Z:** ${loc.coords.z}\n**Dimension:** ${loc.dimension}`,
        inline: false
      })));

    await interaction.reply({ embeds: [embed] });
  }
};
