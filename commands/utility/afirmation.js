const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('afirmation')
		.setDescription('fuc urself (je favoriete nederlandse haat quotes)'),


	async execute(interaction) {
		const love = [
			'Ik haat je!',
			'Jij verdient niks',
			'Jij bent niet genoeg',
			'Wees niet jezelf, je zuigt zoals je bent',
			'Je kan het (niet)!',
			'Bewandel je eigen pad (het ligt vol met Lego en je draagt geen sokken)',
			'Je wordt gehaat',
			'Elke dag wordt het erger',
			'Alles kan zwaar zijn, dat klopt',
			'Je hoeft niet elke dag 100% te geven, het is het toch niet waard',
			'Ik hoop dat je een burnout krijgt',
			'Wacht niet op een "perfect moment", je verneukt het toch wel',
			'Ik hoop dat je je teen stoot',
			'Het is allemaal downhill vanaf hier',
			'Je bent niet perfect (op een hatelijke manier)',
			'Stop maar',
		   ];
		   const response = love[Math.floor(Math.random() * love.length)];
		await interaction.reply(response);
	},
};
