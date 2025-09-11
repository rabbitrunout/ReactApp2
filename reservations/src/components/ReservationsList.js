import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingReservation, setEditingReservation] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const reservationsPerPage = 6;
  const { user, loading } = useAuth(); // получаем пользователя и статус загрузки
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchReservations();
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchReservations = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/reservations.php?page=${currentPage}`, {
        withCredentials: true,
      });
      setReservations(res.data.reservations || []);
      setTotalReservations(res.data.totalReservations || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load reservations. Please try again.");
      setReservations([]);
      setTotalReservations(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_BASE}/resources.php`, { withCredentials: true });
      setResources(res.data.resources || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err);
    }
  };

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
        return "orange";
    }
  };

  const handleEditClick = (reservation) => {
    setEditingReservation({ ...reservation });
    setImageFile(null);
    setUpdateError("");
    setUpdateSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingReservation) return;

    setUpdateLoading(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const formData = new FormData();
      formData.append("id", editingReservation.id);
      formData.append("booking_date", editingReservation.booking_date);
      formData.append("start_time", editingReservation.start_time);
      formData.append("end_time", editingReservation.end_time);
      formData.append("resource_id", editingReservation.resource_id);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${API_BASE}/update-reservation.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        setUpdateSuccess("Reservation updated!");
        fetchReservations();
        setTimeout(() => setEditingReservation(null), 1000);
      } else {
        setUpdateError(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setUpdateError("Error updating reservation");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;

    try {
      await axios.post(`${API_BASE}/delete-reservation.php`, { id: reservationId }, {
        withCredentials: true,
      });
      fetchReservations();
    } catch (err) {
      console.error(err);
      alert("Failed to delete reservation. Check console for details.");
    }
  };

  if (loading) {
    return <p>Loading user info...</p>;
  }

  // Для отладки: показываем роль пользователя
  console.log("Current user:", user);

  return (
    <div className="container mt-4">
      <h2>All Reservations</h2>

      {isLoading && <p>Loading reservations...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!isLoading && reservations.length === 0 && <p>No reservations found.</p>}

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
                  <b>Resource:</b>{" "}
                  {resources.find(res => res.id === r.resource_id)?.name || "Unknown"}<br />
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

                <div className="d-flex gap-2 mt-auto">
                  <Link to={`/reservation/${r.id}`} className="btn btn-primary flex-grow-1">
                    View
                  </Link>

                  {/* Кнопки редактирования и удаления только для админа */}
                  {user?.role?.toLowerCase() === "admin" && (
                    <>
                      <button
                        className="btn btn-warning flex-grow-1"
                        onClick={() => handleEditClick(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center mt-4">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={goToPreviousPage}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={goToNextPage}>Next</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Модальное окно редактирования */}
      {editingReservation && user?.role?.toLowerCase() === "admin" && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleUpdate} encType="multipart/form-data">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Reservation</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingReservation(null)}></button>
                </div>
                <div className="modal-body">
                  {updateError && <div className="alert alert-danger">{updateError}</div>}
                  {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}
                  <div className="mb-3">
                    <label>Date</label>
                    <input type="date" className="form-control" name="booking_date" value={editingReservation?.booking_date || ""} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>Start Time</label>
                    <input type="time" className="form-control" name="start_time" value={editingReservation?.start_time || ""} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>End Time</label>
                    <input type="time" className="form-control" name="end_time" value={editingReservation?.end_time || ""} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label>Resource</label>
                    <select
                      name="resource_id"
                      className="form-control"
                      value={editingReservation?.resource_id || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select resource</option>
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label>Upload Image (optional)</label>
                    <input type="file" className="form-control" onChange={handleImageChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-warning" disabled={updateLoading}>
                    {updateLoading ? "Updating..." : "Update"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingReservation(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationsList;
