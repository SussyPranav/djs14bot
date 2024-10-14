const { Schema, model } = require("mongoose");

// Define the schema for welcome channels
const welcomeChannelSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    channelId: {
        type: String,
        required: true,
        unique: true,
    },
    customMessage: {
        type: String,
        default: null,
    },
}, { timestamps: true });

// Create and export the model based on the schema
module.exports = model('WelcomeChannel', welcomeChannelSchema);
