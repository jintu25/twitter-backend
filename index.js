const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();
const databaseConnection = require("./config/database");
const cookieParser = require('cookie-parser');
const userRoute = require("./routes/userRouter");
const tweetRoute = require("./routes/tweetRoute");
const cors = require("cors");
require('dotenv').config();

databaseConnection();

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Define allowed origins
const allowedOrigins = ['https://twitter25.netlify.app', 'https://twitter-backend-kes7.vercel.app'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    optionSuccessStatus: 200
}));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/tweet", tweetRoute);

app.use((err, req, res, next) => {
    console.error('Server error: ', err);
    res.status(500).json({
        message: 'Internal server error',
        success: false
    });
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.get("/hello", (req, res) => {
    res.send("Hello, this is hello. Why doesn't it work?");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
