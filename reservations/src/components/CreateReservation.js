import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateReservation() {
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!bookingDate || !startTime || !endTime || !resourceId) {
      setError("Please fill in all the fields.");
      return false;
    }
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/create-reservation.php`,
        { bookingDate, startTime, endTime, resourceId },
        { headers: { "Content-Type": "application/json" } }
      );

      setMessage(response.data.message || "Reservation created successfully!");
      setBookingDate(""); setStartTime(""); setEndTime(""); setResourceId("");
      navigate("/reservations");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create reservation.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mt-4">
      <h2>Create a New Reservation</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input type="date" className="form-control" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Start Time</label>
          <input type="time" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">End Time</label>
          <input type="time" className="form-control" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Resource ID</label>
          <input type="number" className="form-control" value={resourceId} onChange={e => setResourceId(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default CreateReservation;
