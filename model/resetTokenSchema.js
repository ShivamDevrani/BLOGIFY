const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 600 }, // expires after 10 minutes
    },
});

const RESET_TOKEN = mongoose.model('RESET_TOKEN', resetTokenSchema);

module.exports = RESET_TOKEN;
