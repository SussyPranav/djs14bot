const { SlashCommandBuilder } = require('discord.js');
const Event = require('../../schemas/eventRS.js'); // Assuming your schema is in 'schemas/eventR.js'
const cron = require('node-cron');

// Slash command definition
module.exports = {
    data: new SlashCommandBuilder()
        .setName('createevent')
        .setDescription('Create a new event with a reminder')
        .addStringOption(option => option.setName('title').setDescription('Event title').setRequired(true))
        .addStringOption(option => option.setName('venue').setDescription('Event venue').setRequired(true))
        .addStringOption(option => option.setName('starttime').setDescription('Start time (YYYY-MM-DD HH:mm)').setRequired(true))
        .addStringOption(option => option.setName('endtime').setDescription('End time (YYYY-MM-DD HH:mm)').setRequired(true))
        .addStringOption(option => option.setName('dayanddate').setDescription('Day and date of the event').setRequired(true))
        .addStringOption(option => option.setName('theme').setDescription('Event theme').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Event description').setRequired(true))
        .addStringOption(option => option.setName('organizedby').setDescription('Organizer').setRequired(true))
        .addStringOption(option => option.setName('format').setDescription('Event format (in-person, virtual, hybrid)').setRequired(true))
        .addStringOption(option => option.setName('agenda').setDescription('Event agenda or schedule').setRequired(true))
        .addStringOption(option => option.setName('registration').setDescription('Registration process').setRequired(true))
        .addStringOption(option => option.setName('contactinfo').setDescription('Contact information').setRequired(true))
        .addStringOption(option => option.setName('remindertime').setDescription('Reminder time (optional)').setRequired(false)),

    async execute(interaction) {
        // Collect the options provided by the user
        const title = interaction.options.getString('title');
        const venue = interaction.options.getString('venue');
        const startTime = new Date(interaction.options.getString('starttime'));
        const endTime = new Date(interaction.options.getString('endtime'));
        const dayAndDate = interaction.options.getString('dayanddate');
        const theme = interaction.options.getString('theme');
        const description = interaction.options.getString('description');
        const organizedBy = interaction.options.getString('organizedby');
        const format = interaction.options.getString('format');
        const agenda = interaction.options.getString('agenda');
        const registration = interaction.options.getString('registration');
        const contactInfo = interaction.options.getString('contactinfo');
        const reminderTimeInput = interaction.options.getString('remindertime');

        // Default reminder time is 10 minutes before the start if not provided
        const reminderTime = reminderTimeInput ? new Date(reminderTimeInput) : new Date(startTime.getTime() - 10 * 60 * 1000);

        try {
            // Save event to MongoDB
            const event = new Event({
                title,
                venue,
                startTime,
                endTime,
                dayAndDate,
                theme,
                description,
                organizedBy,
                format,
                agenda,
                registrationProcess: registration,
                contactInformation: contactInfo,
                reminderTime,
                channelId: interaction.channel.id
            });

            await event.save();

            // Send confirmation message
            await interaction.reply(`Event "${title}" created successfully! A reminder will be sent at ${reminderTime.toLocaleString()}.`);

            // Schedule reminder
            scheduleReminder(event, interaction);
        } catch (error) {
            console.error('Error saving event:', error);
            await interaction.reply('An error occurred while creating the event. Please try again.');
        }
    }
};

// Schedule the reminder for the event
function scheduleReminder(event, interaction) {
    const now = new Date();

    if (event.reminderTime > now) {
        const timeDiff = event.reminderTime - now;
        setTimeout(async () => {
            const channel = await interaction.client.channels.fetch(event.channelId);
            if (channel) {
                channel.send(`**Event Reminder!**\n
                **Event Title:** ${event.title}\n
                **Venue:** ${event.venue}\n
                **Time:** ${formatDate(event.startTime)} - ${formatDate(event.endTime)}\n
                **Day and Date:** ${event.dayAndDate}\n
                **Theme:** ${event.theme}\n
                **Description:** ${event.description}\n
                **Organized By:** ${event.organizedBy}\n
                **Format:** ${event.format}\n
                **Agenda:** ${event.agenda}\n
                **Registration Process:** ${event.registrationProcess}\n
                **Contact Information:** ${event.contactInformation}`);
            }

            // Delete event after sending the reminder
            await Event.deleteOne({ _id: event._id });
        }, timeDiff);
    }
}

// Utility function to format date and time
function formatDate(date) {
    return new Date(date).toLocaleString('en-US', { hour12: true });
}
