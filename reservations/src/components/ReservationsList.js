import React, { useEffect, useState } from "react";
import axios from "axios";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const reservationsPerPage = 20; // совпадает с PHP

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/reservations.php?page=${currentPage}`
        );
        setReservations(response.data.reservations || []);
        setTotalReservations(response.data.totalReservations || 0);
      } catch (err) {
        console.error(err);
        setError("Failed to load reservations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, [currentPage]);

  const totalPages = Math.ceil(totalReservations / reservationsPerPage);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Reservations List</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {isLoading ? (
          <p>Loading reservations...</p>
        ) : reservations.length ? (
          reservations.map(r => (
            <div className="col-md-6" key={r.id}>
              <div className="card mb-4">
                <div className="card-body">
                  <p className="card-text">
                    <b>Date:</b> {r.booking_date}<br />
                    <b>Start:</b> {r.start_time}<br />
                    <b>End:</b> {r.end_time}<br />
                    <b>Resource:</b> {r.resource_id}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No reservations found.</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Reservations pagination">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={goToPreviousPage}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index} className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={goToNextPage}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default ReservationsList;
