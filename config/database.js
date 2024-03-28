require('dotenv').config({ path: '../config.env' })

const mongoose = require("mongoose")

const databaseConnection = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("mongodb is connected")
        }).catch(err => {
            console.log("error is: ", err)
        })
}

module.exports = databaseConnection;
