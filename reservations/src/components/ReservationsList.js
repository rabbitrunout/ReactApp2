import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reservationsPerPage = 6;

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/reservations.php?page=${currentPage}`);
        setReservations(res.data.reservations || []);
        setTotalReservations(res.data.totalReservations || 0);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Failed to load reservations. Please try again.");
        setReservations([]);
        setTotalReservations(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const totalPages = Math.ceil(totalReservations / reservationsPerPage);
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Reservations</h2>
        <Link to="/create" className="btn btn-success">
          Create New Reservation
        </Link>
      </div>

      {isLoading && <p>Loading reservations...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!isLoading && !error && reservations.length === 0 && <p>No reservations found.</p>}

      <div className="row">
        {reservations.map((r) => (
          <div key={r.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={
                  r.imageName
                    ? `${API_BASE}/uploads/${r.imageName}`
                    : `${process.env.PUBLIC_URL}/placeholder_100.jpg`
                }
                className="card-img-top"
                alt="Reservation"
                style={{
                  height: "250px",
                  width: "100%",
                  objectFit: r.imageName ? "cover" : "contain",
                  objectPosition: "center",
                  backgroundColor: r.imageName ? "transparent" : "#f0f0f0",
                }}
              />
              <div className="card-body d-flex flex-column">
                <p className="card-text mb-2">
                  <b>Date:</b> {r.booking_date}<br />
                  <b>Start:</b> {r.start_time}<br />
                  <b>End:</b> {r.end_time}<br />
                  <b>Resource:</b> {r.resource_name || "Unknown"}<br />
                  <b>Status:</b>{" "}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(r.status),
                      }}
                    />
                    {r.status || "pending"}
                  </span>
                </p>
                <Link
                  to={`/reservation/${r.id}`}
                  className="btn btn-primary mt-auto"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center mt-4">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={goToPreviousPage}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={goToNextPage}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default ReservationsList;
