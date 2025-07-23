const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const Rcon = require('rcon-client').Rcon;
const net = require('net'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tps')
    .setDescription('Show server TPS'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const host = '10.10.10.32';
    const port = 25575;
    const password = '123456';
    const connectionTimeout = 5000; 

    console.log(`[${new Date().toLocaleTimeString()}] Attempting to connect to RCON at ${host}:${port}`);

    let rcon;
    let connectedSuccessfully = false;

    try {
      const socket = new net.Socket();
      let connectAttemptComplete = false;

      const connectPromise = new Promise((resolve, reject) => {
        socket.setTimeout(connectionTimeout); 
        socket.on('connect', () => {
          connectAttemptComplete = true;
          socket.destroy(); 
          resolve();
        });

        socket.on('timeout', () => {
          if (!connectAttemptComplete) {
            connectAttemptComplete = true;
            socket.destroy();
            reject(new Error('ETIMEDOUT: Connection timed out during initial TCP handshake.'));
          }
        });

        socket.on('error', (err) => {
          if (!connectAttemptComplete) {
            connectAttemptComplete = true;
            socket.destroy();
            reject(err);
          }
        });

        socket.connect(port, host);
      });

      await connectPromise;
      console.log(`[${new Date().toLocaleTimeString()}] Initial TCP handshake successful or timed out as expected.`);

      rcon = new Rcon({
        host: host,
        port: port,
        password: password,
        timeout: 5000 
      });

      await rcon.connect(); 
      connectedSuccessfully = true;
      console.log(`[${new Date().toLocaleTimeString()}] Successfully connected to RCON!`);
      
      const response = await rcon.send('tps');
      console.log(`[${new Date().toLocaleTimeString()}] Raw response from server:`, response);

      const cleanedResponse = response.replace(/§[0-9a-fk-or]/g, '').trim();
      const tpsRegex = /TPS from last 1m, 5m, 15m: ([\d.]+), ([\d.]+), ([\d.]+)/;
      const match = cleanedResponse.match(tpsRegex);

      if (match) {
        const oneMinuteTps = match[1];
        const fiveMinuteTps = match[2]; 
        const fifteenMinuteTps = match[3];

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('**Minecraft Server TPS**')
          .setDescription(`
            **1m TPS:** ${oneMinuteTps}
            **5m TPS:** ${fiveMinuteTps}
            **15m TPS:** ${fifteenMinuteTps}
          `)
          .setFooter({ text: 'Data from RCON' })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        console.log(`[${new Date().toLocaleTimeString()}] Interaction replied with TPS embed.`);
      } else {
        await interaction.editReply('Awwh, I could not parse the TPS data from the server response. The server might be sending an unexpected format.');
        console.log(`[${new Date().toLocaleTimeString()}] Failed to match TPS values with regex. Raw response:`, response);
      }

    } catch (err) {
      console.error(`[${new Date().toLocaleTimeString()}] Error during RCON connection or command execution:`, err);
      let errorMessage = 'Awwh, I cannot connect :<';

      if (err.message.includes('ETIMEDOUT')) { 
        errorMessage += ' (Connection timed out - server is likely offline or RCON port is blocked/incorrect)';
      } else if (err.message.includes('Authentication failed')) {
        errorMessage += ' (RCON authentication failed, please check the password)';
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage += ' (Connection refused - RCON is not running or firewall is blocking)';
      } else if (err.code === 'ENOTFOUND') {
          errorMessage += ' (Server IP address not found)';
      } else {
        errorMessage += ` (An unexpected error occurred: ${err.message})`;
      }
      await interaction.editReply(errorMessage);
    } finally {
      if (connectedSuccessfully && rcon) { 
        try {
          rcon.end();
          console.log(`[${new Date().toLocaleTimeString()}] Disconnected from RCON.`);
        } catch (closeErr) {
          console.error(`[${new Date().toLocaleTimeString()}] Error while closing RCON connection:`, closeErr);
        }
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] RCON connection was not established, skipping rcon.end().`);
      }
    }
  },
};