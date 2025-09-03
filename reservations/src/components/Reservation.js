import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function Reservation() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const fetchReservation = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/reservation.php?id=${id}`);
      if (res.data.status === "success" && res.data.data) {
        setReservation(res.data.data);
      } else {
        setError("Reservation not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reservation.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!reservation) return;
    setStatusUpdating(true);
    try {
      await axios.post(`${API_BASE}/update-status.php`, {
        id: reservation.id,
        status: newStatus,
      });
      await fetchReservation(); // Обновляем данные после изменения
    } catch (err) {
      console.error("Error updating status:", err.response?.data || err.message);
      alert("Failed to update status. Check console for details.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "orange";
    }
  };

  useEffect(() => {
    fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

      {reservation.imageName && (
        <div className="my-3">
          <b>Uploaded Image:</b>
          <br />
          <img
            src={`${API_BASE}/uploads/${reservation.imageName}`}
            alt="Reservation"
            style={{ maxWidth: "400px", borderRadius: "10px", marginTop: "10px" }}
          />
        </div>
      )}

      <div className="d-flex justify-content-center gap-3 my-3">
        {reservation.status !== "confirmed" && (
          <button
            className="btn btn-success"
            onClick={() => updateStatus("confirmed")}
            disabled={statusUpdating}
          >
            {statusUpdating ? "Updating..." : "Confirm"}
          </button>
        )}
        {reservation.status !== "cancelled" && (
          <button
            className="btn btn-danger"
            onClick={() => updateStatus("cancelled")}
            disabled={statusUpdating}
          >
            {statusUpdating ? "Updating..." : "Cancel"}
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
