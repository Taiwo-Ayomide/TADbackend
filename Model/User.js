const moongoose = require("mongoose");
const UserSchema = new moongoose.Schema(
    {
        firstname: { type: String },
        lastname: { type: String },
        age: { type: String },
        gender: { type: String },
        religion: { type: String },
        phone: { type: String },
        email: { type: String },
        state: { type: String },
        password: { type: String },
        passportImageUrl: { type: String },
        isAdmin: {
            type: Boolean,
            default: false
        },
        isAdmitted: {
            type: Boolean,
            default: false
        },
        isBanned: {
            type: Boolean,
            default: false
        },
        isRejected: {
            type: Boolean,
            default: false
        },
        isPayed: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
    }, { timestamps: true }, 
);



module.exports = moongoose.model("User", UserSchema);