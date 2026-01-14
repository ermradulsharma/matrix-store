const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    address_1: {
        type: String,
        required: [true, "Please enter Address Line 1."],
        trim: true
    },
    address_2: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        required: [true, "Please enter City."],
        trim: true
    },
    state: {
        type: String,
        required: [true, "Please enter State."],
        trim: true
    },
    country: {
        type: String,
        required: [true, "Please enter Country."],
        trim: true,
        default: "India" // Assuming India based on context (phone/pin code format)
    },
    pincode: {
        type: String,
        required: [true, "Please enter Pincode."],
        trim: true
    },
    // Adding mobile number as it's often associated with delivery addresses
    mobile: {
        type: String,
        required: [true, "Please enter Mobile Number."],
        trim: true,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v); // Basic 10-digit validation
            },
            message: props => `${props.value} is not a valid mobile number!`
        }
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
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
            required: true,
            index: "2dsphere"
        }
    }
}, {
    timestamps: true
});

addressSchema.index({ location: "2dsphere" });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
