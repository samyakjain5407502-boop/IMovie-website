import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('otp'); // 'otp' | 'password'

  // Password Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP Login state
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('input'); // 'input' | 'verify'
  const [deliveryMethod, setDeliveryMethod] = useState(null); // 'email' | 'sms'
  const [incomingOtp, setIncomingOtp] = useState(null);
  const [smsSender, setSmsSender] = useState('IMovies');
  const [twilioDispatched, setTwilioDispatched] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, sendOtp, verifyOtp, quickDemoLogin, quickAdminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle Standard Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  // Handle Sending OTP (Email or SMS)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile number or email address');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const res = await sendOtp(identifier.trim());
    setSubmitting(false);

    if (res.success) {
      const isEmail = identifier.includes('@');
      setDeliveryMethod(isEmail ? 'email' : 'sms');
      setOtpStep('verify');
      setCountdown(60);
      if (res.otp) {
        setIncomingOtp(res.otp);
      }
      if (res.sender) {
        setSmsSender(res.sender);
      }
      setTwilioDispatched(!!res.twilioDispatched);
      setSuccessMsg(
        isEmail
          ? `[IMovies] OTP sent to your Email (${identifier})`
          : res.twilioDispatched
          ? `[IMovies] Real cellular SMS sent directly to your phone (${identifier})!`
          : `[IMovies] Verification code prepared for (${identifier})`
      );
    } else {
      setError(res.message);
    }
  };

  // Handle Verifying OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setError(null);
    setSubmitting(true);

    const res = await verifyOtp(identifier.trim(), otpCode.trim());
    setSubmitting(false);

    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(redirectPath, { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  const handleDemoUser = async () => {
    setError(null);
    setSubmitting(true);
    const res = await quickDemoLogin();
    setSubmitting(false);

    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.message);
    }
  };

  const handleDemoAdmin = async () => {
    setError(null);
    setSubmitting(true);
    const res = await quickAdminLogin();
    setSubmitting(false);

    if (res.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container py-5 my-auto">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="glass-card p-4 p-sm-5 shadow-lg border border-secondary border-opacity-25 rounded-4">
            
            {/* Logo and Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-danger text-white rounded-circle mb-3 shadow-lg"
                style={{ width: '56px', height: '56px' }}
              >
                <i className="bi bi-film fs-3"></i>
              </div>
              <h3 className="fw-bold text-white brand-font mb-1">Welcome to IMovies</h3>
              <p className="text-secondary small mb-0">
                Book movie tickets effortlessly or manage cinema operations.
              </p>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-octagon-fill fs-5 text-danger flex-shrink-0"></i>
                <div>{error}</div>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success py-2 small mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill fs-5 text-success flex-shrink-0"></i>
                <div className="small fw-semibold">{successMsg}</div>
              </div>
            )}

            {/* Tab Navigation: OTP vs Password */}
            <div className="nav nav-pills nav-fill bg-dark bg-opacity-75 p-1 rounded-3 mb-4 border border-secondary border-opacity-25">
              <button
                type="button"
                className={`nav-link py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 position-relative ${
                  activeTab === 'otp' ? 'active bg-danger text-white shadow' : 'text-secondary'
                }`}
                onClick={() => {
                  setActiveTab('otp');
                  setError(null);
                }}
              >
                <i className="bi bi-shield-check"></i>
                <span>OTP Login</span>
                <span className="badge bg-warning text-dark px-1 py-0 small fw-bold" style={{ fontSize: '0.65rem' }}>
                  Secure
                </span>
              </button>
              <button
                type="button"
                className={`nav-link py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                  activeTab === 'password' ? 'active bg-danger text-white shadow' : 'text-secondary'
                }`}
                onClick={() => {
                  setActiveTab('password');
                  setError(null);
                }}
              >
                <i className="bi bi-key"></i>
                <span>Password</span>
              </button>
            </div>

            {/* ===================== TAB 1: OTP LOGIN ===================== */}
            {activeTab === 'otp' && (
              <div>
                {otpStep === 'input' ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="mb-3">
                      <label className="form-label text-secondary small fw-semibold">
                        Enter Mobile Number or Email Address
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          {identifier.includes('@') ? (
                            <i className="bi bi-envelope-at-fill text-info"></i>
                          ) : (
                            <i className="bi bi-phone-fill text-warning"></i>
                          )}
                        </span>
                        <input
                          type="text"
                          required
                          className="form-control bg-dark border-secondary text-white"
                          placeholder="e.g. 7649848584 or yourname@gmail.com"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                        />
                      </div>
                      <div className="mt-2 small text-secondary">
                        {identifier.includes('@') ? (
                          <span className="text-info">
                            <i className="bi bi-envelope-check me-1"></i> OTP will be sent to your Email Inbox
                          </span>
                        ) : (
                          <span className="text-warning">
                            <i className="bi bi-chat-dots me-1"></i> OTP will be sent as an SMS Message
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn btn-cinema w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow mt-4"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span> Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill"></i> Send OTP
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp}>
                    {/* Upper Clean Status Banner */}
                    <div className="p-3 mb-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-50 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        {deliveryMethod === 'email' ? (
                          <i className="bi bi-envelope-check-fill fs-4 text-info"></i>
                        ) : (
                          <i className="bi bi-chat-dots-fill fs-4 text-warning"></i>
                        )}
                        <div>
                          <div className="text-white small fw-bold">
                            {deliveryMethod === 'email'
                              ? 'OTP is sent to your Email'
                              : 'OTP is sent as an SMS message'}
                          </div>
                          <div className="text-secondary small">{identifier}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('input');
                          setOtpCode('');
                          setIncomingOtp(null);
                          setError(null);
                        }}
                        className="btn btn-outline-secondary btn-sm py-1 px-2 text-white small"
                      >
                        Change
                      </button>
                    </div>

                    {/* IMovie Mobile SMS Notification Card */}
                    {incomingOtp && (
                      <div className="card bg-dark border border-danger border-opacity-75 p-3 mb-3 shadow rounded-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-danger text-white fw-bold d-inline-flex align-items-center gap-1 px-2 py-1">
                            <i className="bi bi-chat-left-dots-fill"></i> SMS from {smsSender || 'IMovies'}
                          </span>
                          {twilioDispatched ? (
                            <span className="badge bg-success-subtle text-success small border border-success border-opacity-50">
                              <i className="bi bi-broadcast me-1"></i> Sent to Phone
                            </span>
                          ) : (
                            <span className="badge bg-secondary-subtle text-light small">Instant Gateway</span>
                          )}
                        </div>
                        <div className="bg-black bg-opacity-50 p-2 rounded border border-secondary border-opacity-25 mb-2">
                          <code className="text-warning small d-block">
                            [{smsSender || 'IMovie'}] Your verification code is: <span className="fs-6 fw-bold text-white text-decoration-underline">{incomingOtp}</span>. Valid for 5 minutes.
                          </code>
                        </div>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm fw-bold text-dark d-flex align-items-center justify-content-center gap-1 shadow-sm"
                          onClick={() => setOtpCode(incomingOtp)}
                        >
                          <i className="bi bi-lightning-charge-fill"></i> Auto-Fill Code ({incomingOtp})
                        </button>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label text-secondary small fw-semibold">
                        Enter 6-Digit OTP Code
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary">
                          <i className="bi bi-shield-lock"></i>
                        </span>
                        <input
                          type="text"
                          required
                          maxLength="6"
                          autoFocus
                          className="form-control form-control-lg bg-dark border-secondary text-white text-center fw-bold letter-spacing-2 font-monospace"
                          placeholder="• • • • • •"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div className="form-text text-secondary small text-center mt-2">
                        {deliveryMethod === 'email'
                          ? 'Please check your Gmail inbox (or spam folder) for the verification code.'
                          : 'Please check your mobile phone messages for the verification code.'}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otpCode.length < 4}
                      className="btn btn-cinema w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mb-3 shadow"
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span> Verifying...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle fs-5"></i> Verify & Sign In
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      {countdown > 0 ? (
                        <span className="text-secondary small">
                          Resend OTP in <strong className="text-white">{countdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="btn btn-link btn-sm text-danger text-decoration-none fw-semibold p-0"
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i> Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ===================== TAB 2: PASSWORD LOGIN ===================== */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      required
                      className="form-control bg-dark border-secondary text-white"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label text-secondary small fw-semibold">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary text-secondary">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      required
                      className="form-control bg-dark border-secondary text-white"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-cinema w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span> Signing In...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i> Sign In with Password
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-click test buttons */}
            <div className="d-flex flex-column gap-2 mt-4 pt-3 border-top border-secondary border-opacity-25">
              <span className="text-secondary small text-center">1-Click Instant Demo Access:</span>
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    onClick={handleDemoUser}
                    disabled={submitting}
                    className="btn btn-outline-warning w-100 py-2 btn-sm fw-semibold d-flex align-items-center justify-content-center gap-1"
                  >
                    <i className="bi bi-person-fill"></i> Customer
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    onClick={handleDemoAdmin}
                    disabled={submitting}
                    className="btn btn-warning w-100 py-2 btn-sm fw-bold text-dark d-flex align-items-center justify-content-center gap-1"
                  >
                    <i className="bi bi-shield-lock-fill"></i> Admin Panel
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-25 small text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-danger fw-semibold text-decoration-none">
                Create one now
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
