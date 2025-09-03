// src/components/CreateReservation.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function CreateReservation() {
  const { user } = useContext(AuthContext); // используем user
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [resources, setResources] = useState([]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Перенаправление неавторизованных пользователей
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Получаем список ресурсов для селекта
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/resources.php`
        );
        setResources(res.data.resources || []);
      } catch (err) {
        console.error("Error fetching resources:", err);
        setError("Failed to fetch resources.");
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

    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("bookingDate", bookingDate);
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append("resourceId", resourceId);
      if (image) formData.append("image", image);

      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/create-reservation.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      if (res.data.success) {
        setMessage(res.data.message); // ✅ Зеленое сообщение

        // Очистка полей формы
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        setResourceId("");
        setImage(null);

        // Через 1.5 секунды редирект на главную страницу
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(res.data.message || "Failed to create reservation.");
      }
    } catch (err) {
      console.error("Error submitting reservation:", err);
      setError(err.response?.data?.message || "Failed to create reservation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create a New Reservation</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Start Time</label>
          <input
            type="time"
            className="form-control"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>End Time</label>
          <input
            type="time"
            className="form-control"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Resource</label>
          <select
            className="form-control"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            required
          >
            <option value="">Select a resource</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>Upload Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? "Creating..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default CreateReservation;
