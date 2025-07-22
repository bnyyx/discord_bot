const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Get the link to the bluemap teehee~~'),

	async execute(interaction) {
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

		const open = new ButtonBuilder()
		.setLabel('c-click on me.. :3')
		.setURL('http://mc.tonnus.nl:8100/')
		.setStyle(ButtonStyle.Link);

		const row = new ActionRowBuilder()
		.addComponents(open);

		await interaction.reply({
			content: `c-click on the button below pwease..`,
			components: [row],
		});


	},
};