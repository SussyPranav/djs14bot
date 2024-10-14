const { GuildMember, Events, EmbedBuilder } = require('discord.js');
const welcomeChannelSchema = require('../schemas/welcomeChannel');

/**
 * 
 * @param {GuildMember} guildMember 
 */
module.exports = async (guildMember) => {
    try {
        if (guildMember.user.bot) return;

        const welcomeConfigs = await welcomeChannelSchema.find({
            guildId: guildMember.guild.id
        });

        if (!welcomeConfigs.length) return;

        for (const welcomeConfig of welcomeConfigs) {
            let targetChannel = guildMember.guild.channels.cache.get(welcomeConfig.channelId);

            if (!targetChannel) {
                try {
                    targetChannel = await guildMember.guild.channels.fetch(welcomeConfig.channelId);
                } catch (fetchError) {
                    console.log(fetchError);
                    continue;
                }
            }

            if (!targetChannel) {
                try {
                    await welcomeChannelSchema.findOneAndDelete({
                        guildId: guildMember.guild.id,
                        channelId: welcomeConfig.channelId
                    });
                } catch (deleteError) {
                    console.log(deleteError);
                }
                continue;
            }



            try {

                //const embed = {
                //    "content": null,
                //    "embeds": [
                //        {
                //            "color": 0x2B2D31,
                //            "fields": null,
                //            "description": [
                //                "<:boostcoin:1264251423663849502> Welcome to **{server-name}**",
                //                "─────────── • ◆ • ────────────",
                //                "<a:User:1264251983557169306> User mention :-  **${member-mention}**",
                //                "",
                //                `<a:User:1264251983557169306> Userid :- **${guildMember.id}**`,
                //                "─────────── • ◆ • ────────────",
                //                "<a:Arrow_White:1264251397696651335> Make sure to Read our Rules! >",
                //                
                //                "─────────── • ◆ • ────────────",
                //                ""
                //            ].join("\n"), // Joining array into a single string
                //            "image": {
                //                "url": ""
                //            }
                //        }
                //    ],
                //    "components": null
                //};
                const embed = new EmbedBuilder()
                .setImage('https://cdn.discordapp.com/attachments/1190650792072466563/1264248952228810785/standard_28.gif?ex=669d2f16&is=669bdd96&hm=942780491c09a7ca43ccdcd777ccb0c27a468acd8b3352d7cbb3c7eec01a02a0&')
                .setDescription(`<:boostcoin:1264251423663849502> Welcome to **${guildMember.guild.name}**\n─────────── • ◆ • ────────────\n<a:User:1264251983557169306> User mention :-  **<@${guildMember.id}>**\n\n<a:User:1264251983557169306> Userid :- **${guildMember.id}**\n─────────── • ◆ • ────────────\n<a:Arrow_White:1264251397696651335> Make sure to Read our Rules! \n─────────── • ◆ • ────────────`)
                .setColor('#2B2D31')
                .setTimestamp()
                .setThumbnail(guildMember.user.avatarURL());
                //console.log(guildMember.avatar)
                const customMessage = welcomeConfig.customMessage || { embeds: [embed] };
                //const welcomeMessage = customMessage.replace('{mention-member}', `<@${guildMember.id}>`)
                //    .replace('{username}', guildMember.user.username)
                //    .replace('{server-name}', guildMember.guild.name);
                

                //await targetChannel.send(welcomeMessage);



                if (typeof customMessage === 'string') {
                    const welcomeMessage = customMessage
                        .replace('{mention-member}', `<@${guildMember.id}>`)
                        .replace('{username}', guildMember.user.username)
                        .replace('{server-name}', guildMember.guild.name);
                    await targetChannel.send(welcomeMessage);
                } else {
                    await targetChannel.send(customMessage);
                }
            } catch (sendError) {
                console.log(sendError);
            }


            
        }
    } catch (error) {
        console.log(`Error in ${__filename}: \n`, error);
    }
};
