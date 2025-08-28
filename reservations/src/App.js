import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // npm install react-router-dom
import './App.css';
import Navbar from './components/Navbar';
import CreateReservation from './components/CreateReservation';
import ReservationsList from './components/ReservationsList';
import Reservation from './components/Reservation';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
  <Route path="/" element={<ReservationsList />} />
  <Route path="/create-reservation" element={<CreateReservation />} />
  <Route path="/reservation/:id" element={<Reservation />} />
</Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;