const express = require("express")
const PORT = process.env.PORT || 3000
const app = express()
const databaseConnection = require("./config/database")
const cookieParser = require('cookie-parser')
const userRoute = require("./routes/userRouter");
const tweetRoute = require("./routes/tweetRoute")
const cors = require("cors")
require('dotenv').config()


databaseConnection()

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // allow credentials like cookies to be sent with the request
}));

app.use("/api/v1/user", userRoute)
app.use("/api/v1/tweet", tweetRoute )

app.use((err, req, res, next) => {
    console.log('server error is: ', err)
    console.error("server error stack: ", err.stack);
    res.status(500).json({
        message: 'Internal server error',
        success: false
    });
});

app.get("/", (req, res) => {
    res.send("server is running")
})

app.listen(PORT, ()  => {
    console.log(`server is running on port ${PORT}`)
})
