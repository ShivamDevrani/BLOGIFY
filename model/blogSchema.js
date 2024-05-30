const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true,
    },
    publisherId:{
        type:mongoose.Schema.ObjectId,
        required:true
    },
    blogType: {
        type:String,
        enum: ['personal', 'professional', 'educational', 'lifestyle', 'technology', 'food', 'entertainment'],
        required: true,
    },
    comments: [{
        commentedBy: {
            type: String,
            required: true,
        },
        commenterId:{
            type:mongoose.Schema.ObjectId,
            required:true,
            ref:'USER'
        },
        commenterProfile:{
            type:String,
            default:"/uploads/default.png",
        },
        commentBody: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'USER'
    }]
}, { timestamps: true });

const BLOG = mongoose.model('BLOG', blogSchema);

module.exports = BLOG;
