const { SlashCommandBuilder } = require('discord.js');
const quotes = require('../../quotelist'); 

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Awesome quotes')
		.addStringOption(option =>
			option.setName('filter')
				.setDescription('filter quotes by word :)')
				.setRequired(false)
		),
	
	async execute(interaction) {


		const filter = interaction.options.getString('filter');
		
		const filteredQuotes = filter
			? quotes.filter(q => q.toLowerCase().includes(filter.toLowerCase()))
			: quotes;

		if (filteredQuotes.length === 0) {
			return await interaction.reply(`No quotes found for **${filter}**.`);
		}

		const response = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
		await interaction.reply(response);
	},
};
