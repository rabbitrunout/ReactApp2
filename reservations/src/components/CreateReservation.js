import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateReservation() {
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [resources, setResources] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/resources.php`);
        setResources(res.data.resources);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !startTime || !endTime || !resourceId) {
      setError("Please fill in all fields.");
      return;
    }
    setError(""); setMessage(""); setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/create-reservation.php`, 
        { bookingDate, startTime, endTime, resourceId },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(res.data.message);
      setBookingDate(""); setStartTime(""); setEndTime(""); setResourceId("");
      navigate("/reservations");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reservation.");
    } finally { setIsLoading(false); }
  }

  return (
    <div className="container mt-4">
      <h2>Create a New Reservation</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input type="date" className="form-control mb-3" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required />
        <input type="time" className="form-control mb-3" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        <input type="time" className="form-control mb-3" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        <select className="form-control mb-3" value={resourceId} onChange={e => setResourceId(e.target.value)} required>
          <option value="">Select a resource</option>
          {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default CreateReservation;
