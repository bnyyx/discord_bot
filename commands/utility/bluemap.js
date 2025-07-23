const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Get a link for Bluemap'),

	async execute(interaction) {
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		const open = new ButtonBuilder()
		.setLabel('Click here!')
		.setURL('http://mc.tonnus.nl:8100/')
		.setStyle(ButtonStyle.Link);

		const row = new ActionRowBuilder()
		.addComponents(open);

		await interaction.reply({
			content: `Click on the button below!`,
			components: [row],
		});


	},
};