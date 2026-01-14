const Address = require("../models/Address");
const ErrorHandler = require("../utils/errorHandler");

// Create Address
exports.createAddress = async (userId, data) => {
    const {
        address_1,
        address_2,
        city,
        state,
        country,
        pincode,
        mobile,
        latitude,
        longitude
    } = data;

    // Construct Location GeoJSON
    const location = {
        type: "Point",
        coordinates: [longitude, latitude]
    };

    const address = await Address.create({
        user_id: userId,
        address_1,
        address_2,
        city,
        state,
        country: country || "India",
        pincode,
        mobile,
        latitude,
        longitude,
        location
    });

    return address;
};

// Get All Addresses for User
exports.getUserAddresses = async (userId) => {
    return await Address.find({ user_id: userId });
};

// Get Single Address
exports.getAddressById = async (id, userId) => {
    const address = await Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new ErrorHandler("Address not found", 404);
    }
    return address;
};

// Update Address
exports.updateAddress = async (id, userId, data) => {
    let address = await Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new ErrorHandler("Address not found", 404);
    }

    const {
        address_1,
        address_2,
        city,
        state,
        country,
        pincode,
        mobile,
        latitude,
        longitude
    } = data;

    if (address_1) address.address_1 = address_1;
    if (address_2) address.address_2 = address_2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (country) address.country = country;
    if (pincode) address.pincode = pincode;
    if (mobile) address.mobile = mobile;

    if (latitude !== undefined && longitude !== undefined) {
        address.latitude = latitude;
        address.longitude = longitude;
        address.location = {
            type: "Point",
            coordinates: [longitude, latitude]
        };
    }

    await address.save();
    return address;
};

// Delete Address
exports.deleteAddress = async (id, userId) => {
    const address = await Address.findOne({ _id: id, user_id: userId });
    if (!address) {
        throw new ErrorHandler("Address not found", 404);
    }
    await address.deleteOne();
};
