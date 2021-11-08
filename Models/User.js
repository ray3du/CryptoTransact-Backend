const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    email: {
        required: true,
        type: String
    },
    phoneNumber: {
        required: true,
        type: Number
    },
    password: {
        required: true,
        type: String
    },
    confirmPassword: {
        required: true,
        type: String
    },
    loggedIn: {
        required: true,
        type: Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now()
    }
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;