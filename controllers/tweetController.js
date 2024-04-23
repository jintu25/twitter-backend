const tweet = require("../models/tweetSchema");
const User = require("../models/userSchema");
const createTweet = async(req, res) => {
    try {
        const { description, id } = req.body;
        if(!description || !id) {
            return res.status(401).json({
                success: false,
                message: "fields are required"
            })
        }
        const user = await User.findById(id).select("-password")
        await tweet.create({
            description,
            userId: id,
            userDetails: user
        })
        return res.status(201).json({
            success: true,
            message: "Tweet created successfully.."
        })
    } catch (error) {
        console.log('error', error)
    }
}

const deleteTweet = async(req, res) => {
    try {
        const { id } = req.params;
        await tweet.findByIdAndDelete(id)
        res.status(200).json({
            success: true,
            message: "Tweet deleted successfully..."
        })
    } catch (error) {
        console.log(error)
    }
}

const handleLikeOrDislike = async (req, res) => {
    try {
        const loggedInUserId = req.body.id; // More descriptive variable name
        const tweetId = req.params.id;
        const existingTweet = await tweet.findById(tweetId);

        if (!existingTweet) {
            return res.status(404).json({ message: "Tweet not found" });
        }
        const hasLiked = existingTweet.like.includes(loggedInUserId);

        let updatedTweet;

        if (hasLiked) {
            // Unlike the tweet
            updatedTweet = await tweet.findByIdAndUpdate(
                tweetId,
                { $pull: { like: loggedInUserId } },
                { new: true }
            );
        } else {
            // Like the tweet
            updatedTweet = await tweet.findByIdAndUpdate(
                tweetId,
                { $push: { like: loggedInUserId } },
                { new: true }
            );
        }

        const responseMessage = hasLiked ? "User disliked" : "user liked";

        res.status(200).json({ message: responseMessage, updatedTweet });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error liking/disliking tweet" });
    }
};

const getAllTweets = async (req, res) => {
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id);
        const loggedInUserTweet = await tweet.find({ userId: id })
        const followingUserTweet = await Promise.all(loggedInUser.following.map((otherUserId) => {
            return tweet.find({ userId: otherUserId })
        }))
        return res.status(200).json({
            success: true,
            tweets: loggedInUserTweet.concat(...followingUserTweet)
        })
    } catch (error) {
        console.log(error)
    }
}

const getFollowingTweets = async (req, res) => {
    try {
        const id = req.params.id;
        const loggedInUser = await User.findById(id);
        const followingUserTweet = await Promise.all(loggedInUser.following.map((otherUserId) => {
            return tweet.find({ userId: otherUserId })
        }))
        return res.status(200).json({
            success: true,
            tweets: [].concat(...followingUserTweet)
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    createTweet,
    deleteTweet,
    handleLikeOrDislike,
    getAllTweets,
    getFollowingTweets
};