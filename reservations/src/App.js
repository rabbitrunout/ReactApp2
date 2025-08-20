import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // npm install react-router-dom
import './App.css';
import Navbar from './components/Navbar';
import CreateReservation from './components/CreateReservation';
// import Post from './components/Post';
// import PostList from './components/PostList';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* <Route path={"/"} element={<PostList />} /> */}
          <Route path={"/create-reservation"} element={<CreateReservation />} />
          {/* <Route path={"/post/:id"} element={<Post />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;