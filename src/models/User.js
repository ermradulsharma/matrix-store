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
        minLength: [2, "First Name should be at least 2 characters."]
    },
    last_name: {
        type: String,
        required: [true, "Please Enter Last Name"],
        maxLength: [30, "Last Name can't exceed 30 characters."],
        minLength: [2, "Last Name should be at least 2 characters."]
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
        minLength: [8, "Password should be at least 8 characters."],
        select: false
    },
    mobile_no: {
        type: String,
        required: [true, "Please Enter Mobile Number"],
        unique: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: "Please enter a valid 10-digit mobile number"
        }
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
        enum: ['super_admin', 'admin', 'manager', 'provider', 'customer'],
        default: 'customer'
    },
    managedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
        type: String
    }],
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

// Virtual field for full name
userSchema.virtual('name').get(function () {
    return `${this.first_name} ${this.last_name}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", userSchema);

