import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // npm install react-router-dom
import './App.css';
import Navbar from './components/Navbar';
import CreateReservation from './components/CreateReservation';
import ReservationsList from './components/ReservationsList';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<ReservationsList />} />
          <Route path="/create-reservation" element={<CreateReservation />} />
          {/* <Route path="/post/:id" element={<Post />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
