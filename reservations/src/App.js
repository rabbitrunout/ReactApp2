// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import ReservationsList from "./components/ReservationsList";
import Reservation from "./components/Reservation";
import CreateReservation from "./components/CreateReservation";
import EditReservation from "./components/EditReservation"; // новый компонент

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ReservationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservation/:id"
            element={
              <ProtectedRoute>
                <Reservation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateReservation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-reservation/:id"
            element={
              <ProtectedRoute>
                <EditReservation />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
