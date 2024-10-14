const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    venue: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    dayAndDate: { type: String, required: true }, // Could store in the format 'DD-MM-YYYY'
    theme: { type: String, required: true },
    description: { type: String, required: true },
    organizedBy: { type: String, required: true },
    format: { type: String, required: true },
    agenda: { type: String, required: true },
    keynoteSpeaker: { type: String }, // Optional
    registrationProcess: { type: String, required: true },
    rsvpDeadline: { type: String }, // Optional
    requirements: { type: String }, // Optional
    participantLimit: { type: Number }, // Optional
    contactInformation: { type: String, required: true },
    reminderTime: { type: Date, required: true }, // Time to send reminder
    channelId: { type: String, required: true },  // Where to send the reminder
});

module.exports = mongoose.model('Event', eventSchema);
