const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    address_1: {
        type: String,
        required: [true, "Please enter Address Line 1."]
    },
    address_2: {
        type: String,
    },
    city: {
        type: String,
        required: [true, "Please enter City."]
    },
    state: {
        type: String,
        required: [true, "Please enter State."]
    },
    country: {
        type: String,
        required: [true, "Please enter Country."]
    },
    pincode: {
        type: String,
        required: [true, "Please enter Pincode."]
    },
    latitude: {
        type: Number, // Use Number type for latitude
        required: true
    },
    longitude: {
        type: Number, // Use Number type for longitude
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

addressSchema.index({ location: "2dsphere" }); // Create a geospatial index

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
