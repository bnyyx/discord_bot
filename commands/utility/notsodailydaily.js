const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('not so daily games'),
	async execute(interaction) {
		await interaction.reply('**Wordle:** <https://www.nytimes.com/games/wordle/index.html> \n**MCDLE:** <https://www.mcdle.net/> \n**Guess The Game:** <https://guessthe.game/> \n');
	},
};
