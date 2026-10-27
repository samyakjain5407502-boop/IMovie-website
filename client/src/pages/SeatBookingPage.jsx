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
  const [paymentMethod, setPaymentMethod] = useState('UPI / Google Pay');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

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
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      setBookingError(null);

      const seatNumbers = selectedSeats.map((s) => s.seatNumber);

      const res = await API.post('/bookings', {
        showtimeId: showtime._id,
        seats: seatNumbers,
        paymentMethod,
        snacksTotal,
      });

      setBookingSuccess(res.data.data);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const msg = err.response?.data?.message || 'Booking failed. Seats may have been taken.';
      setBookingError(msg);
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

      {/* Confirmation & Payment Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-secondary text-light">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  {bookingSuccess ? (
                    <>
                      <i className="bi bi-check-circle-fill text-success fs-4"></i> Booking Confirmed!
                    </>
                  ) : (
                    <>
                      <i className="bi bi-credit-card-fill text-danger"></i> Complete Reservation
                    </>
                  )}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowModal(false);
                    if (bookingSuccess) {
                      navigate('/dashboard');
                    }
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {bookingSuccess ? (
                  /* Digital Ticket Preview */
                  <div className="ticket-stub shadow-lg">
                    <div className="ticket-header">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="badge bg-success mb-1">CONFIRMED</span>
                          <h4 className="fw-bold text-white mb-0">{bookingSuccess.movieId?.title}</h4>
                          <span className="text-secondary small">{bookingSuccess.showtimeId?.theaterName}</span>
                        </div>
                        <div className="text-end">
                          <span className="text-secondary small d-block">Booking Ref</span>
                          <strong className="text-warning">{bookingSuccess.bookingReference}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-dark">
                      <div className="row g-2 small mb-3">
                        <div className="col-6">
                          <span className="text-secondary d-block">Date & Time</span>
                          <strong className="text-light">
                            {bookingSuccess.showtimeId?.date} • {bookingSuccess.showtimeId?.time}
                          </strong>
                        </div>
                        <div className="col-6">
                          <span className="text-secondary d-block">Screen & Format</span>
                          <strong className="text-light">
                            {bookingSuccess.showtimeId?.screen} ({bookingSuccess.showtimeId?.format})
                          </strong>
                        </div>
                        <div className="col-6">
                          <span className="text-secondary d-block">Reserved Seats</span>
                          <strong className="text-warning fs-6">{bookingSuccess.seats?.join(', ')}</strong>
                        </div>
                        <div className="col-6">
                          <span className="text-secondary d-block">Total Paid</span>
                          <strong className="text-success fs-6">₹{bookingSuccess.totalAmount?.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-black rounded-3 text-center border border-secondary border-opacity-25">
                        <i className="bi bi-qr-code fs-1 text-light d-block mb-1"></i>
                        <span className="ticket-barcode">{bookingSuccess.bookingReference}</span>
                        <div className="text-secondary small mt-1" style={{ fontSize: '0.7rem' }}>
                          Scan at cinema entrance turnstile or box office kiosk
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Indian Payment Options */
                  <div>
                    {bookingError && (
                      <div className="alert alert-danger py-2 small mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> {bookingError}
                      </div>
                    )}

                    <div className="p-3 bg-dark rounded-3 mb-3 border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary small">Movie:</span>
                        <strong className="text-white small">{showtime.movieId?.title}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary small">Showtime:</span>
                        <strong className="text-white small">{showtime.date} at {showtime.time}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-secondary small">Seats:</span>
                        <strong className="text-warning small">{selectedSeats.map((s) => s.seatNumber).join(', ')}</strong>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top border-secondary border-opacity-25">
                        <span className="fw-bold text-light">Total to Pay:</span>
                        <strong className="text-success fs-5">₹{totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>

                    <h6 className="text-white fw-bold mb-2 small text-uppercase">Select Payment Method</h6>
                    <div className="d-flex flex-column gap-2 mb-4">
                      {['UPI / Google Pay / PhonePe', 'Credit / Debit Card (Visa, RuPay, MC)', 'Net Banking (SBI, HDFC, ICICI)', 'IMovies Cinema Wallet'].map((m) => (
                        <label
                          key={m}
                          className={`d-flex align-items-center justify-content-between p-3 rounded-3 border cursor-pointer transition-all ${
                            paymentMethod === m
                              ? 'border-danger bg-danger bg-opacity-10 text-white'
                              : 'border-secondary border-opacity-25 bg-dark text-secondary'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={paymentMethod === m}
                              onChange={() => setPaymentMethod(m)}
                              className="form-check-input mt-0"
                            />
                            <span className="fw-semibold text-light">{m}</span>
                          </div>
                          <i className="bi bi-shield-check text-success"></i>
                        </label>
                      ))}
                    </div>

                    <div className="text-secondary small mb-3 text-center">
                      <i className="bi bi-shield-lock me-1"></i> 256-bit SSL encrypted safe checkout simulation.
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                {bookingSuccess ? (
                  <div className="d-flex w-100 gap-2">
                    <button
                      className="btn btn-outline-cinema flex-grow-1"
                      onClick={() => window.print()}
                    >
                      <i className="bi bi-printer me-1"></i> Print Ticket
                    </button>
                    <button
                      className="btn btn-cinema flex-grow-1"
                      onClick={() => {
                        setShowModal(false);
                        navigate('/dashboard');
                      }}
                    >
                      <i className="bi bi-ticket-detailed me-1"></i> View in Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="d-flex w-100 gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-cinema"
                      onClick={() => setShowModal(false)}
                      disabled={bookingLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-cinema flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={handleConfirmBooking}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span> Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle fs-5"></i> Confirm & Pay ₹{totalAmount.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
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
