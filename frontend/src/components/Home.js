// src/components/Home.js
import React from "react";
import "../CSS/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Our Website</h1>
      <p className="home-description">
        Explore our services and learn more about what we offer. We're here to help!
      </p>
      <button className="home-button">Learn More</button>
    </div>
  );
};

export default Home;
