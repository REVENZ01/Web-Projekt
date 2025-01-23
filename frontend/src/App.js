import React from 'react';
import OffersList from './components/OffersList';
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Offer Management</h1>
      <OffersList />
      
      <Footer />

    </div>
  );
}

export default App;