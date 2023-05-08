const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    // user_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true,
    //     ref: "User"
    // },
    username: {
        type: String,
        required: [true, "Please add the user name"],
        unique: [true, "Username already taken"]
    },
    email: {
        type: String,
        required: [true, "Please add the email"],
        unique: [true, "Email address already taken"]
    },
    password: {
        type: String,
        required: [true, "Please add the user password"],
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
