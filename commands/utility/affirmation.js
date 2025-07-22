const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('affirmation')
		.setDescription('wuv urself (je favoriete nederlandse motiverende quotes)'),


	async execute(interaction) {
		const love = [
			'Je mag er zijn',
			'Jij verdient liefde, succes en geluk',
			'Jij bent genoeg',
			'Wees jezelf, niet wie iemand wilt dat je bent',
			'Je kan het!',
			'Vertrouw je eigen pad',
			'Je bent geliefd',
			'Elke dag wordt je een betere versie van jezelf',
			'Alles kan zwaar zijn, maar ook een vliegtuig stijgt op met wind tegen',
			'Je hoeft niet elke dag 100% te geven, je best doen is genoeg',
			'Gun jezelf de rust',
			'Wacht niet op een "perfect moment", pak een moment en maak deze perfect',
			'Kleine stappen zijn ook stappen',
			'Het komt goed',
			'Geef het tijd',
			'Je bent perfect zoals je bent',
			'Doe het gewoon!',
		   ];
		   const response = love[Math.floor(Math.random() * love.length)];
		await interaction.reply(response);
	},
};
