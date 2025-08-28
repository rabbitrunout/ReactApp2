/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // <- Link добавлен
import axios from "axios";

function Reservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservation.php?id=${id}`);
        setReservation(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReservation();
  }, [id]);

  const getStatusColor = (status) => {
    switch(status) {
      case "confirmed": return "green";
      case "cancelled": return "red";
      default: return "orange"; // pending
    }
  }

  const updateStatus = async (id, newStatus) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/update-status.php`,
      { id, status: newStatus }
    );
    console.log(res.data.message); // Для отладки
    // Обновляем состояние локально, чтобы сразу видеть изменения
    setReservation(prev => ({ ...prev, status: newStatus }));
  } catch (err) {
    console.error("Error updating status:", err.response?.data || err.message);
  }
};


  if (!reservation) return <div>Loading...</div>;

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
            backgroundColor: getStatusColor(reservation.status)
          }} />
          {reservation.status || "pending"}
        </span>
      </p>

      <div className="d-flex justify-content-center gap-3 my-3">
        {reservation.status !== "confirmed" && (
          <button className="btn btn-success" onClick={() => updateStatus(reservation.id, "confirmed")}>
            Confirm
          </button>
        )}
        {reservation.status !== "cancelled" && (
          <button className="btn btn-danger" onClick={() => updateStatus(reservation.id, "cancelled")}>
            Cancel
          </button>
        )}
      </div>

      {/* Кнопка "Вернуться к списку" */}
      <Link to="/" className="btn btn-primary mt-3">
        Back to List
      </Link>
    </div>
  );
}

export default Reservation;
