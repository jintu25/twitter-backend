const mongoose = require("mongoose")

const tweetSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    like: {
        type: Array,
        default: []
    },
    // comment: {
    //     type: String,
    //     required: true,
    // },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

const tweet = mongoose.model("tweet", tweetSchema)

module.exports = tweet;