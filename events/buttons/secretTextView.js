const { GuildMember, Events, EmbedBuilder } = require('discord.js');
const welcomeChannelSchema = require('../schemas/welcomeChannel');

/**
 * 
 * @param {GuildMember} guildMember 
 */
module.exports = async (interaction) => {
    try {

        if (interaction.customId !== '' ) return;

        try {
            if (i.user.id !== target.id) {
                await i.reply({ content: `${i.user}, This button is not for you!`, ephemeral: true });
            }  else if (i.customId === 'view') {
                const msgEmbed = new EmbedBuilder()
                    .setTitle(`Message sent by ${interaction.user.username} (${interaction.user.id})`)
                    .setDescription(`Message: ${message}`)
                    .setColor("#2f3136")
                    .setTimestamp();

                await i.reply({ embeds: [msgEmbed], components: [], ephemeral: true });
            }
        } catch (error) {
            console.error('An error occurred during the collection:', error);
            await i.reply({ content: 'An error occurred while processing your request. Please try again later.', ephemeral: true });
        }
   

    } catch (error) {
        console.log(`Error in ${__filename}: \n`, error);
    }
};
