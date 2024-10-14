const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits, ComponentType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Use your ban hammer and ban someone')
		
		


		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member you want to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setDMPermission(false),

	async execute(interaction) {
		const confirm = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm Ban')
			.setStyle(ButtonStyle.Danger);

		const cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';


		const banConfirmationEmbed = new EmbedBuilder()
		//.setTitle("Ban Confirmation")
		.setDescription(`_${interaction.user}, are you sure you want to ban **${target.username}** | For **${reason}**?_`)
		.setColor("#2f3136")
		.setTimestamp();
		
		
		const response = await interaction.reply({
			//content: `${interaction.user}, are you sure you want to ban ${target.username} for reason: ${reason}?`,
			embeds: [banConfirmationEmbed],
			components: [row],
		});
		
		const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 10_000 });
		
		collector.on('collect', async i => {
			try {
				///////////////////////////////////////////////////////////////////////////////////////
				//EMBEDS

				const cancelEmbed = new EmbedBuilder()
					//.setTitle("Cancelled")
					.setDescription(`**_Ban cancelled, ${target.username} wasn't banned_**`)
					.setColor("#2f3136")
					.setTimestamp();

				const confirmEmbed = new EmbedBuilder()
					.setColor("#2f3136")
					//.setTitle('Confirmed')
					.setDescription(`**_Ban Confirmed, ${target.username} has been banned | ${reason}_** `)
					.setTimestamp();

				///////////////////////////////////////////////////////////////////////////////////////

				if (i.user.id !== interaction.user.id) {
					await i.reply({ content: `${i.user}, This button is not for you!`, ephemeral: true });
				} else if (i.customId === 'confirm') {
					await interaction.guild.members.ban(target, { reason: ` Banned by ${interaction.user.username} (${interaction.user.id}) for ${reason}` });
					await i.update({embeds: [confirmEmbed], components: [] }); // content: ``, 
				} else if (i.customId === 'cancel') {
					cancel.setDisabled(true);
					confirm.setDisabled(true);
					await i.update({embeds: [cancelEmbed], components: [row] }); // content: ``, 
				}
			} catch (error) {
				console.error('An error occurred during the collection:', error);
				await i.reply({ content: 'An error occurred while processing your request. Please try again later. If you face this again, please contact us [here](<https://discord.gg/q2Y7kUVp>)!', ephemeral: true });
			}
		});
		
		collector.on('end', (collected) => {
			cancel.setDisabled(true);
			confirm.setDisabled(true);

			const timeEnd = new EmbedBuilder()
			.setDescription(`_Time limit reached. No actions were taken. ${target.username} survived!_`)
			
			.setTimestamp()
			.setColor("#2f3136");

			if (collected.size === 0) {
				response.edit({
					//content: `_Time limit reached. No actions were taken. ${target.username} survived!_`,
					components: [row],
					embeds: [timeEnd],
				});
			} else { //change THIS SHIT ASAP!
				//response.edit({
					//components: [row]
				//});
				//interaction.channel.send({content: 'Uh Oh! Please report this message to @sussypranav' });
				
			}
		});
	},
};
