import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'CANCELLED'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load your booking history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The reserved seats will be released and your refund will be processed.')) {
      return;
    }

    try {
      setActionLoading(bookingId);
      await API.put(`/bookings/${bookingId}/cancel`);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'CONFIRMED') return b.status === 'CONFIRMED';
    if (filterTab === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="container py-4 pb-5">
      {/* User Profile Header Card */}
      <div className="glass-card p-4 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="rounded-circle border border-2 border-danger shadow"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="text-white fw-bold mb-0">{user?.name}</h3>
                <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 small">
                  VIP Cinephile
                </span>
              </div>
              <p className="text-secondary small mb-1">{user?.email}</p>
              <div className="text-secondary small">
                <i className="bi bi-ticket-perforated me-1 text-warning"></i>
                <strong className="text-light">{bookings.length}</strong> Total Reservations
              </div>
            </div>
          </div>

          <div>
            <Link to="/" className="btn btn-cinema d-flex align-items-center gap-2">
              <i className="bi bi-film"></i> Browse More Movies
            </Link>
          </div>
        </div>
      </div>

      {/* Bookings Tabs & Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-ticket-detailed-fill text-danger"></i> My Movie Tickets
          </h4>
          <span className="text-secondary small">
            Manage your booked showtimes, view QR tickets, and check seat allocations.
          </span>
        </div>

        {/* Filter Pills */}
        <div className="btn-group bg-dark p-1 rounded-3 border border-secondary border-opacity-25">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`btn btn-sm px-3 rounded-2 ${filterTab === 'ALL' ? 'btn-danger' : 'text-secondary'}`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilterTab('CONFIRMED')}
            className={`btn btn-sm px-3 rounded-2 ${filterTab === 'CONFIRMED' ? 'btn-danger' : 'text-secondary'}`}
          >
            Active ({bookings.filter((b) => b.status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setFilterTab('CANCELLED')}
            className={`btn btn-sm px-3 rounded-2 ${filterTab === 'CANCELLED' ? 'btn-danger' : 'text-secondary'}`}
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
          <p className="text-secondary mt-3">Loading your tickets...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger p-4 text-center">
          <p className="mb-2">{error}</p>
          <button className="btn btn-outline-danger btn-sm" onClick={fetchBookings}>
            Try Again
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-card text-center py-5 p-4">
          <i className="bi bi-ticket-perforated fs-1 text-secondary opacity-50 mb-3 d-block"></i>
          <h5 className="text-white">No tickets found in this section</h5>
          <p className="text-secondary small">
            {filterTab === 'ALL'
              ? 'You have not booked any movie tickets yet. Explore current releases!'
              : `You have no ${filterTab.toLowerCase()} bookings.`}
          </p>
          <Link to="/" className="btn btn-cinema btn-sm mt-2">
            Book Tickets Now
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';

            return (
              <div className="col-lg-6" key={booking._id}>
                <div className={`ticket-stub shadow-sm ${isCancelled ? 'opacity-75' : ''}`}>
                  {/* Perforated Top Header */}
                  <div className="ticket-header">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <span
                          className={`badge mb-1 ${
                            isCancelled
                              ? 'bg-danger-subtle text-danger border border-danger border-opacity-50'
                              : 'bg-success-subtle text-success border border-success border-opacity-50'
                          }`}
                        >
                          {booking.status}
                        </span>
                        <h5 className="text-white fw-bold mb-0">{booking.movieId?.title}</h5>
                        <div className="text-secondary small">
                          <i className="bi bi-geo-alt me-1 text-danger"></i>
                          {booking.showtimeId?.theaterName}
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="text-secondary small d-block">Ticket ID</span>
                        <span className="badge bg-dark border border-secondary text-warning fw-mono">
                          {booking.bookingReference}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details Body */}
                  <div className="p-4 bg-dark bg-opacity-75">
                    <div className="row g-3 mb-3">
                      <div className="col-sm-3 col-4 text-center">
                        <img
                          src={booking.movieId?.posterUrl}
                          alt={booking.movieId?.title}
                          className="rounded-2 shadow-sm w-100"
                          style={{ maxHeight: '110px', objectFit: 'cover' }}
                        />
                      </div>

                      <div className="col-sm-9 col-8">
                        <div className="row g-2 small">
                          <div className="col-6">
                            <span className="text-secondary d-block">Date</span>
                            <strong className="text-light">
                              <i className="bi bi-calendar3 me-1 text-warning"></i>
                              {booking.showtimeId?.date}
                            </strong>
                          </div>
                          <div className="col-6">
                            <span className="text-secondary d-block">Showtime</span>
                            <strong className="text-light">
                              <i className="bi bi-clock me-1 text-warning"></i>
                              {booking.showtimeId?.time}
                            </strong>
                          </div>
                          <div className="col-6">
                            <span className="text-secondary d-block">Auditorium</span>
                            <span className="text-light">{booking.showtimeId?.screen}</span>
                          </div>
                          <div className="col-6">
                            <span className="text-secondary d-block">Format</span>
                            <span className="badge bg-secondary-subtle text-light">
                              {booking.showtimeId?.format}
                            </span>
                          </div>
                        </div>

                        {/* Seats tags */}
                        <div className="mt-2 pt-2 border-top border-secondary border-opacity-25">
                          <span className="text-secondary small d-block mb-1">Seats Booked:</span>
                          <div className="d-flex flex-wrap gap-1">
                            {booking.seats?.map((seatNum) => (
                              <span key={seatNum} className="badge bg-dark border border-warning text-warning">
                                {seatNum}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action bar */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-3 border-top border-secondary border-opacity-25">
                      <div>
                        <span className="text-secondary small d-block">Total Paid:</span>
                        <strong className="text-success fs-5">₹{booking.totalAmount?.toFixed(2)}</strong>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          onClick={() => setSelectedTicketForModal(booking)}
                          className="btn btn-outline-cinema btn-sm d-flex align-items-center gap-1"
                        >
                          <i className="bi bi-qr-code"></i> View Ticket
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={actionLoading === booking._id}
                            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            title="Cancel booking & release seats"
                          >
                            {actionLoading === booking._id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <>
                                <i className="bi bi-x-circle"></i> Cancel
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket QR Modal */}
      {selectedTicketForModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-secondary text-light">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <i className="bi bi-ticket-perforated-fill text-danger"></i> Digital Cinema Ticket
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedTicketForModal(null)}
                ></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="ticket-stub shadow-lg mx-auto" style={{ maxWidth: '420px' }}>
                  <div className="ticket-header text-start">
                    <span className={`badge mb-1 ${selectedTicketForModal.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                      {selectedTicketForModal.status}
                    </span>
                    <h4 className="fw-bold text-white mb-0">{selectedTicketForModal.movieId?.title}</h4>
                    <span className="text-secondary small">{selectedTicketForModal.showtimeId?.theaterName}</span>
                  </div>

                  <div className="p-4 bg-dark text-start">
                    <div className="row g-2 small mb-3">
                      <div className="col-6">
                        <span className="text-secondary d-block">Date</span>
                        <strong className="text-light">{selectedTicketForModal.showtimeId?.date}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-secondary d-block">Time</span>
                        <strong className="text-light">{selectedTicketForModal.showtimeId?.time}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-secondary d-block">Screen</span>
                        <strong className="text-light">{selectedTicketForModal.showtimeId?.screen}</strong>
                      </div>
                      <div className="col-6">
                        <span className="text-secondary d-block">Seats</span>
                        <strong className="text-warning fs-6">{selectedTicketForModal.seats?.join(', ')}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-black rounded-3 text-center border border-secondary border-opacity-25 my-3">
                      <i className="bi bi-qr-code fs-1 text-light d-block mb-1"></i>
                      <div className="ticket-barcode">{selectedTicketForModal.bookingReference}</div>
                      <span className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                        Scan at theater gate for turnstile entry
                      </span>
                    </div>

                    <div className="d-flex justify-content-between small text-secondary">
                      <span>Payment Method: {selectedTicketForModal.paymentMethod}</span>
                      <strong className="text-success">₹{selectedTicketForModal.totalAmount?.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-outline-cinema"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i> Print / Save PDF
                </button>
                <button
                  type="button"
                  className="btn btn-cinema"
                  onClick={() => setSelectedTicketForModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

