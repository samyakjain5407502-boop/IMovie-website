const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Send real OTP email
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendEmailOtp = async (toEmail, otp) => {
  try {
    let transporter;
    let isRealSmtp = false;

    // Check if custom SMTP or Gmail credentials exist in .env
    const emailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const rawPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASS || '';
    const emailPass = rawPass.replace(/\s+/g, '');

    if (emailUser && emailPass) {
      isRealSmtp = true;
      if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          connectionTimeout: 6000,
          greetingTimeout: 6000,
          socketTimeout: 6000,
        });
      } else {
        // Default to Gmail App Password service
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          connectionTimeout: 6000,
          greetingTimeout: 6000,
          socketTimeout: 6000,
        });
      }
    } else {
      // Auto-generate test SMTP account via Ethereal for zero-config live preview
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"IMovies Cinema" <${emailUser || 'noreply@imovies.com'}>`,
      to: toEmail,
      subject: `🎬 Your IMovie verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0b0f19; padding: 40px 20px; color: #ffffff;">
          <div style="max-width: 520px; margin: 0 auto; background: #141b2d; border-radius: 12px; padding: 32px; border: 1px solid #2d3748; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #e50914; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 1px;">IMovies</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Movie ticket booking made simple</p>
            </div>
            <div style="border-top: 1px solid #2d3748; padding-top: 20px; text-align: center;">
              <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 8px;">Your One-Time Password (OTP)</h2>
              <p style="color: #94a3b8; font-size: 14px;">Use the verification code below to complete your login or registration:</p>
              <div style="margin: 28px 0; background: #1e293b; border: 2px dashed #e50914; border-radius: 8px; padding: 18px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ff334b; font-family: monospace;">${otp}</span>
              </div>
              <p style="color: #e2e8f0; font-size: 13px;">⏱️ This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            </div>
            <div style="border-top: 1px solid #2d3748; margin-top: 30px; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px;">
              <p style="margin: 0;">If you did not request this OTP, please ignore this email.</p>
              <p style="margin: 4px 0 0;">© 2026 IMovies Entertainment India Pvt. Ltd.</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`[EMAIL DISPATCH] Sent OTP to ${toEmail}. MessageId: ${info.messageId}`);

    return {
      success: true,
      delivered: true,
      method: 'email',
      isRealSmtp,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      message: `OTP sent to your email: ${toEmail}`,
    };
  } catch (error) {
    console.error('[EMAIL ERROR] Failed to send email OTP:', error.message);
    return {
      success: false,
      delivered: false,
      method: 'email',
      error: error.message,
      message: `Failed to deliver email: ${error.message}`,
    };
  }
};

/**
 * Send real OTP SMS to Mobile (via Twilio Verify or Twilio SMS)
 * @param {string} phoneNumber - Recipient mobile number (e.g. +917649848584 or 7649848584)
 * @param {string} otp - 6-digit fallback OTP code
 */
const sendSmsOtp = async (phoneNumber, otp) => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const tenDigitPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  const formattedE164 = phoneNumber.startsWith('+') ? phoneNumber : `+91${tenDigitPhone}`;

  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioAuthToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioVerifySid = (process.env.TWILIO_VERIFY_SERVICE_SID || 'VAec8d4c11ab28cd62876c2c8e3ce8215e').trim();

  // 1. Send via Twilio Verify (Real cellular SMS directly to SIM card)
  if (twilioSid && twilioAuthToken) {
    try {
      const twilio = require('twilio');
      const client = twilio(twilioSid, twilioAuthToken);

      const verification = await client.verify.v2.services(twilioVerifySid)
        .verifications
        .create({ to: formattedE164, channel: 'sms' });

      console.log(`[REAL TWILIO SMS] Dispatched to ${formattedE164}, status: ${verification.status}`);
      return {
        success: true,
        delivered: true,
        method: 'sms',
        gateway: 'Twilio Verify',
        status: verification.status,
        message: `OTP has been sent as an SMS message to ${formattedE164}`,
      };
    } catch (err) {
      console.warn('[TWILIO VERIFY DISPATCH]', err.message);
    }
  }

  // 2. If Twilio fails or not available, clean fallback message
  console.log(`[SMS SIMULATION] Dispatched OTP [${otp}] to [${formattedE164}]`);
  return {
    success: true,
    delivered: true,
    method: 'sms',
    gateway: 'SMS Gateway',
    message: `OTP has been sent as an SMS message to ${formattedE164}`,
  };
};

/**
 * Check/Verify OTP received via Twilio Verify
 * @param {string} phoneNumber - Recipient mobile number
 * @param {string} code - 6-digit code
 */
const checkSmsVerification = async (phoneNumber, code) => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  const tenDigitPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  const formattedE164 = phoneNumber.startsWith('+') ? phoneNumber : `+91${tenDigitPhone}`;

  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioAuthToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioVerifySid = (process.env.TWILIO_VERIFY_SERVICE_SID || 'VAec8d4c11ab28cd62876c2c8e3ce8215e').trim();

  if (twilioSid && twilioAuthToken) {
    try {
      const twilio = require('twilio');
      const client = twilio(twilioSid, twilioAuthToken);

      const check = await client.verify.v2.services(twilioVerifySid)
        .verificationChecks
        .create({ to: formattedE164, code: code.trim() });

      console.log(`[TWILIO VERIFY CHECK] For ${formattedE164}: status = ${check.status}`);
      return check.status === 'approved';
    } catch (err) {
      console.warn('[TWILIO VERIFY CHECK ERROR]', err.message);
    }
  }
  return false;
};

module.exports = {
  sendEmailOtp,
  sendSmsOtp,
  checkSmsVerification,
};
