const mongoose = require("mongoose");
const validators = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    server_address: {
        type: String,
        default: "unknown",
    },
    first_name: {
        type: String,
        required: [true, "Please Enter First Name"],
        maxLength: [30, "First Name can't exceed 30 characters."],
        minLength: [4, "First Name should be at least 4 characters."]
    },
    last_name: {
        type: String,
        required: [true, "Please Enter Last Name"],
        maxLength: [30, "Last Name can't exceed 30 characters."],
        minLength: [4, "Last Name should be at least 4 characters."]
    },
    name: {
        type: String,
        required: [true, "Please Enter Name"],
        maxLength: [30, "Name can't exceed 30 characters."],
        minLength: [4, "Name should be at least 4 characters."]
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
    },

    email: {
        type: String,
        required: [true, "Please Enter E-mail"],
        unique: true,
        lowercase: true, // Convert email to lowercase
        validate: [validators.isEmail, "Please enter a valid email."]
    },
    password: {
        type: String,
        required: [true, "Please Enter Password"],
        minLength: [8, "Password should be at least 8 characters."]
    },
    mobile_no: {
        type: String,
        required: [true, "Please Enter Mobile Number"],
        unique: true,
    },
    image: {
        public_id: {
            type: String,
            default: "default_id",
            required: true
        },
        url: {
            type: String,
            default: "default_url",
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
    { timestamps: true }
);

// Hash the password before saving to the database
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Generate a JWT token for authentication
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Compare entered password with hashed password in the database
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generating Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(256).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model("User", userSchema);
