const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendEmailOtp, sendSmsOtp, checkSmsVerification } = require('../services/notificationService');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_secure',
    {
      expiresIn: '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'user',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Explicitly select password since select: false in schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const authOtpStore = new Map();

// @desc    Send OTP to phone or email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    let { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number or email address',
      });
    }

    identifier = identifier.trim();

    // Check if email or mobile
    const isEmail = identifier.includes('@');
    if (isEmail) {
      identifier = identifier.toLowerCase();
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
      if (!emailRegex.test(identifier)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
        });
      }
    } else {
      // Clean mobile number (keep digits and leading +)
      const cleaned = identifier.replace(/[^0-9+]/g, '');
      const digitsOnly = identifier.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 10-digit mobile number',
        });
      }
      identifier = cleaned;
    }

    // Generate 6-digit secure numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save in memory store
    authOtpStore.set(identifier, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Upsert in database if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Otp.deleteMany({ identifier });
        await Otp.create({
          identifier,
          otp,
        });
      } catch (dbErr) {
        console.warn('[AUTH OTP] Database write fallback to in-memory store:', dbErr.message);
      }
    }

    console.log(`[IMOVIES OTP GATEWAY] >>> Generated OTP [${otp}] for [${identifier}]`);

    // Dispatch real email or real SMS
    let deliveryInfo = {};
    if (isEmail) {
      deliveryInfo = await sendEmailOtp(identifier, otp);
    } else {
      deliveryInfo = await sendSmsOtp(identifier, otp);
    }

    res.json({
      success: true,
      message: deliveryInfo.message || `OTP sent successfully to ${identifier}`,
      identifier,
      deliveryMethod: isEmail ? 'email' : 'sms',
      deliveryInfo,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while generating OTP',
    });
  }
};

// @desc    Verify OTP and authenticate/login user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    let { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and 6-digit OTP are required',
      });
    }

    identifier = identifier.trim();
    if (identifier.includes('@')) {
      identifier = identifier.toLowerCase();
    } else {
      identifier = identifier.replace(/[^0-9+]/g, '');
    }

    // Check verification code:
    let isValidOtp = false;

    // 1. If mobile number, verify with Twilio SMS service
    if (!identifier.includes('@')) {
      const isTwilioApproved = await checkSmsVerification(identifier, otp.trim());
      if (isTwilioApproved) {
        isValidOtp = true;
      }
    }

    // 2. Check memory store fallback
    if (!isValidOtp) {
      const memRecord = authOtpStore.get(identifier);
      if (memRecord && memRecord.otp === otp.trim() && Date.now() <= memRecord.expiresAt) {
        isValidOtp = true;
        authOtpStore.delete(identifier);
      }
    }

    // 3. Check database if connected
    if (!isValidOtp && mongoose.connection.readyState === 1) {
      try {
        const validOtp = await Otp.findOne({
          identifier,
          otp: otp.trim(),
        });
        if (validOtp) {
          isValidOtp = true;
          await Otp.deleteMany({ identifier });
        }
      } catch (dbErr) {
        console.warn('[AUTH OTP] Database read fallback:', dbErr.message);
      }
    }

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please check and try again.',
      });
    }

    // Find or create user
    let user;
    const isEmail = identifier.includes('@');

    if (mongoose.connection.readyState === 1) {
      if (isEmail) {
        user = await User.findOne({ email: identifier });
      } else {
        user = await User.findOne({
          $or: [{ phone: identifier }, { email: `${identifier.replace(/\D/g, '')}@imovies.com` }],
        });
      }

      // If user does not exist yet, auto-register them
      if (!user) {
        const generatedEmail = isEmail
          ? identifier
          : `${identifier.replace(/\D/g, '')}@imovies.com`;
        const displayName = isEmail
          ? identifier.split('@')[0]
          : `Customer ${identifier.slice(-4)}`;
        const randomPassword = crypto.randomBytes(16).toString('hex');

        user = await User.create({
          name: displayName,
          email: generatedEmail,
          phone: isEmail ? '' : identifier,
          password: randomPassword,
          role: 'user',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(identifier)}`,
        });
      } else if (!user.phone && !isEmail) {
        user.phone = identifier;
        await user.save();
      }
    } else {
      // In-memory user fallback
      const generatedEmail = isEmail
        ? identifier
        : `${identifier.replace(/\D/g, '')}@imovies.com`;
      const displayName = isEmail
        ? identifier.split('@')[0]
        : `Customer ${identifier.slice(-4)}`;

      user = {
        _id: new mongoose.Types.ObjectId(),
        name: displayName,
        email: generatedEmail,
        phone: isEmail ? '' : identifier,
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(identifier)}`,
      };
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'OTP verified successfully! Logged in.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while verifying OTP',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  sendOtp,
  verifyOtp,
};

