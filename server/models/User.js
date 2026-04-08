import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
        role: {
            type: String,
            enum: ["user", "stakeholder", "admin"],
            default: "user",
        },
    },
    { timestamps: true }
);

// Use fallback for ES Module interop with bcryptjs
const getBcrypt = () => bcrypt.default || bcrypt;

// Hash password before saving
UserSchema.pre("save", async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return;

    const b = getBcrypt();
    const salt = await b.genSalt(12);
    this.password = await b.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
UserSchema.methods.comparePassword = async function (candidatePassword) {
    const b = getBcrypt();
    return b.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model("User", UserSchema);
export default User;
