import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const SNACKS_MENU = [
  { id: 'popcorn', name: 'Caramel & Cheese Popcorn Tub', price: 290, icon: '🍿', desc: 'Freshly popped warm gourmet tub' },
  { id: 'nachos', name: 'Crispy Tortilla Nachos & Warm Salsa', price: 240, icon: '🧀', desc: 'With melted jalapeno cheese dip' },
  { id: 'coke', name: 'Jumbo Chilled Fountain Soda 650ml', price: 180, icon: '🥤', desc: 'Choice of Coke, Sprite or Fanta' },
  { id: 'combo', name: 'Multiplex Gold Saver Combo', price: 540, icon: '✨', desc: 'Large Popcorn + 2 Jumbo Drinks + Nachos' },
];

const SeatBookingPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, quickDemoLogin } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [snacksCart, setSnacksCart] = useState({});
  const [activeTab, setActiveTab] = useState('seats'); // 'seats' | 'snacks'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking / Modal states
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'success' | 'failed'
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    fetchShowtime();
  }, [showtimeId]);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/showtimes/${showtimeId}`);
      setShowtime(res.data.data);
    } catch (err) {
      console.error('Error fetching showtime layout:', err);
      setError('Failed to load auditorium seat layout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle seat selection
  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const isAlreadySelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Snacks quantity modifier
  const updateSnackQty = (snackId, delta) => {
    setSnacksCart((prev) => {
      const current = prev[snackId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: updated };
    });
  };

  // Calculation helpers
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const snacksTotal = Object.entries(snacksCart).reduce((sum, [id, qty]) => {
    const item = SNACKS_MENU.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);
  const convenienceFee = selectedSeats.length > 0 ? Number((subtotal * 0.05 + 30).toFixed(2)) : 0;
  const totalAmount = Number((subtotal + convenienceFee + snacksTotal).toFixed(2));

  // Handle Booking Submission
  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${showtimeId}` } });
      return;
    }
    setPaymentStep('select');
    setBookingSuccess(null);
    setBookingError(null);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setPaymentStep('processing');
      setBookingLoading(true);
      setBookingError(null);

      // Simulate Razorpay payment processing delay (2.5s)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const seatNumbers = selectedSeats.map((s) => s.seatNumber);

      const razorpayPaymentId = 'pay_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 5);
      const razorpayOrderId = 'order_' + Math.random().toString(36).substring(2, 15);

      const res = await API.post('/bookings', {
        showtimeId: showtime._id,
        seats: seatNumbers,
        paymentMethod: paymentMethod === 'upi' ? 'Razorpay UPI' : paymentMethod === 'card' ? 'Razorpay Card' : paymentMethod === 'netbanking' ? 'Razorpay Net Banking' : 'Razorpay Wallet',
        snacksTotal,
        razorpayPaymentId,
        razorpayOrderId,
      });

      setBookingSuccess({ ...res.data.data, razorpayPaymentId, razorpayOrderId });
      setPaymentStep('success');
    } catch (err) {
      console.error('Booking submission failed:', err);
      const msg = err.response?.data?.message || 'Payment failed. Please try again.';
      setBookingError(msg);
      setPaymentStep('failed');
      fetchShowtime();
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
      </div>
    );
  }

  if (error || !showtime) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger p-4">
          <h5>{error || 'Showtime Not Found'}</h5>
          <Link to="/" className="btn btn-outline-danger mt-3">
            <i className="bi bi-arrow-left me-1"></i> Return to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Group seats by rows
  const seatRows = {};
  showtime.seats.forEach((seat) => {
    if (!seatRows[seat.row]) {
      seatRows[seat.row] = [];
    }
    seatRows[seat.row].push(seat);
  });

  Object.keys(seatRows).forEach((r) => {
    seatRows[r].sort((a, b) => a.col - b.col);
  });

  const rowKeys = Object.keys(seatRows).sort();

  return (
    <div className="pb-5">
      {/* Top Showtime Info Header */}
      <section className="bg-dark border-bottom border-secondary border-opacity-25 py-3">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <Link to={`/movie/${showtime.movieId?._id}`} className="btn btn-outline-cinema btn-sm">
                <i className="bi bi-arrow-left"></i>
              </Link>
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h4 className="text-white fw-bold mb-0">{showtime.movieId?.title}</h4>
                  <span className="badge bg-secondary-subtle text-light">{showtime.movieId?.language}</span>
                </div>
                <div className="text-secondary small d-flex flex-wrap align-items-center gap-2">
                  <span><i className="bi bi-geo-alt me-1 text-danger"></i>{showtime.theaterName}</span>
                  <span>•</span>
                  <span>{showtime.screen}</span>
                  <span>•</span>
                  <span className="badge bg-danger-subtle text-danger">{showtime.format}</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="text-end">
                <div className="fw-bold text-white fs-6">
                  <i className="bi bi-clock me-1 text-warning"></i>{showtime.time}
                </div>
                <div className="text-secondary small">
                  <i className="bi bi-calendar3 me-1"></i>{showtime.date}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Seat Selection & Summary Section */}
      <section className="container py-4">
        {/* Step Tabs: 1. Seats | 2. Food & Beverages */}
        <div className="d-flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('seats')}
            className={`btn px-4 py-2 rounded-pill fw-semibold ${activeTab === 'seats' ? 'btn-danger shadow' : 'btn-outline-cinema'}`}
          >
            <i className="bi bi-grid-3x3-gap-fill me-2"></i> 1. Select Seats ({selectedSeats.length})
          </button>
          <button
            onClick={() => setActiveTab('snacks')}
            className={`btn px-4 py-2 rounded-pill fw-semibold ${activeTab === 'snacks' ? 'btn-danger shadow' : 'btn-outline-cinema'}`}
          >
            <i className="bi bi-cup-straw me-2 text-warning"></i> 2. Food & Beverages ({Object.values(snacksCart).reduce((a, b) => a + b, 0)})
          </button>
        </div>

        <div className="row g-4">
          {/* Left Column: Seats or Snacks */}
          <div className="col-lg-8">
            {activeTab === 'seats' ? (
              <div className="glass-card p-4">
                {/* Curved Cinema Screen */}
                <div className="cinema-screen-container">
                  <div className="cinema-screen-bar"></div>
                  <div className="cinema-screen-text">
                    <i className="bi bi-tv me-1"></i> All Eyes This Way • Cinema Screen
                  </div>
                </div>

                {/* Seat Legend */}
                <div className="d-flex flex-wrap justify-content-center gap-4 mb-4 small">
                  <div className="d-flex align-items-center gap-2">
                    <div className="seat-item available" style={{ width: '22px', height: '22px', cursor: 'default' }}></div>
                    <span className="text-secondary">Available</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="seat-item selected" style={{ width: '22px', height: '22px', cursor: 'default' }}></div>
                    <span className="text-warning fw-semibold">Selected</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="seat-item reserved" style={{ width: '22px', height: '22px', cursor: 'default' }}></div>
                    <span className="text-secondary">Booked / Occupied</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="seat-grid-wrapper">
                  {rowKeys.map((rowLabel, idx) => {
                    const seatsInRow = seatRows[rowLabel];
                    const tier = seatsInRow[0]?.tier || 'STANDARD';
                    const tierPrice = seatsInRow[0]?.price || 180;

                    const prevRow = rowKeys[idx - 1];
                    const prevTier = prevRow ? seatRows[prevRow][0]?.tier : null;
                    const isNewTier = tier !== prevTier;

                    return (
                      <React.Fragment key={rowLabel}>
                        {isNewTier && (
                          <div className="tier-separator">
                            <div className="tier-separator-line"></div>
                            <span
                              className={`tier-separator-badge ${
                                tier === 'VIP'
                                  ? 'bg-warning-subtle text-warning border border-warning border-opacity-50'
                                  : tier === 'PREMIUM'
                                  ? 'bg-info-subtle text-info border border-info border-opacity-50'
                                  : 'bg-secondary-subtle text-light border border-secondary border-opacity-50'
                              }`}
                            >
                              {tier} SEATING • ₹{tierPrice}
                            </span>
                            <div className="tier-separator-line"></div>
                          </div>
                        )}

                        <div className="seat-row">
                          <div className="seat-row-label">{rowLabel}</div>

                          {seatsInRow.map((seat) => {
                            const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                            const seatClass = seat.isBooked
                              ? 'reserved'
                              : isSelected
                              ? 'selected'
                              : 'available';

                            return (
                              <React.Fragment key={seat.seatNumber}>
                                <div
                                  onClick={() => handleSeatClick(seat)}
                                  className={`seat-item ${seatClass}`}
                                  title={`Seat ${seat.seatNumber} (${seat.tier}) - ₹${seat.price}${
                                    seat.isBooked ? ' (Reserved)' : ''
                                  }`}
                                >
                                  {seat.col}
                                </div>
                                {seat.col === 4 && <div className="seat-aisle"></div>}
                              </React.Fragment>
                            );
                          })}

                          <div className="seat-row-label">{rowLabel}</div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="text-center text-secondary small mt-4">
                  <i className="bi bi-info-circle me-1"></i> Tap on an available seat to pick. Once selected, you can also add Snacks!
                </div>
              </div>
            ) : (
              /* Snacks & Food Add-ons Tab */
              <div className="glass-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                  <div>
                    <h5 className="text-white fw-bold mb-1">
                      <i className="bi bi-cup-hot-fill text-warning me-2"></i> Cinema Food & Gourmet Beverages
                    </h5>
                    <p className="text-secondary small mb-0">Skip the intermission line! Delivered right to your seat.</p>
                  </div>
                  <button onClick={() => setActiveTab('seats')} className="btn btn-outline-cinema btn-sm">
                    Back to Seat Map
                  </button>
                </div>

                <div className="row g-3">
                  {SNACKS_MENU.map((item) => {
                    const qty = snacksCart[item.id] || 0;
                    return (
                      <div className="col-md-6" key={item.id}>
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
                          <div className="d-flex gap-3 mb-3">
                            <span className="fs-1">{item.icon}</span>
                            <div>
                              <h6 className="text-white fw-bold mb-1">{item.name}</h6>
                              <p className="text-secondary small mb-1">{item.desc}</p>
                              <strong className="text-warning fs-6">₹{item.price}</strong>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
                            <span className="small text-secondary">Add to Order:</span>
                            {qty === 0 ? (
                              <button
                                onClick={() => updateSnackQty(item.id, 1)}
                                className="btn btn-outline-warning btn-sm px-3 fw-bold"
                              >
                                + Add
                              </button>
                            ) : (
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  onClick={() => updateSnackQty(item.id, -1)}
                                  className="btn btn-dark border-secondary btn-sm"
                                >
                                  -
                                </button>
                                <span className="fw-bold text-white px-2">{qty}</span>
                                <button
                                  onClick={() => updateSnackQty(item.id, 1)}
                                  className="btn btn-warning btn-sm text-dark fw-bold"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Order Summary */}
          <div className="col-lg-4">
            <div className="glass-card p-4 sticky-top" style={{ top: '90px' }}>
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-receipt text-danger"></i> Booking Summary
              </h5>

              {/* Movie Brief */}
              <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
                <img
                  src={showtime.movieId?.posterUrl}
                  alt={showtime.movieId?.title}
                  className="rounded-2"
                  style={{ width: '60px', height: '85px', objectFit: 'cover' }}
                />
                <div>
                  <h6 className="text-white fw-bold mb-1">{showtime.movieId?.title}</h6>
                  <p className="text-secondary small mb-1">{showtime.theaterName}</p>
                  <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 small">
                    {showtime.format}
                  </span>
                </div>
              </div>

              {/* Selected Seats Chips */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-secondary small">Selected Seats:</span>
                  <span className="badge bg-warning text-dark fw-bold">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                  </span>
                </div>

                {selectedSeats.length === 0 ? (
                  <div className="p-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-3 text-center text-secondary small">
                    No seats selected yet. Click on the auditorium layout to pick your seats.
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeats.map((s) => (
                      <span
                        key={s.seatNumber}
                        className="badge bg-dark border border-warning text-warning d-flex align-items-center gap-2 px-2 py-2"
                      >
                        <strong>{s.seatNumber}</strong>
                        <span className="text-secondary">(₹{s.price})</span>
                        <i
                          className="bi bi-x cursor-pointer text-light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSeatClick(s)}
                        ></i>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Snacks summary if any */}
              {snacksTotal > 0 && (
                <div className="mb-3 p-2 bg-dark rounded-3 border border-secondary border-opacity-25 small">
                  <div className="d-flex justify-content-between text-warning fw-semibold mb-1">
                    <span>Food & Drinks:</span>
                    <span>₹{snacksTotal}</span>
                  </div>
                  {Object.entries(snacksCart).map(([id, qty]) => {
                    const item = SNACKS_MENU.find((m) => m.id === id);
                    return (
                      <div key={id} className="d-flex justify-content-between text-secondary" style={{ fontSize: '0.78rem' }}>
                        <span>{item?.name} x {qty}</span>
                        <span>₹{(item?.price || 0) * qty}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price Calculation */}
              <div className="border-top border-secondary border-opacity-25 pt-3 mb-3">
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Tickets Subtotal</span>
                  <span className="text-light fw-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {snacksTotal > 0 && (
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Food & Intermission Snacks</span>
                    <span className="text-warning fw-medium">₹{snacksTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between small text-secondary mb-2">
                  <span>Convenience Fee & Taxes</span>
                  <span className="text-light fw-medium">₹{convenienceFee.toFixed(2)}</span>
                </div>
                <hr className="border-secondary border-opacity-25 my-2" />
                <div className="d-flex justify-content-between fw-bold fs-5 text-white">
                  <span>Total Amount</span>
                  <span className="text-warning">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout / Proceed Button */}
              {selectedSeats.length > 0 ? (
                <button
                  onClick={handleProceedToPayment}
                  className="btn btn-cinema w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                >
                  <i className="bi bi-lock-fill"></i> Proceed to Checkout (₹{totalAmount.toFixed(2)})
                </button>
              ) : (
                <button disabled className="btn btn-secondary w-100 py-3 fw-bold opacity-50">
                  Select Seats to Continue
                </button>
              )}

              {/* Login hint if guest */}
              {!isAuthenticated && selectedSeats.length > 0 && (
                <div className="text-center mt-3">
                  <p className="text-secondary small mb-1">Sign in required to confirm booking.</p>
                  <button
                    onClick={quickDemoLogin}
                    className="btn btn-outline-warning btn-sm fw-semibold"
                  >
                    <i className="bi bi-lightning-charge-fill me-1"></i> Quick Demo Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Razorpay Checkout Experience Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(5, 10, 20, 0.92)', backdropFilter: 'blur(10px)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content overflow-hidden border-0 shadow-24" style={{ borderRadius: '16px', background: '#0d1527', color: '#f8fafc' }}>
              
              {/* Razorpay Brand Header */}
              <div
                className="p-3 px-4 d-flex justify-content-between align-items-center"
                style={{
                  background: 'linear-gradient(135deg, #0c2340 0%, #07192f 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
                    style={{ width: '42px', height: '42px', background: '#0c87f2' }}
                  >
                    <i className="bi bi-lightning-charge-fill text-white fs-5"></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-black text-white" style={{ letterSpacing: '0.5px', fontSize: '1.15rem' }}>
                        Razorpay
                      </span>
                      <span className="badge bg-warning text-dark fw-bold px-2 py-0" style={{ fontSize: '0.65rem' }}>
                        TEST MODE
                      </span>
                    </div>
                    <div className="text-secondary small d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                      <span className="text-light fw-medium">IMovies Entertainment</span>
                      <span>•</span>
                      <span>{showtime?.movieId?.title || 'Movie Booking'}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <div className="text-end">
                    <span className="text-secondary small d-block" style={{ fontSize: '0.72rem' }}>Total Amount</span>
                    <strong className="text-white fs-5" style={{ color: '#38bdf8' }}>₹{totalAmount.toFixed(2)}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    disabled={paymentStep === 'processing'}
                    onClick={() => {
                      setShowModal(false);
                      if (bookingSuccess) navigate('/dashboard');
                    }}
                  ></button>
                </div>
              </div>

              {/* Modal Body: Processing vs Success vs Payment Form */}
              <div className="modal-body p-0">
                {paymentStep === 'processing' ? (
                  /* Animated Razorpay Processing Screen */
                  <div className="text-center py-5 px-4 my-4">
                    <div className="position-relative d-inline-block mb-4">
                      <div
                        className="spinner-border"
                        style={{ width: '4.5rem', height: '4.5rem', borderWidth: '4px', color: '#0c87f2' }}
                      ></div>
                      <i
                        className="bi bi-shield-lock-fill position-absolute top-50 start-50 translate-middle fs-4"
                        style={{ color: '#38bdf8' }}
                      ></i>
                    </div>
                    <h4 className="text-white fw-bold mb-2">Authorizing with Razorpay...</h4>
                    <p className="text-secondary small mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
                      Simulating bank authorization in test mode. Please do not close or refresh this tab.
                    </p>
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-dark border border-secondary border-opacity-25 small text-secondary">
                      <span className="spinner-grow spinner-grow-sm text-info"></span>
                      <span>256-bit Encrypted Session Active</span>
                    </div>
                  </div>
                ) : paymentStep === 'success' && bookingSuccess ? (
                  /* Booking Confirmed / Ticket Screen */
                  <div className="p-4">
                    {/* Razorpay Success Banner */}
                    <div
                      className="p-3 mb-4 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
                      style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)' }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-check-circle-fill text-success fs-3"></i>
                        <div>
                          <div className="fw-bold text-success">Payment Received via Razorpay</div>
                          <div className="text-secondary small font-monospace">
                            Payment ID: <span className="text-white">{bookingSuccess.razorpayPaymentId || 'pay_sample123'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge bg-success px-3 py-2 text-uppercase fw-bold">Verified & Paid</span>
                    </div>

                    {/* Official Digital Ticket Stub */}
                    <div className="ticket-stub shadow-lg rounded-3 overflow-hidden border border-secondary border-opacity-50">
                      <div className="ticket-header p-3" style={{ background: '#1e293b' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <span className="badge bg-danger mb-1 fw-bold">IMOVIES ADMISSION PASS</span>
                            <h4 className="fw-bold text-white mb-0">{bookingSuccess.movieId?.title}</h4>
                            <span className="text-secondary small">{bookingSuccess.showtimeId?.theaterName}</span>
                          </div>
                          <div className="text-end">
                            <span className="text-secondary small d-block">Booking Reference</span>
                            <strong className="text-warning fs-6">{bookingSuccess.bookingReference}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-dark">
                        <div className="row g-3 small mb-3">
                          <div className="col-sm-6">
                            <span className="text-secondary d-block">Date & Showtime</span>
                            <strong className="text-light">
                              {bookingSuccess.showtimeId?.date} • {bookingSuccess.showtimeId?.time}
                            </strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-secondary d-block">Screen & Format</span>
                            <strong className="text-light">
                              {bookingSuccess.showtimeId?.screen} ({bookingSuccess.showtimeId?.format})
                            </strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-secondary d-block">Reserved Seats</span>
                            <strong className="text-warning fs-6">{bookingSuccess.seats?.join(', ')}</strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-secondary d-block">Total Paid (Incl. Taxes & Snacks)</span>
                            <strong className="text-success fs-6">₹{bookingSuccess.totalAmount?.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="p-3 bg-black rounded-3 text-center border border-secondary border-opacity-25">
                          <i className="bi bi-qr-code fs-1 text-light d-block mb-1"></i>
                          <span className="ticket-barcode text-secondary small font-monospace">{bookingSuccess.bookingReference}</span>
                          <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                            Scan at cinema turnstiles or box office kiosk for instant entry
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Razorpay Multi-Method Payment Selector */
                  <div>
                    {bookingError && (
                      <div className="alert alert-danger m-3 mb-0 py-2 small">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> {bookingError}
                      </div>
                    )}

                    <div className="row g-0">
                      {/* Left: Razorpay Payment Method Menu */}
                      <div
                        className="col-md-4 p-3 border-end border-secondary border-opacity-25"
                        style={{ background: 'rgba(0,0,0,0.25)' }}
                      >
                        <span className="text-secondary text-uppercase fw-bold d-block mb-2 px-2" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                          Payment Options
                        </span>

                        <div className="d-flex flex-column gap-1">
                          <button
                            type="button"
                            className={`btn text-start p-2 px-3 rounded-3 d-flex align-items-center justify-content-between transition-all ${
                              paymentMethod === 'upi' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-dark'
                            }`}
                            onClick={() => setPaymentMethod('upi')}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-qr-code-scan fs-5"></i>
                              <div>
                                <div className="fw-semibold small">UPI / QR Code</div>
                                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>GPay, PhonePe, Paytm</div>
                              </div>
                            </div>
                            <i className="bi bi-chevron-right small opacity-50"></i>
                          </button>

                          <button
                            type="button"
                            className={`btn text-start p-2 px-3 rounded-3 d-flex align-items-center justify-content-between transition-all ${
                              paymentMethod === 'card' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-dark'
                            }`}
                            onClick={() => setPaymentMethod('card')}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-credit-card-2-front fs-5"></i>
                              <div>
                                <div className="fw-semibold small">Cards</div>
                                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>Visa, MasterCard, RuPay</div>
                              </div>
                            </div>
                            <i className="bi bi-chevron-right small opacity-50"></i>
                          </button>

                          <button
                            type="button"
                            className={`btn text-start p-2 px-3 rounded-3 d-flex align-items-center justify-content-between transition-all ${
                              paymentMethod === 'netbanking' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-dark'
                            }`}
                            onClick={() => setPaymentMethod('netbanking')}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-bank fs-5"></i>
                              <div>
                                <div className="fw-semibold small">Net Banking</div>
                                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>All Indian Banks</div>
                              </div>
                            </div>
                            <i className="bi bi-chevron-right small opacity-50"></i>
                          </button>

                          <button
                            type="button"
                            className={`btn text-start p-2 px-3 rounded-3 d-flex align-items-center justify-content-between transition-all ${
                              paymentMethod === 'wallet' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-dark'
                            }`}
                            onClick={() => setPaymentMethod('wallet')}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-wallet2 fs-5"></i>
                              <div>
                                <div className="fw-semibold small">Wallets</div>
                                <div className="text-white-50" style={{ fontSize: '0.7rem' }}>Paytm, PhonePe, Amazon</div>
                              </div>
                            </div>
                            <i className="bi bi-chevron-right small opacity-50"></i>
                          </button>
                        </div>
                      </div>

                      {/* Right: Method Input Screen */}
                      <div className="col-md-8 p-4">
                        {paymentMethod === 'upi' && (
                          <div>
                            <h6 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
                              <i className="bi bi-phone text-primary"></i> Pay using UPI
                            </h6>
                            <p className="text-secondary small mb-3">
                              Pay instantly with any UPI app on your phone.
                            </p>

                            <div className="row g-2 mb-3">
                              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                                <div className="col-6" key={app}>
                                  <div
                                    className="p-2 px-3 rounded-3 border border-secondary border-opacity-25 bg-dark d-flex align-items-center gap-2 cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setUpiId(`user@${app.toLowerCase().replace(/\s+/g, '')}`)}
                                  >
                                    <i className="bi bi-app-indicator text-warning"></i>
                                    <span className="small text-light fw-medium">{app}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <label className="form-label text-secondary small fw-semibold">Or Enter UPI ID / VPA</label>
                            <div className="input-group mb-2">
                              <input
                                type="text"
                                className="form-control bg-dark border-secondary text-white"
                                placeholder="e.g. 7649848584@upi or username@okhdfcbank"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setUpiId('samyakjain@okhdfcbank')}
                              >
                                Auto-Fill Test VPA
                              </button>
                            </div>
                            <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                              A collect request will be sent to your UPI app.
                            </span>
                          </div>
                        )}

                        {paymentMethod === 'card' && (
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="fw-bold text-white mb-0">Card Details</h6>
                              <button
                                type="button"
                                className="btn btn-link btn-sm text-info p-0 text-decoration-none"
                                onClick={() => {
                                  setCardNumber('4111 2222 3333 4444');
                                  setCardExpiry('12/28');
                                  setCardCVV('888');
                                  setCardName(user?.name || 'Samyak Jain');
                                }}
                              >
                                <i className="bi bi-lightning-charge me-1"></i> Fill Razorpay Test Card
                              </button>
                            </div>

                            <div className="mb-3">
                              <label className="form-label text-secondary small">Card Number</label>
                              <div className="input-group">
                                <span className="input-group-text bg-dark border-secondary text-secondary">
                                  <i className="bi bi-credit-card"></i>
                                </span>
                                <input
                                  type="text"
                                  className="form-control bg-dark border-secondary text-white font-monospace"
                                  placeholder="4111 2222 3333 4444"
                                  maxLength="19"
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="row g-2 mb-3">
                              <div className="col-6">
                                <label className="form-label text-secondary small">Expiry (MM/YY)</label>
                                <input
                                  type="text"
                                  className="form-control bg-dark border-secondary text-white font-monospace"
                                  placeholder="12/28"
                                  maxLength="5"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label text-secondary small">CVV</label>
                                <input
                                  type="password"
                                  className="form-control bg-dark border-secondary text-white font-monospace"
                                  placeholder="•••"
                                  maxLength="4"
                                  value={cardCVV}
                                  onChange={(e) => setCardCVV(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="mb-2">
                              <label className="form-label text-secondary small">Cardholder Name</label>
                              <input
                                type="text"
                                className="form-control bg-dark border-secondary text-white"
                                placeholder="Name as on card"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'netbanking' && (
                          <div>
                            <h6 className="fw-bold text-white mb-2">Select Your Bank</h6>
                            <div className="row g-2 mb-3">
                              {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                                <div className="col-6" key={b}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedBank(b)}
                                    className={`btn btn-sm w-100 p-2 text-start rounded-3 border transition-all ${
                                      selectedBank === b ? 'btn-primary border-primary' : 'btn-dark border-secondary border-opacity-25 text-light'
                                    }`}
                                  >
                                    <i className="bi bi-building me-1 text-warning"></i> {b}
                                  </button>
                                </div>
                              ))}
                            </div>
                            <span className="text-secondary small">
                              You will be redirected to bank's secure net banking authorization portal.
                            </span>
                          </div>
                        )}

                        {paymentMethod === 'wallet' && (
                          <div>
                            <h6 className="fw-bold text-white mb-2">Select Digital Wallet</h6>
                            <div className="d-flex flex-column gap-2 mb-3">
                              {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay Balance', 'MobiKwik'].map((w) => (
                                <label
                                  key={w}
                                  className="d-flex align-items-center justify-content-between p-2 px-3 rounded-3 border border-secondary border-opacity-25 bg-dark cursor-pointer"
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <input type="radio" name="walletChoice" defaultChecked={w.includes('Paytm')} className="form-check-input" />
                                    <span className="small text-light">{w}</span>
                                  </div>
                                  <i className="bi bi-shield-check text-success"></i>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Order Summary Line */}
                        <div className="p-3 mt-3 rounded-3 bg-dark border border-secondary border-opacity-25 small">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-secondary">Selected Seats:</span>
                            <span className="text-warning fw-bold">{selectedSeats.map((s) => s.seatNumber).join(', ')}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-secondary">Amount Payable:</span>
                            <span className="text-success fw-bold fs-6">₹{totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Razorpay Footer */}
              <div
                className="p-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {paymentStep === 'success' ? (
                  <div className="d-flex w-100 gap-2">
                    <button
                      className="btn btn-outline-light flex-grow-1"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-1"></i> Print Ticket
                    </button>
                    <button
                      className="btn btn-primary flex-grow-1 fw-bold"
                      onClick={() => {
                        setShowModal(false);
                        navigate('/dashboard');
                      }}
                    >
                      <i className="bi bi-ticket-detailed me-1"></i> View in Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center gap-2 text-secondary small" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-shield-shaded text-success"></i>
                      <span>Secured by <strong>Razorpay</strong> • 256-bit SSL</span>
                    </div>

                    <div className="d-flex gap-2 ms-auto">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm px-3"
                        disabled={paymentStep === 'processing'}
                        onClick={() => setShowModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-4 fw-bold shadow d-flex align-items-center gap-2"
                        style={{ background: '#0c87f2', borderColor: '#0c87f2' }}
                        disabled={paymentStep === 'processing'}
                        onClick={handleConfirmBooking}
                      >
                        <i className="bi bi-lock-fill"></i> Pay ₹{totalAmount.toFixed(2)}
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBookingPage;
