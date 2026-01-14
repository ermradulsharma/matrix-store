const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true
    }).then(() => {
        console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    }).catch((err) => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
    });
}

module.exports = connectDatabase;
