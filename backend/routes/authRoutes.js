
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function setAuthCookie(res, userId) {
  const token = jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
  };
}

async function getLoggedInUser(req) {
  const token = req.cookies?.token;

  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.userId);
}

// REGISTER STUDENT
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Please complete all fields.",
      });
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({
        message: "Please enter a valid name.",
      });
    }

    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        message:
          "Username must be 3–30 characters and contain only letters, numbers, and underscores.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 254
    ) {
      return res.status(400).json({
        message: "Please enter a valid email.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be 8–72 characters long.",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanUsername },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.email === cleanEmail
            ? "This email is already registered."
            : "This username is already taken.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    setAuthCookie(res, user._id);

    return res.status(201).json({
      message: "Registration successful.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "That email or username is already registered.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
});

// LOGIN STUDENT
// Login accepts either email or username in the "login" field.
router.post("/login", async (req, res) => {
  try {
    const { email, username, login, password } = req.body;
    const loginValue = login ?? email ?? username;

    if (
      typeof loginValue !== "string" ||
      typeof password !== "string" ||
      !loginValue.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your username or email and password.",
      });
    }

    const value = loginValue.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: value }, { username: value }],
    }).select("+password");

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        message: "Invalid username/email or password.",
      });
    }

    setAuthCookie(res, user._id);

    return res.json({
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

// CHECK CURRENT LOGIN
router.get("/me", async (req, res) => {
  try {
    const user = await getLoggedInUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Not logged in.",
      });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login.",
    });
  }
});

// CHANGE PASSWORD
router.post("/change-password", async (req, res) => {
  try {
    const user = await getLoggedInUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Please log in again.",
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Please complete all password fields.",
      });
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({
        message: "New password must be 8–72 characters long.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match.",
      });
    }

    const userWithPassword = await User.findById(user._id)
      .select("+password");

    const matches = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );

    if (!matches) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    userWithPassword.password = await bcrypt.hash(newPassword, 12);
    await userWithPassword.save();

    return res.json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      message: "Could not change password.",
    });
  }
});

// LOGOUT STUDENT
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    message: "Logged out successfully.",
  });
});


router.delete("/delete-account", async (req, res) => {
  try {
    const user = await getLoggedInUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Please log in before deleting your account.",
      });
    }

    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        message: "Please enter your current password.",
      });
    }

    const userWithPassword = await User.findById(user._id)
      .select("+password");

    if (!userWithPassword) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: "Incorrect password. Your account was not deleted.",
      });
    }

    await User.findByIdAndDelete(user._id);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.json({
      message: "Your account has been deleted successfully.",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Unable to delete your account. Please try again.",
    });
  }
});


router.put("/profile", async (req, res) => {
  try {
    const user = await getLoggedInUser(req);

    if (!user) {
      return res.status(401).json({
        message: "Please log in first.",
      });
    }

    const { name, username, email } = req.body;

    if (
      typeof name !== "string" ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      !name.trim() ||
      !username.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Name, username, and email are required.",
      });
    }

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
      return res.status(400).json({
        message:
          "Username must be 3–30 characters and contain only letters, numbers, and underscores.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters.",
      });
    }

    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { username: cleanUsername },
        { email: cleanEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "That username or email is already in use.",
      });
    }

    user.name = cleanName;
    user.username = cleanUsername;
    user.email = cleanEmail;

    await user.save();

    return res.json({
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "That username or email is already in use.",
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Unable to update your profile.",
    });
  }
});

module.exports = router;
