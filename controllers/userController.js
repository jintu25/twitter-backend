// const User = require("../models/userSchema");
const bcrypt = require('bcryptjs');
const User = require("../models/userSchema")
const jwt = require('jsonwebtoken');
// const register = async (req, res) => {
//     try {
//         const { name, username, email, password } = req.body; // Corrected variable name
//         if (!name || !username || !email || !password) {
//             return res.status(401).json({
//                 message: "all fields are required.",
//                 success: false
//             });
//         }

//         const existingUser = await User.findOne({ email })
//         if (existingUser) {
//             return res.status(401).json({
//                 message: "user already exists.",
//                 success: false
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 8);
//         await User.create({
//             name,
//             username, // Corrected variable name
//             email,
//             password: hashedPassword
//         });

//         return res.status(201).json({
//             message: "account created successfully...",
//             success: true
//         });
//     } catch (error) {
//         console.log('register error is: ', error);
//         return res.status(500).json({
//             message: "Internal server error",
//             success: false
//         });
//     }
// };

// module.exports = { register };


// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(401).json({
            message: "all fields are required.",
            success: false
        });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
        name,
        username,
        email,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Failed to register user'
        });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "all fields are required.",
                success: false
            });
        }
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid password'
             });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_TOKEN, { expiresIn: '24h' });

        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            user
         });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Failed to log in'
         });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        // Clear the token stored in cookies
        res.clearCookie('token', {expiresIn: new Date(Date.now())});
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to logout'
        });
    }
};

exports.bookmarks = async(req, res) => {
    try {
        const userLoggedInId = req.body.id;
        const tweetId = req.params.id;
        const user = await User.findById(userLoggedInId)
        if(user.bookmarks.includes(tweetId)){
            // remove bookmarks
            await User.findByIdAndUpdate(userLoggedInId, {$pull: {bookmarks: tweetId}})
           return res.status(200).json({
                message: "Remove Bookmarks"
            })
        }
        else{
            // bookmarks 
            await User.findByIdAndUpdate(userLoggedInId, { $push: { bookmarks: tweetId } })
            return res.status(200).json({
                message: "Saved to Bookmarks"
            })
        }
    } catch (error) {
        console.log(error)
    }
}

exports.getProfile = async(req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select("-password")
        return res.status(200).json({
            user,
            message: "my profile"

        })
    } catch (error) {
        console.log('profile error:', error)
    }
}

exports.otherUsers = async(req, res ) => {
    const {id} = req.params;
    const otherUser = await User.find({_id: {$ne: id}});
    if(!otherUser){
        return res.status(401).json({
            message: "currently no any user"
        })
    }
    return res.status(200).json({
        otherUser,
        success: "true"
    })
}

exports.follow = async (req, res) => {
    try {
        // Validate input parameters
        const loggedInUserId = req.body.id;
        const userId = req.params.id;
        if (!loggedInUserId || !userId) {
            return res.status(400).json({ message: 'Invalid input parameters' });
        }
        // Retrieve user information
        const loggedInUser = await User.findById(loggedInUserId);
        const user = await User.findById(userId);
        // Check if the user exists
        if (!loggedInUser || !user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the user is already being followed
        if (user.followers.includes(loggedInUserId)) {
            return res.status(400).json({ message: `${user.name} is already followed by ${loggedInUser.name}` });
        }
        // Update the follow relationship
        await user.updateOne({ $push: { followers: loggedInUserId } });
        await loggedInUser.updateOne({ $push: { following: userId } });
        return res.status(200).json({
            success: true,
            message: `${loggedInUser.name} just followed ${user.name}`
        });
    } catch (error) {
        console.error('Error in follow action:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.unfollow = async (req, res) => {
    try {
        // Validate input parameters
        const loggedInUserId = req.body.id;
        const userId = req.params.id;
        if (!loggedInUserId || !userId) {
            return res.status(400).json({ message: 'Invalid input parameters' });
        }
        // Retrieve user information
        const loggedInUser = await User.findById(loggedInUserId);
        const user = await User.findById(userId);
        // Check if the user exists
        if (!loggedInUser || !user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if the user is not being followed
        if (!user.followers.includes(loggedInUserId)) {
            return res.status(400).json({ message: `${user.name} is not followed by ${loggedInUser.name}` });
        }
        // Update the follow relationship
        await user.updateOne({ $pull: { followers: loggedInUserId } });
        await loggedInUser.updateOne({ $pull: { following: userId } });
        return res.status(200).json({
            success: true,
            message: `${loggedInUser.name} just unfollowed ${user.name}`
        });
    } catch (error) {
        console.error('Error in unfollow action:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


// exports.editProfile = async (req, res) => {
//     try {
//         const userId = req.body.id; // Assuming you are sending the user ID in the request body
//         const { name, username, bio, profilePicture } = req.body; // Assuming you are sending updated profile information

//         // Update the user document in the database
//         await User.findByIdAndUpdate(userId, {
//             $set: {
//                 name,
//                 username,
//                 bio,
//                 profilePicture
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Profile updated successfully'
//         });
//     } catch (error) {
//         console.error('Error updating profile:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update profile'
//         });
//     }
// };

// exports.updateUserProfile = asyncHandler(async (req, res) => {
//     const user = await User.findById(req.user._id);

//     if (user) {
//         user.name = req.body.name || user.name;
//         user.username = req.body.username || user.username;
//         user.pic = req.body.pic || user.pic;
//         if (req.body.password) {
//             user.password = req.body.password;
//         }

//         const updatedUser = await user.save();

//         res.json({
//             _id: updatedUser._id,
//             name: updatedUser.name,
//             email: updatedUser.email,
//             pic: updatedUser.pic,
//             isAdmin: updatedUser.isAdmin,
//             token: generateToken(updatedUser._id),
//         });
//     } else {
//         res.status(404);
//         throw new Error("User Not Found");
//     }
// });

// exports.editProfile = async (req, res) => {
//     try {
//         const userId = req.body.id; // Assuming you are getting user ID from authentication middleware
//         console.log("user is ", userId)
//         const { name, username, bio, profilePicture } = req.body; // Assuming you are sending updated profile information

//         // Update the user document in the database
//         await User.findByIdAndUpdate(userId, {
//             $set: {
//                 name,
//                 username,
//                 bio,
//                 profilePicture
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: 'Profile updated successfully'
//         });
//     } catch (error) {
//         console.error('Error updating profile:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update profile'
//         });
//     }
// };
