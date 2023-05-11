const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { v4: uuidv4 } = require('uuid');


// @desc Register a user~~
// @route POST /api/users/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!");
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered");
  }

  // Generate Google ID for the user
  const googleId = `google_${uuidv4()}`;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password", hashedPassword);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    googleId,
  });

  console.log(`user created ${user}`);
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

//@desc Login user
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, googleIdToken } = req.body;

  if ((!email || !password) && !googleIdToken) {
    res.status(400);
    throw new Error('All fields are mandatory!');
  }

  let user;
  let accessToken;
  let otp;

  if (googleIdToken) {
    // Authenticate with Google SSO
    const ticket = await client.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email: googleEmail } = ticket.getPayload();

    user = await User.findOneAndUpdate(
      { email: googleEmail },
      { email: googleEmail },
      { new: true, upsert: true },
    );
  } else {
    // Authenticate with email and password
    const existingUser = await User.findOne({ email });
    if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
      user = existingUser;
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  }

  // Generate and save an OTP to the user's document
  otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  await user.save();
  console.log(`Generated OTP ${otp}`);

  // Generate a new access token and return it to the client
  accessToken = jwt.sign(
    {
      user: {
        username: user.username,
        email: user.email,
        id: user.id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' },
  );
  res.status(200).json({ accessToken, otp });
});

//@desc Current user info
//@route POST /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc Logout user
// @route POST /api/users/logout
// @access private
const logoutUser = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  // Remove the access token from the user's document in the database
  await User.findByIdAndUpdate(
    req.user.id,
    { accessToken: null }
  );

  res.status(200).json({ message: "User logged out successfully" });
});

module.exports = { registerUser, loginUser, currentUser, logoutUser };