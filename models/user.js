const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
  fullName: {
    type: String,
    required: false, // Required only during full signup (handled in route)
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !!this.fullName;
    },
    validate: {
      validator: function (value) {
        if (!value) return true; // Allow undefined temporarily
        if (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$")) return true;

        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
      },
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    },
  },
  profileImageURL: {
    type: String,
    default: "/images/default.png",
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN"],
    default: "USER",
  },
  otp: {
    type: String,
    select: false, // prevent auto-fetching for security
  },
  otpExpiry: {
    type: Date,
    select: false,
  },
  otpUsed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// ✅ Virtual: Check if user completed full signup
userSchema.virtual("isFullyRegistered").get(function () {
  return !!(this.fullName && this.password);
});

// ✅ Password Hash Middleware (✅ only updated this block)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password || this.password.startsWith("$2")) {
    return next();
  }
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ✅ Static: Match password & return token
userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const token = createTokenForUser(user);
  return token;
});

const User = model("user", userSchema);
module.exports = User;
