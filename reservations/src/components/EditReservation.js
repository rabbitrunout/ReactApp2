import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

function EditReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const [reservation, setReservation] = useState(null);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // ⚡ Используем useEffect один раз, eslint игнорируем
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await axios.get(`${API_BASE}/reservation.php?id=${id}`, { withCredentials: true });
        if (res.data.status === "success" && res.data.data) {
          setReservation(res.data.data);
        } else {
          setUpdateError("Reservation not found.");
        }
      } catch (err) {
        console.error(err);
        setUpdateError("Failed to fetch reservation.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchResources = async () => {
      try {
        const res = await axios.get(`${API_BASE}/resources.php`, { withCredentials: true });
        setResources(res.data.resources || []);
      } catch (err) {
        console.error("Failed to load resources", err);
      }
    };

    fetchReservation();
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservation((prev) => ({ ...prev, [name]: value }));
  };

  const handleResourceChange = (e) => {
    setReservation((prev) => ({ ...prev, resource_id: parseInt(e.target.value) }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!reservation) return;

    setStatusUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const formData = new FormData();
      formData.append("id", reservation.id);
      formData.append("booking_date", reservation.booking_date);
      formData.append("start_time", reservation.start_time);
      formData.append("end_time", reservation.end_time);
      formData.append("resource_id", reservation.resource_id);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${API_BASE}/update-reservation.php`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        setUpdateSuccess("Reservation updated successfully!");
        // ⚡ Обновляем страницу списка после успешного редактирования
        setTimeout(() => navigate("/"), 1000);
      } else {
        setUpdateError(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      setUpdateError("Error updating reservation");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!reservation) return <div className="alert alert-danger">{updateError}</div>;

  return (
    <div className="container mt-4">
      <h2>Edit Reservation</h2>

      {updateError && <div className="alert alert-danger">{updateError}</div>}
      {updateSuccess && <div className="alert alert-success">{updateSuccess}</div>}

      <form onSubmit={handleUpdate} encType="multipart/form-data">
        <div className="mb-3">
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            name="booking_date"
            value={reservation.booking_date || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Start Time</label>
          <input
            type="time"
            className="form-control"
            name="start_time"
            value={reservation.start_time || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>End Time</label>
          <input
            type="time"
            className="form-control"
            name="end_time"
            value={reservation.end_time || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Resource</label>
          <select
            className="form-control"
            name="resource_id"
            value={reservation.resource_id || ""}
            onChange={handleResourceChange}
            required
          >
            <option value="">Select resource</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Upload Image (optional)</label>
          <input type="file" className="form-control" onChange={handleImageChange} />
        </div>

        {reservation.imageName && (
          <div className="mb-3">
            <b>Current Image:</b>
            <br />
            <img
              src={`${API_BASE}/uploads/${reservation.imageName}`}
              alt="Reservation"
              style={{ maxWidth: "300px", marginTop: "10px", borderRadius: "8px" }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-warning" disabled={statusUpdating}>
          {statusUpdating ? "Updating..." : "Update Reservation"}
        </button>
        <Link to={`/reservation/${id}`} className="btn btn-secondary ms-2">
          Cancel
        </Link>
      </form>
    </div>
  );
}

export default EditReservation;