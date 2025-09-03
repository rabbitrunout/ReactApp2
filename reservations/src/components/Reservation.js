import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Reservation() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Получаем данные резервации
  const fetchReservation = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/reservation.php?id=${id}`
      );
      if (res.data.status === "success" && res.data.data) {
        setReservation(res.data.data);
        setError("");
      } else {
        setError("Reservation not found.");
      }
    } catch (err) {
      console.error("Error fetching reservation:", err);
      setError("Failed to fetch reservation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление статуса резервации
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/update-status.php`, {
        id,
        status: newStatus,
      });
      fetchReservation(); // обновляем данные после изменения статуса
    } catch (err) {
      console.error("Error updating status:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "orange"; // pending
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4 text-center">
      <h2>Reservation Details</h2>

      <p><b>Date:</b> {reservation.booking_date}</p>
      <p><b>Start:</b> {reservation.start_time}</p>
      <p><b>End:</b> {reservation.end_time}</p>
      <p><b>Resource:</b> {reservation.resource_name || "Unknown"}</p>

      <p style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
        <b>Status:</b>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <span style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: getStatusColor(reservation.status),
          }} />
          {reservation.status || "pending"}
        </span>
      </p>

      {/* 🖼️ Загруженное изображение */}
      {reservation.imageName && (
        <div className="my-3">
          <b>Uploaded Image:</b>
          <br />
          <img
            src={`${process.env.REACT_APP_API_BASE_URL}/uploads/${reservation.imageName}`}
            alt="Reservation"
            style={{ maxWidth: "400px", borderRadius: "10px", marginTop: "10px" }}
          />
        </div>
      )}

      <div className="d-flex justify-content-center gap-3 my-3">
        {reservation.status !== "confirmed" && (
          <button
            className="btn btn-success"
            onClick={() => updateStatus(reservation.id, "confirmed")}
          >
            Confirm
          </button>
        )}
        {reservation.status !== "cancelled" && (
          <button
            className="btn btn-danger"
            onClick={() => updateStatus(reservation.id, "cancelled")}
          >
            Cancel
          </button>
        )}
      </div>

      <Link to="/" className="btn btn-primary mt-3">
        Back to List
      </Link>
    </div>
  );
}

export default Reservation;
