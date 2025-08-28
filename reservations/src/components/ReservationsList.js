import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const reservationsPerPage = 4;

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/reservations.php?page=${currentPage}`
        );
        setReservations(res.data.reservations);
        setTotalReservations(res.data.totalReservations);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
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
        <h2>Reservations</h2>
        <Link to="/create-reservation" className="btn btn-success">
          Create New Reservation
        </Link>
      </div>

      {isLoading ? (
        <p>Loading reservations...</p>
      ) : (
        reservations.map((r) => (
          <div key={r.id} className="card mb-3">
            <div className="card-body">
              <p>
                <b>Date:</b> {r.booking_date}<br />
                <b>Start:</b> {r.start_time}<br />
                <b>End:</b> {r.end_time}<br />
                <b>Resource:</b> {r.resource_name || "Unknown"}<br />
                <b>Status:</b>{" "}
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
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
              <Link to={`/reservation/${r.id}`} className="btn btn-primary">
                View
              </Link>
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      <nav aria-label="Page navigation">
        <ul className="pagination">
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
    </div>
  );
}

export default ReservationsList;
