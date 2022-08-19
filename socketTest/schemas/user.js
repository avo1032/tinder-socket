const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    userPassword: {
        type: String,
        // required: true,
    },
    userName: {
        type: String,
        required: true
    },
    userAge: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        // required: true,
    },
    like: {
        type: Array,
        default: []
    },
    likeMe: {
        type: Array,
        default: []
    },
    bad: {
        type: Array,
        default: []
    },
    badMe: {
        type: Array,
        default: []
    },
    userIntro: {
        type: String,
        default: null
    },
    workPlace: {
        type: String,
        default: null
    },
    category: {
        type: Array,
        default: []
    }
});
UserSchema
    .virtual("userId")
    .get(function () {
        return this
            ._id
            .toHexString();
    });
UserSchema.set("toJSON", {virtuals: true});

module.exports = mongoose.model("User", UserSchema);