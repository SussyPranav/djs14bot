const { 
    ComponentType, 
    ButtonBuilder, 
    ButtonStyle, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChannelType, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder 
} = require('discord.js');

const colorNamesToHex = {
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#008000",
    "yellow": "#FFFF00",
    "orange": "#FFA500",
    "purple": "#800080",
    "pink": "#FFC0CB",
    "black": "#000000",
    "white": "#FFFFFF",
    "gray": "#808080",
    "brown": "#A52A2A"
    // Add more colors as needed
};

function convertColorToHex(color) {
    if (color.startsWith('#')) {
        return color;
    }
    const hex = colorNamesToHex[color.toLowerCase()];
    return hex || null;
}

const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Send a message using bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName("announce")
                .setDescription('Send an announcement using bot')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('Where do you want to announce?')
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('text')
                .setDescription('Send a text using bot')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Your text')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Where do you want to echo?')
                        .addChannelTypes(ChannelType.GuildText)
                )
        ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'announce') {
            let embedTitle = '';
            let embedDescription = '';
            let embedColor = '';
            let embedImage = '';
            let embedThumbnail = '';

            const editTitle = new ButtonBuilder()
                .setCustomId('titleEdit0')
                .setLabel('Edit Title')
                .setStyle(ButtonStyle.Secondary);

            const editDescription = new ButtonBuilder()
                .setCustomId('titleEdit')
                .setLabel('Edit Description')
                .setStyle(ButtonStyle.Secondary);

            const editColor = new ButtonBuilder()
                .setCustomId('titleEdit1')
                .setLabel('Change Color')
                .setStyle(ButtonStyle.Secondary);

            const editImage = new ButtonBuilder()
                .setCustomId('titleEdit3')
                .setLabel('Edit Large Image')
                .setStyle(ButtonStyle.Secondary);

            const editThumbnail = new ButtonBuilder()
                .setCustomId('titleEdit4')
                .setLabel('Edit Small Image')
                .setStyle(ButtonStyle.Secondary);

            const sendEmbed = new ButtonBuilder()
                .setCustomId('send')
                .setLabel('Send')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(sendEmbed);
            const row2 = new ActionRowBuilder().addComponents(editTitle, editDescription, editColor, editImage, editThumbnail);

            const initialEmbed = new EmbedBuilder()
                .setTitle('TITLE')
                .setDescription('DESCRIPTION')
                .setColor('#2B2D31')
                .setThumbnail('https://cdn.discordapp.com/attachments/1196720952688508960/1243129163313844344/standard_17.gif?ex=66b72ec0&is=66b5dd40&hm=6fb79b2ecd48177c2cba36075218401119ff9732c6fc0d371af41ea444c61d5b&')
                .setImage('https://cdn.discordapp.com/attachments/1196720952688508960/1243129162919710731/standard_18.gif?ex=66b72ec0&is=66b5dd40&hm=cde8a36271aeed55ccb7ce9ec9a7b53043cb854910056b63555e4a6187341abf&');

            const response = await interaction.reply({
                embeds: [initialEmbed],
                components: [row2, row],
            });

            const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 600_000 });

            collector.on('collect', async i => {
                try {
                    if (i.customId === 'send') {
                        const finalEmbed = new EmbedBuilder();
                        if (embedTitle) finalEmbed.setTitle(embedTitle);
                        if (embedDescription) finalEmbed.setDescription(embedDescription);
                        if (embedColor) finalEmbed.setColor(embedColor);

                        // Validate image URL before setting
                        if (embedImage && urlPattern.test(embedImage)) finalEmbed.setImage(embedImage);
                        if (embedThumbnail && urlPattern.test(embedThumbnail)) finalEmbed.setThumbnail(embedThumbnail);

                        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
                        await targetChannel.send({ embeds: [finalEmbed] });
                        await response.delete();
                        await i.reply({ content: 'Embed sent!', ephemeral: true });
                    } else if (i.customId === 'titleEdit0') {
                        const modalT = new ModalBuilder()
                            .setCustomId('titleModal')
                            .setTitle('Edit Title');

                        const titleInput = new TextInputBuilder()
                            .setCustomId('embedTitle')
                            .setLabel("Title")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Your New Title')
                            .setRequired(true);

                        modalT.addComponents(new ActionRowBuilder().addComponents(titleInput));
                        await i.showModal(modalT);
                    } else if (i.customId === 'titleEdit') {
                        const modalS = new ModalBuilder()
                            .setCustomId('descriptionModal')
                            .setTitle('Edit Description');

                        const descriptionInput = new TextInputBuilder()
                            .setCustomId('embedDescription')
                            .setLabel("Description")
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(1000)
                            .setMinLength(10)
                            .setPlaceholder('Your New Description')
                            .setRequired(true);

                        modalS.addComponents(new ActionRowBuilder().addComponents(descriptionInput));
                        await i.showModal(modalS);
                    } else if (i.customId === 'titleEdit1') {
                        const modalC = new ModalBuilder()
                            .setCustomId('colorModal')
                            .setTitle('Change Color');

                        const colorInput = new TextInputBuilder()
                            .setCustomId('embedColor')
                            .setLabel("Color")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('#2B2D31 or red')
                            .setRequired(true);

                        modalC.addComponents(new ActionRowBuilder().addComponents(colorInput));
                        await i.showModal(modalC);
                    } else if (i.customId === 'titleEdit3') {
                        const modalI = new ModalBuilder()
                            .setCustomId('imageModal')
                            .setTitle('Edit Large Image');

                        const imageInput = new TextInputBuilder()
                            .setCustomId('embedImage')
                            .setLabel("Large Image URL")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('https://example.com/image.png')
                            .setRequired(true);

                        modalI.addComponents(new ActionRowBuilder().addComponents(imageInput));
                        await i.showModal(modalI);
                    } else if (i.customId === 'titleEdit4') {
                        const modalT = new ModalBuilder()
                            .setCustomId('thumbnailModal')
                            .setTitle('Edit Small Image');

                        const thumbnailInput = new TextInputBuilder()
                            .setCustomId('embedThumbnail')
                            .setLabel("Small Image URL")
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('https://example.com/thumbnail.png')
                            .setRequired(true);

                        modalT.addComponents(new ActionRowBuilder().addComponents(thumbnailInput));
                        await i.showModal(modalT);
                    }

                    const filter = (modal) => 
                        modal.customId === 'titleModal' ||
                        modal.customId === 'descriptionModal' ||
                        modal.customId === 'colorModal' ||
                        modal.customId === 'imageModal' ||
                        modal.customId === 'thumbnailModal';

                    const submitted = await i.awaitModalSubmit({ filter, time: 180_000 });

                    if (submitted) {
                        if (submitted.customId === 'titleModal') {
                            embedTitle = submitted.fields.getTextInputValue('embedTitle');
                            initialEmbed.setTitle(embedTitle);
                        } else if (submitted.customId === 'descriptionModal') {
                            embedDescription = submitted.fields.getTextInputValue('embedDescription');
                            initialEmbed.setDescription(embedDescription);
                        } else if (submitted.customId === 'colorModal') {
                            const colorInput = submitted.fields.getTextInputValue('embedColor');
                            const hexColor = convertColorToHex(colorInput);
                            if (hexColor) {
                                embedColor = hexColor;
                                initialEmbed.setColor(embedColor);
                            } else {
                                await submitted.reply({ content: 'Incorrect color format', ephemeral: true });
                            }
                        } else if (submitted.customId === 'imageModal') {
                            const imageInput = submitted.fields.getTextInputValue('embedImage');
                            if (urlPattern.test(imageInput)) {
                                embedImage = imageInput;
                                initialEmbed.setImage(embedImage);
                            } else {
                                await submitted.reply({ content: 'Incorrect image URL format', ephemeral: true });
                            }
                        } else if (submitted.customId === 'thumbnailModal') {
                            const thumbnailInput = submitted.fields.getTextInputValue('embedThumbnail');
                            if (urlPattern.test(thumbnailInput)) {
                                embedThumbnail = thumbnailInput;
                                initialEmbed.setThumbnail(embedThumbnail);
                            } else {
                                await submitted.reply({ content: 'Incorrect thumbnail URL format', ephemeral: true });
                            }
                        }

                        await submitted.deferUpdate();
                        const updatedRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('send')
                                .setLabel('Send')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(false)
                        );
                        await response.edit({
                            embeds: [initialEmbed],
                            components: [row2, updatedRow]
                        });
                    }
                } catch (error) {
                    if (error.code === 'InteractionAlreadyReplied') {
                        console.error('Error handling interaction:', error);
                    } else {
                        console.error('Unexpected error:', error);
                    }
                }
            });

            collector.on('end', async collected => {
                try {
                    const disabledRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('send')
                            .setLabel('Send')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );

                    const endedEmbed = new EmbedBuilder()
                        .setTitle('Interaction ended')
                        .setDescription('You no longer can interact with this button. Since the interaction time is over. Please rerun the command.')
                        .setColor('#FF0000'); // Optional, change to any color you prefer

                    await response.edit({
                        embeds: [endedEmbed],
                        components: [row2, disabledRow]
                    });
                } catch (error) {
                    console.error('Error handling collector end:', error);
                }
            });
        } else if (interaction.options.getSubcommand() === 'text') {
            const text = interaction.options.getString('text');
            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
            await targetChannel.send({ content: text });
            await interaction.reply({ content: 'Text sent!', ephemeral: true });
        }
    },
};
