const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pint')
		.setDescription('Learn to type, cheers'),
	async execute(interaction) {
		await interaction.reply(':beer:');
	},
};
