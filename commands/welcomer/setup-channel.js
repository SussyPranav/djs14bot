const { 
    SlashCommandBuilder, 
    ChannelType, 
    PermissionFlagsBits 
} = require('discord.js');

const WelcomeChannel = require('../../schemas/welcomeChannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Manage welcome settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false) // Set permissions for the whole command
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup Welcome Channel')
                .addChannelOption(option =>
                    option.setName('target-channel')
                        .setDescription('Channel to send welcome messages in')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('custom-message')
                        .setDescription('Custom welcome message with variables: {mention-member}, {username}, {server-name}'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove Welcome Channel')
                
                
                .addChannelOption(option =>
                    option.setName('target-channel')
                        .setDescription('Channel to reset welcome messages in')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true))),


    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            const channel = interaction.options.getChannel('target-channel');
            const customMessage = interaction.options.getString('custom-message') || '';

            const query = {
                guildId: interaction.guildId,
                channelId: channel.id,
            };

            try {
                const channelExistsDB = await WelcomeChannel.exists(query);

                if (channelExistsDB) {
                    await interaction.reply({ content: 'This channel has already been set up as a welcome channel.', ephemeral: true });
                    return;
                }

                const newWelcomeChannel = new WelcomeChannel({
                    ...query,
                    customMessage,
                });

                await newWelcomeChannel.save();
                await interaction.reply('Welcome channel setup complete!');
            } catch (error) {
                console.error(`Error in setup: ${error}`);
                await interaction.reply('Failed to set up the welcome channel. If the problem persists, please contact support.');
            }
        } else if (interaction.options.getSubcommand() === 'remove') {


            try {
                await interaction.deferReply();
                const channel = interaction.options.getChannel('target-channel');
                
                const query = {
                    guildId: interaction.guildId,
                    channelId: channel.id,
                };
                console.log(query);



                await WelcomeChannel.findOneAndDelete(query).then(() => { interaction.followUp('Removed!')}).catch(() => { interaction.followUp('Failed.If the problem persists, please contact support ')});


                
                if (!channelExistsDB) {
                    await interaction.reply({ content: 'This channel has already not been set up as a welcome channel.', ephemeral: true });
                    return;
                }
                
                
    

            } catch (error) {
                
            }
        }
    },
};
