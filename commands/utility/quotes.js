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
	// 	const quotes = [
	// 		'"Ik snap dat je verdrietig bent. Als ik een vrouw was zou ik dat ook zijn." -Sylvano',
	// 		'"Als ik een vrouw zou zijn, zou ik een trans man worden" -Sylvano',
	// 		'"Ik zou je nooit missen Tonny" -Sylvano',
	// 		'"oke brb even zuigen" -Layna',
	// 		'"Worst kaas moment" -Layna',
	// 		'"Ik heb liever de remeowster" -Layna',
	// 		'"De ijsthee ontdooid" -Daan',
	// 		'"Nyahallo" -Alex',
	// 		'"Fuck bitches, speel Tetris" -Wesley',
	// 		'"Het is niet chad muziek het is Can you feel my heart van bring me the horizon" -Wesley',
	// 		'"Classic Alex" -Alex',
	// 		'"Drop de coördinaten van je gat" -Tonny',
	// 		'"I\x27m spaghetti hoym shit" -Tonny',
	// 		'"yoooo~" -Layna',
	// 		'"Waarom ben je zwart?" -Egoney',
	// 		'"breng je achterwerk" -Layna'
	// 	];

		// Get the optional filter argument
		const filter = interaction.options.getString('filter');
		
		// Filter quotes if a filter is provided, otherwise use all quotes
		const filteredQuotes = filter
			? quotes.filter(q => q.toLowerCase().includes(filter.toLowerCase()))
			: quotes;

		// If no matching quotes, send an error message
		if (filteredQuotes.length === 0) {
			return await interaction.reply(`No quotes found for **${filter}**.`);
		}

		// Pick a random quote from the filtered list
		const response = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
		await interaction.reply(response);
	},
};
