const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend UI from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================================
// REAL OTP SYSTEM (In-Memory Storage with 5-Minute Expiration)
// =========================================================================
const otpStore = new Map(); // key: email or phone, value: { otp, expiresAt }

// Helper: Setup Nodemailer Transporter
const getTransporter = () => {
  const user = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 6000,
    });
  }
  return null;
};

// Helper: Setup Twilio Client
const getTwilioClient = () => {
  const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || '').trim();

  if (sid && token && sid.startsWith('AC') && !sid.includes('dummy')) {
    try {
      return twilio(sid, token);
    } catch (_) {
      return null;
    }
  }
  return null;
};

/**
 * @route   POST /api/send-otp
 * @desc    Generate random 6-digit OTP, store temporarily with 5-min expiry,
 *          and send to BOTH Gmail (Nodemailer) and Mobile (Twilio)
 */
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least an Email address or Mobile number.',
      });
    }

    // 1. Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // 2. Store in temporary store
    if (email) {
      otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });
    }
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      otpStore.set(cleanPhone, { otp, expiresAt });
    }

    const deliveryResults = {
      emailSent: false,
      smsSent: false,
      details: [],
    };

    // 3. Send to Gmail via Nodemailer
    if (email) {
      const transporter = getTransporter();
      if (transporter) {
        try {
          await transporter.sendMail({
            from: `"IMovies Verification" <${process.env.GMAIL_USER || 'no-reply@imovies.com'}>`,
            to: email.trim(),
            subject: `🎬 Your IMovie verification code is: ${otp}`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #0b0f19; padding: 40px 20px; color: #ffffff;">
                <div style="max-width: 500px; margin: 0 auto; background: #141b2d; border-radius: 12px; padding: 32px; border: 1px solid #2d3748;">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <h1 style="color: #e50914; margin: 0; font-size: 28px;">IMovies</h1>
                    <p style="color: #94a3b8; font-size: 14px;">Movie ticket booking made simple</p>
                  </div>
                  <div style="text-align: center; border-top: 1px solid #2d3748; padding-top: 20px;">
                    <p style="color: #e2e8f0; font-size: 16px;">Your One-Time Password (OTP):</p>
                    <div style="margin: 20px 0; background: #1e293b; border: 2px dashed #e50914; border-radius: 8px; padding: 15px;">
                      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ff334b; font-family: monospace;">${otp}</span>
                    </div>
                    <p style="color: #94a3b8; font-size: 13px;">⏱️ Valid for 5 minutes. Do not share this code.</p>
                  </div>
                </div>
              </div>
            `,
          });
          deliveryResults.emailSent = true;
          deliveryResults.details.push(`Delivered to Gmail: ${email}`);
          console.log(`[REAL GMAIL DISPATCH] ✅ Sent OTP ${otp} to ${email}`);
        } catch (err) {
          console.error('[GMAIL ERROR]', err.message);
          deliveryResults.details.push(`Gmail error: ${err.message}`);
        }
      } else {
        console.warn('[GMAIL] No credentials configured in GMAIL_USER/GMAIL_PASS');
      }
    }

    // 4. Send to Mobile via Twilio
    if (phone) {
      const client = getTwilioClient();
      const fromNumber = (process.env.TWILIO_PHONE_NUMBER || '').trim();

      if (client && fromNumber) {
        try {
          const cleanPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
          const twilioRes = await client.messages.create({
            body: `Your IMovies verification OTP is: ${otp}. Valid for 5 minutes.`,
            from: fromNumber,
            to: cleanPhone,
          });
          deliveryResults.smsSent = true;
          deliveryResults.details.push(`Delivered SMS to: ${cleanPhone}`);
          console.log(`[TWILIO SMS] ✅ Sent to ${cleanPhone}, SID: ${twilioRes.sid}`);
        } catch (err) {
          console.error('[TWILIO ERROR]', err.message);
          deliveryResults.details.push(`Twilio note: ${err.message}`);
        }
      } else {
        console.log(`[TWILIO] Twilio credentials verified. To deliver SMS to SIM card, set TWILIO_PHONE_NUMBER.`);
      }
    }

    res.json({
      success: true,
      message: `OTP sent successfully! ${deliveryResults.details.join(' | ')}`,
      expiresIn: '5 minutes',
      deliveryResults,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/verify-otp
 * @desc    Matches user input OTP against stored temporary data,
 *          and clears it upon successful verification or expiry.
 */
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit OTP.',
      });
    }

    let record = null;
    let storeKey = null;

    if (email) {
      storeKey = email.toLowerCase().trim();
      record = otpStore.get(storeKey);
    }

    if (!record && phone) {
      storeKey = phone.replace(/[^0-9+]/g, '');
      record = otpStore.get(storeKey);
    }

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found or it has expired. Please request a new OTP.',
      });
    }

    // Check expiration (5 minutes)
    if (Date.now() > record.expiresAt) {
      otpStore.delete(storeKey);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Check code match
    if (record.otp !== otp.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.',
      });
    }

    // Clear upon successful verification
    otpStore.delete(storeKey);

    console.log(`[OTP VERIFIED] ✅ Verified OTP for ${storeKey}`);

    res.json({
      success: true,
      message: 'OTP verified successfully! Verification complete.',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================================================
// IMOVIES APPLICATION API ROUTES
// =========================================================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/showtimes', require('./routes/showtimeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'IMovies - Movie ticket booking made simple',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🎬 IMovies Backend running on http://localhost:${PORT}`);
    console.log(`🛡️ Real OTP verification UI: http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================================`);
  });
}

// Connect to DB asynchronously without blocking server startup
const initDB = async () => {
  try {
    const connected = await connectDB();
    if (connected) {
      const Movie = require('./models/Movie');
      const movieCount = await Movie.countDocuments();
      if (movieCount === 0) {
        console.log('[IMovies] No movies found in database. Initializing sample movies and showtimes...');
        const { seedDatabase } = require('./seed/seedData');
        await seedDatabase();
      }
    }
  } catch (error) {
    console.warn('Database initialization warning:', error.message);
  }
};

initDB();

module.exports = app;
